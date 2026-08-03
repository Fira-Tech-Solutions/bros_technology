import client from "./client";

export async function generateAgentCode(data) {
  return client.post("/api/auth/agent-codes", data, { timeout: 15000 });
}

export async function getAgentCodes() {
  return client.get("/api/auth/agent-codes");
}

export async function revokeAgentCode(id) {
  return client.delete(`/api/auth/agent-codes/${id}`);
}

export async function getAgents() {
  return client.get("/api/auth/agents");
}

export async function removeAgent(id) {
  return client.delete(`/api/auth/agents/${id}`);
}
