import type { LoginFlow, MockSession } from "./types";
import type {
  MockIdentity,
  StoredRegistrationFlow,
} from "./types";

// login
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

// register
const registrationFlows = new Map<string, StoredRegistrationFlow>();
const identities = new Map<string, MockIdentity>();

export function saveRegistrationFlow(
  storedFlow: StoredRegistrationFlow,
): void {
  registrationFlows.set(storedFlow.flow.id, storedFlow);
}

export function getRegistrationFlow(
  flowId: string,
): StoredRegistrationFlow | undefined {
  return registrationFlows.get(flowId);
}

export function deleteRegistrationFlow(flowId: string): void {
  registrationFlows.delete(flowId);
}

export function saveIdentity(identity: MockIdentity): void {
  identities.set(identity.id, identity);
}

export function getIdentityById(
  identityId: string,
): MockIdentity | undefined {
  return identities.get(identityId);
}

export function findIdentityByEmail(
  email: string,
): MockIdentity | undefined {
  const normalizedEmail = email.trim().toLowerCase();

  return Array.from(identities.values()).find(
    (identity) =>
      identity.traits.email.trim().toLowerCase() === normalizedEmail,
  );
}

export function clearMockState(): void {
  loginFlows.clear();
  sessions.clear();
  registrationFlows.clear();
  identities.clear();
}
