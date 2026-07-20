import { HttpResponse, http } from "msw";
import {
  createMockLoginFlow,
  MOCK_LOGIN_FLOW_ID,
  MOCK_LOGIN_FLOW_LIFESPAN_MS,
  type MockLoginFlowState,
} from "./login-flow";

const flows = new Map<string, MockLoginFlowState>();

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
  if (!flows.has(id)) {
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
}

export function seedMockLoginFlow(
  origin = "http://localhost:3000",
  now = new Date(),
  id = MOCK_LOGIN_FLOW_ID,
): MockLoginFlowState {
  const expiresAt = new Date(now.getTime() + MOCK_LOGIN_FLOW_LIFESPAN_MS);
  const state = { flow: createMockLoginFlow(origin, now, expiresAt, id), issuedAt: now, expiresAt };
  flows.set(id, state);
  return state;
}

export function expireMockLoginFlow(): void {
  const state = flows.get(MOCK_LOGIN_FLOW_ID);
  if (state) {
    state.expiresAt = new Date(0);
  }
}

export const getLoginFlowHandler = http.get("*/auth/self-service/login/flows", ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // Opening the UI URL reloads the page-side handler module and its Map.
  // Recreate the flow so the subsequent lookup and later refresh work.
  if (id && !flows.has(id)) {
    seedMockLoginFlow(url.origin, new Date(), id);
  }
  const state = findFlow(id);
  return state instanceof Response ? state : HttpResponse.json(state.flow);
});

export const initializeLoginFlowHandler = http.get(
  "*/auth/self-service/login/browser",
  ({ request }) => {
    const url = new URL(request.url);
    const id = crypto.randomUUID();
    const state = seedMockLoginFlow(url.origin, new Date(), id);
    return HttpResponse.json(state.flow);
  },
);

export const loginHandlers = [initializeLoginFlowHandler, getLoginFlowHandler];
