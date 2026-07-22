import type { LoginFlow, MockSession } from "./types";

const loginFlows = new Map<string, LoginFlow>();
const sessions = new Map<string, MockSession>();

export function saveLoginFlow(flow: LoginFlow): void {
  loginFlows.set(flow.id, flow);
}

export function getLoginFlow(id: string): LoginFlow | undefined {
  return loginFlows.get(id);
}

export function deleteLoginFlow(id: string): void {
  loginFlows.delete(id);
}

export function saveSession(token: string, session: MockSession): void {
  sessions.set(token, session);
}

export function getSession(token: string): MockSession | undefined {
  return sessions.get(token);
}

export function clearMockState(): void {
  loginFlows.clear();
  sessions.clear();
}
