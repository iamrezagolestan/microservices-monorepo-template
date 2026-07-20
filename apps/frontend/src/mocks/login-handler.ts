import { HttpResponse, http } from "msw";
import {
  createMockLoginFlow,
  MOCK_LOGIN_FLOW_ID,
  MOCK_LOGIN_FLOW_LIFESPAN_MS,
  MOCK_LOGIN_SESSION_COOKIE,
  MOCK_LOGIN_SESSION_ID,
  MOCK_LOGIN_USER,
  type MockLoginFlowState,
} from "./login-flow";

const flows = new Map<string, MockLoginFlowState>();
let authenticated = false;

const errorStatuses = new Map([
  [400, "Bad Request"],
  [404, "Not Found"],
  [410, "Gone"],
]);

function jsonError(status: number, reason: string) {
  return HttpResponse.json(
    { error: { code: status, status: errorStatuses.get(status) ?? "Bad Request", reason } },
    { status },
  );
}

function findFlow(id: string | null): MockLoginFlowState | Response {
  if (!id) {
    return jsonError(400, "The flow id is missing.");
  }
  if (id !== MOCK_LOGIN_FLOW_ID || !flows.has(id)) {
    return jsonError(404, "The flow does not exist.");
  }
  const state = flows.get(id);
  if (!state) {
    return jsonError(404, "The flow does not exist.");
  }
  if (state.expiresAt <= new Date()) {
    flows.delete(id);
    return jsonError(410, "The flow has expired.");
  }
  return state;
}

export function resetMockLoginState(): void {
  flows.clear();
  authenticated = false;
}

export function seedMockLoginFlow(
  origin = "http://localhost:3000",
  now = new Date(),
): MockLoginFlowState {
  const expiresAt = new Date(now.getTime() + MOCK_LOGIN_FLOW_LIFESPAN_MS);
  const state = { flow: createMockLoginFlow(origin, now, expiresAt), issuedAt: now, expiresAt };
  flows.set(MOCK_LOGIN_FLOW_ID, state);
  return state;
}

export function expireMockLoginFlow(): void {
  const state = flows.get(MOCK_LOGIN_FLOW_ID);
  if (state) {
    state.expiresAt = new Date(0);
  }
}

export const getLoginFlowHandler = http.get(
  "*/auth/self-service/login/flows",
  ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // The fixed local browser URL stands in for Kratos's flow-init redirect.
    // Its first GET creates the flow; arbitrary IDs must never create one.
    if (id === MOCK_LOGIN_FLOW_ID && !flows.has(id)) {
      seedMockLoginFlow(url.origin);
    }
    const state = findFlow(id);
    return state instanceof Response ? state : HttpResponse.json(state.flow);
  },
);

export const loginHandlers = [getLoginFlowHandler];
