import { Hono } from "hono";
import { createLoginFlow, getFlowCsrfToken, isLoginFlowExpired } from "./login-flow";
import { deleteLoginFlow, getLoginFlow, saveLoginFlow, saveSession } from "./store";
import type { LoginFlow, UiText } from "./types";

export const loginRoutes = new Hono();

const FRONTEND_LOGIN_PATH = "/auth/login";
const SUCCESS_REDIRECT_PATH = "/";

function getStringField(
  body: Record<string, string | File | Array<string | File>>,
  field: string,
): string | undefined {
  const value = body[field];
  return typeof value === "string" ? value : undefined;
}

function updateIdentifier(flow: LoginFlow, identifier: string): void {
  const identifierNode = flow.ui.nodes.find((node) => node.attributes.name === "identifier");
  if (identifierNode) {
    identifierNode.attributes.value = identifier;
  }
}

function addLoginError(flow: LoginFlow, message: string): void {
  const error: UiText = {
    id: 4_000_006,
    text: message,
    type: "error",
  };
  flow.ui.messages = [error];
  flow.updated_at = new Date().toISOString();
}
loginRoutes.get("/browser", (c) => {
  const requestUrl = new URL(c.req.url);
  const flow = createLoginFlow(requestUrl.origin);
  saveLoginFlow(flow);
  const acceptHeader = c.req.header("accept") ?? "";
  const expectsJson = acceptHeader.toLowerCase().includes("application/json");

  if (expectsJson) {
    return c.json(flow, 200);
  }
  return c.redirect(`${FRONTEND_LOGIN_PATH}?flow=${encodeURIComponent(flow.id)}`, 303);
});
loginRoutes.get("/flows", (c) => {
  const flowId = c.req.query("id");
  if (!flowId) {
    return c.json(
      {
        error: {
          id: "missing_flow_id",
          message: "The flow id query parameter is required.",
        },
      },
      400,
    );
  }
  const flow = getLoginFlow(flowId);
  if (!flow) {
    return c.json(
      {
        error: {
          id: "self_service_flow_not_found",
          message: "The requested login flow could not be found.",
        },
      },
      404,
    );
  }
  if (isLoginFlowExpired(flow)) {
    deleteLoginFlow(flowId);
    return c.json(
      {
        error: {
          id: "self_service_flow_expired",
          message: "The login flow has expired.",
        },
      },
      410,
    );
  }
  return c.json(flow);
});
loginRoutes.post("/", async (c) => {
  const flowId = c.req.query("flow");
  if (!flowId) {
    return c.json(
      {
        error: {
          id: "missing_flow_id",
          message: "The flow query parameter is required.",
        },
      },
      400,
    );
  }
  const flow = getLoginFlow(flowId);
  if (!flow) {
    return c.redirect(FRONTEND_LOGIN_PATH, 303);
  }
  if (isLoginFlowExpired(flow)) {
    deleteLoginFlow(flowId);
    return c.redirect(FRONTEND_LOGIN_PATH, 303);
  }
  const body = await c.req.parseBody();
  const identifier = getStringField(body, "identifier");
  const password = getStringField(body, "password");
  const method = getStringField(body, "method");
  const csrfToken = getStringField(body, "csrf_token");
  const expectedCsrfToken = getFlowCsrfToken(flow);
  flow.ui.messages = undefined;
  if (identifier) {
    updateIdentifier(flow, identifier);
  }
  flow.updated_at = new Date().toISOString();
  if (!csrfToken || csrfToken !== expectedCsrfToken) {
    addLoginError(flow, "The CSRF token is invalid or missing.");
    saveLoginFlow(flow);
    return c.redirect(`${FRONTEND_LOGIN_PATH}?flow=${encodeURIComponent(flow.id)}`, 303);
  }
  if (method !== "password") {
    addLoginError(flow, "The selected login method is not supported.");
    saveLoginFlow(flow);
    return c.redirect(`${FRONTEND_LOGIN_PATH}?flow=${encodeURIComponent(flow.id)}`, 303);
  }
  if (!(identifier && password)) {
    addLoginError(flow, "Identifier and password are required.");
    saveLoginFlow(flow);
    return c.redirect(`${FRONTEND_LOGIN_PATH}?flow=${encodeURIComponent(flow.id)}`, 303);
  }
  const isValidCredentials = identifier === "test@example.com" && password === "password123";
  if (!isValidCredentials) {
    addLoginError(
      flow,
      "The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.",
    );
    saveLoginFlow(flow);
    return c.redirect(`${FRONTEND_LOGIN_PATH}?flow=${encodeURIComponent(flow.id)}`, 303);
  }
  const sessionToken = crypto.randomUUID();
  saveSession(sessionToken, {
    id: crypto.randomUUID(),
    identity: {
      id: crypto.randomUUID(),
      traits: {
        email: identifier,
      },
    },
    authenticated_at: new Date().toISOString(),
  });
  deleteLoginFlow(flow.id);
  c.header(
    "Set-Cookie",
    [
      `mock_kratos_session=${encodeURIComponent(sessionToken)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=3600",
    ].join("; "),
  );
  return c.redirect(SUCCESS_REDIRECT_PATH, 303);
});
