#!/usr/bin/env tsx

import { AGENT_DEFINITIONS } from "../lib/substacker-agents";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function getExistingAgent(name: string): Promise<{ id: string } | null> {
  try {
    const response = await fetch(`${AGENT_API_URL}/agents`, {
      headers: {
        ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const items = data.items || data;
    if (!Array.isArray(items)) return null;
    return items.find((item: { name: string }) => item.name === name) || null;
  } catch {
    return null;
  }
}

async function updateAgent(agentId: string, agent: (typeof AGENT_DEFINITIONS)[number]) {
  const response = await fetch(`${AGENT_API_URL}/agents/definitions/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    },
    body: JSON.stringify(agent),
  });
  if (!response.ok) {
    const error = await response.text();
    if (response.status === 403 && error.includes("Built-in")) {
      console.log(`Agent "${agent.name}" exists as built-in; skipping update.`);
      return;
    }
    throw new Error(`Failed to update ${agent.name}: ${response.status} ${error}`);
  }
}

async function createOrUpdateAgent(agent: (typeof AGENT_DEFINITIONS)[number]) {
  const existing = await getExistingAgent(agent.name);
  if (existing) {
    await updateAgent(existing.id, agent);
    console.log(`Updated ${agent.name}`);
    return;
  }
  const response = await fetch(`${AGENT_API_URL}/agents/definitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    },
    body: JSON.stringify(agent),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${agent.name}: ${response.status} ${error}`);
  }
  console.log(`Created ${agent.name}`);
}

async function main() {
  console.log(`Seeding substacker agents against ${AGENT_API_URL}`);
  for (const agent of AGENT_DEFINITIONS) {
    await createOrUpdateAgent(agent);
  }
  console.log("Done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
