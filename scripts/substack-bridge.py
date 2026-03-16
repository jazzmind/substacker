#!/usr/bin/env python3
"""
Substack Bridge - Thin wrapper around python-substack for Next.js integration.

Called as a subprocess from the Next.js API routes. Communicates via JSON on
stdin/stdout.

Usage:
    echo '{"action":"list_drafts","publication_url":"https://pub.substack.com"}' | python3 substack-bridge.py

Actions:
    list_drafts       - List draft posts
    list_published    - List published posts
    create_draft      - Create a new draft (requires title, content)
    publish_post      - Publish a draft (requires post_id)
    get_post          - Get post content (requires post_id)
    get_subscribers   - Get subscriber count

Environment:
    SUBSTACK_EMAIL           - Email for authentication
    SUBSTACK_PASSWORD        - Password for authentication
    SUBSTACK_SESSION_TOKEN   - Alternative: session token auth
"""

import json
import os
import sys
import tempfile
from typing import Any


def get_client(publication_url: str):
    """Create an authenticated Substack API client."""
    try:
        from substack import Api as SubstackApi
    except ImportError:
        return None, "python-substack not installed. Run: pip install python-substack"

    email = os.getenv("SUBSTACK_EMAIL")
    password = os.getenv("SUBSTACK_PASSWORD")
    session_token = os.getenv("SUBSTACK_SESSION_TOKEN")

    if session_token:
        cookies = {"substack.sid": session_token}
        fd, cookies_path = tempfile.mkstemp(suffix=".json", text=True)
        try:
            os.chmod(cookies_path, 0o600)
            with os.fdopen(fd, "w") as f:
                json.dump(cookies, f)
        except Exception:
            os.close(fd)
            os.unlink(cookies_path)
            return None, "Failed to write session cookies"

        try:
            client = SubstackApi(
                cookies_path=cookies_path,
                publication_url=publication_url,
            )
            return client, None
        finally:
            if os.path.exists(cookies_path):
                os.unlink(cookies_path)

    elif email and password:
        try:
            client = SubstackApi(
                email=email,
                password=password,
                publication_url=publication_url,
            )
            return client, None
        except Exception as e:
            return None, f"Auth failed: {str(e)}"
    else:
        return None, "No credentials. Set SUBSTACK_SESSION_TOKEN or SUBSTACK_EMAIL+SUBSTACK_PASSWORD"


def list_drafts(client) -> list[dict]:
    """List draft posts."""
    try:
        drafts = client.get_drafts()
        return [
            {
                "id": str(d.get("id", "")),
                "title": d.get("title", ""),
                "subtitle": d.get("subtitle", ""),
                "created_at": d.get("post_date", ""),
            }
            for d in (drafts or [])
        ]
    except Exception as e:
        raise RuntimeError(f"Failed to list drafts: {e}")


def list_published(client) -> list[dict]:
    """List published posts."""
    try:
        posts = client.get_posts()
        return [
            {
                "id": str(p.get("id", "")),
                "title": p.get("title", ""),
                "subtitle": p.get("subtitle", ""),
                "slug": p.get("slug", ""),
                "published_at": p.get("post_date", ""),
                "audience": p.get("audience", "everyone"),
            }
            for p in (posts or [])
        ]
    except Exception as e:
        raise RuntimeError(f"Failed to list published: {e}")


def create_draft(client, title: str, content: str, subtitle: str = "") -> dict:
    """Create a draft post."""
    try:
        body = [{"type": "paragraph", "content": [{"type": "text", "text": para}]}
                for para in content.split("\n\n") if para.strip()]

        draft = client.post_draft(
            {
                "title": title,
                "subtitle": subtitle,
                "body": json.dumps({"type": "doc", "content": body}),
                "draft": True,
                "audience": "everyone",
            }
        )
        return {
            "id": str(draft.get("id", "")),
            "title": draft.get("title", ""),
            "slug": draft.get("slug", ""),
        }
    except Exception as e:
        raise RuntimeError(f"Failed to create draft: {e}")


def publish_post(client, post_id: str) -> dict:
    """Publish a draft post."""
    try:
        result = client.put_post(post_id, {"draft": False})
        return {
            "id": str(result.get("id", post_id)),
            "published": True,
        }
    except Exception as e:
        raise RuntimeError(f"Failed to publish: {e}")


def get_post(client, post_id: str) -> dict:
    """Get post content."""
    try:
        post = client.get_post(post_id)
        return {
            "id": str(post.get("id", "")),
            "title": post.get("title", ""),
            "subtitle": post.get("subtitle", ""),
            "body_html": post.get("body_html", ""),
            "audience": post.get("audience", ""),
            "slug": post.get("slug", ""),
        }
    except Exception as e:
        raise RuntimeError(f"Failed to get post: {e}")


def get_subscribers(client) -> dict:
    """Get subscriber count."""
    try:
        count = client.get_subscriber_count()
        return {"count": count}
    except Exception as e:
        raise RuntimeError(f"Failed to get subscribers: {e}")


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"error": "No input provided"}))
        sys.exit(1)

    try:
        request = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    action = request.get("action")
    publication_url = request.get("publication_url")

    if not action:
        print(json.dumps({"error": "Missing 'action' field"}))
        sys.exit(1)

    if not publication_url:
        print(json.dumps({"error": "Missing 'publication_url' field"}))
        sys.exit(1)

    client, error = get_client(publication_url)
    if error:
        print(json.dumps({"error": error}))
        sys.exit(1)

    handlers: dict[str, Any] = {
        "list_drafts": lambda: list_drafts(client),
        "list_published": lambda: list_published(client),
        "create_draft": lambda: create_draft(
            client,
            request.get("title", ""),
            request.get("content", ""),
            request.get("subtitle", ""),
        ),
        "publish_post": lambda: publish_post(client, request.get("post_id", "")),
        "get_post": lambda: get_post(client, request.get("post_id", "")),
        "get_subscribers": lambda: get_subscribers(client),
    }

    handler = handlers.get(action)
    if not handler:
        print(json.dumps({"error": f"Unknown action: {action}"}))
        sys.exit(1)

    try:
        result = handler()
        print(json.dumps({"success": True, "data": result}))
    except RuntimeError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
