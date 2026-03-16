/**
 * Substack Client - TypeScript wrapper for the Python substack-bridge.py script.
 *
 * Calls the Python bridge as a subprocess, passing JSON on stdin and reading
 * JSON from stdout.
 */

import { spawn } from 'child_process';
import path from 'path';

interface BridgeResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
}

interface SubstackDraft {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
}

interface SubstackPublished {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  published_at: string;
  audience: string;
}

interface SubstackCreatedDraft {
  id: string;
  title: string;
  slug: string;
}

interface SubstackPost {
  id: string;
  title: string;
  subtitle: string;
  body_html: string;
  audience: string;
  slug: string;
}

interface SubstackSubscribers {
  count: number;
}

const BRIDGE_SCRIPT = path.join(process.cwd(), 'scripts', 'substack-bridge.py');

async function callBridge<T>(payload: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [BRIDGE_SCRIPT], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        try {
          const parsed: BridgeResponse = JSON.parse(stdout);
          reject(new Error(parsed.error || `Bridge exited with code ${code}: ${stderr}`));
        } catch {
          reject(new Error(`Bridge exited with code ${code}: ${stderr || stdout}`));
        }
        return;
      }

      try {
        const parsed: BridgeResponse<T> = JSON.parse(stdout);
        if (parsed.error) {
          reject(new Error(parsed.error));
        } else {
          resolve(parsed.data as T);
        }
      } catch {
        reject(new Error(`Failed to parse bridge output: ${stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn bridge: ${err.message}`));
    });

    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();
  });
}

export async function listDrafts(publicationUrl: string): Promise<SubstackDraft[]> {
  return callBridge<SubstackDraft[]>({
    action: 'list_drafts',
    publication_url: publicationUrl,
  });
}

export async function listPublished(publicationUrl: string): Promise<SubstackPublished[]> {
  return callBridge<SubstackPublished[]>({
    action: 'list_published',
    publication_url: publicationUrl,
  });
}

export async function createDraft(
  publicationUrl: string,
  title: string,
  content: string,
  subtitle?: string
): Promise<SubstackCreatedDraft> {
  return callBridge<SubstackCreatedDraft>({
    action: 'create_draft',
    publication_url: publicationUrl,
    title,
    content,
    subtitle: subtitle || '',
  });
}

export async function publishPost(
  publicationUrl: string,
  postId: string
): Promise<{ id: string; published: boolean }> {
  return callBridge<{ id: string; published: boolean }>({
    action: 'publish_post',
    publication_url: publicationUrl,
    post_id: postId,
  });
}

export async function getSubstackPost(
  publicationUrl: string,
  postId: string
): Promise<SubstackPost> {
  return callBridge<SubstackPost>({
    action: 'get_post',
    publication_url: publicationUrl,
    post_id: postId,
  });
}

export async function getSubscriberCount(
  publicationUrl: string
): Promise<number> {
  const result = await callBridge<SubstackSubscribers>({
    action: 'get_subscribers',
    publication_url: publicationUrl,
  });
  return result.count;
}
