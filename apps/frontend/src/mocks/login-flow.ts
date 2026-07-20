export const MOCK_LOGIN_FLOW_ID = "00000000-0000-4000-8000-000000000001";
export const MOCK_LOGIN_FLOW_LIFESPAN_MS = 10 * 60 * 1000;
export const MOCK_LOGIN_SESSION_COOKIE = "ory_kratos_session";
export const MOCK_LOGIN_SESSION_ID = "local-msw-session";
export const MOCK_LOGIN_USER = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "user@e2e.localtest.me",
  password: "Pr0duct-e2e-Sessi0n!",
} as const;

export const INVALID_CREDENTIALS_MESSAGE = {
  id: 4_000_006,
  text: "The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.",
  type: "error",
} as const;

export type MockUiText = {
  id: number;
  text: string;
  type: "info" | "error";
  context?: Record<string, never>;
};

export type MockUiNode = {
  type: "input";
  group: "default" | "password";
  attributes: {
    name: string;
    type: "email" | "hidden" | "password" | "submit";
    value?: string;
    required?: boolean;
    disabled: boolean;
    node_type: "input";
  };
  messages: MockUiText[];
  meta: { label: MockUiText };
};

export type MockLoginFlow = {
  id: string;
  type: "browser";
  state: "choose_method";
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: {
    action: string;
    method: "POST";
    messages: MockUiText[];
    nodes: MockUiNode[];
  };
};

export type MockLoginFlowState = {
  flow: MockLoginFlow;
  issuedAt: Date;
  expiresAt: Date;
};

function text(id: number, value: string): MockUiText {
  return { id, text: value, type: "info", context: {} };
}

export function createMockLoginFlow(
  origin: string,
  issuedAt: Date,
  expiresAt: Date,
  id = MOCK_LOGIN_FLOW_ID,
): MockLoginFlow {
  return {
    id,
    type: "browser",
    state: "choose_method",
    expires_at: expiresAt.toISOString(),
    issued_at: issuedAt.toISOString(),
    request_url: `${origin}/auth/self-service/login/browser`,
    ui: {
      action: `${origin}/auth/self-service/login?flow=${id}`,
      method: "POST",
      messages: [],
      nodes: [
        {
          type: "input",
          group: "default",
          attributes: {
            name: "csrf_token",
            type: "hidden",
            value: "local-msw-csrf-token",
            required: true,
            disabled: false,
            node_type: "input",
          },
          messages: [],
          meta: { label: text(1_070_002, "CSRF Token") },
        },
        {
          type: "input",
          group: "default",
          attributes: {
            name: "identifier",
            type: "email",
            value: "",
            required: true,
            disabled: false,
            node_type: "input",
          },
          messages: [],
          meta: { label: text(1_070_004, "Email") },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            name: "password",
            type: "password",
            required: true,
            disabled: false,
            node_type: "input",
          },
          messages: [],
          meta: { label: text(1_070_001, "Password") },
        },
        {
          type: "input",
          group: "password",
          attributes: {
            name: "method",
            type: "submit",
            value: "password",
            disabled: false,
            node_type: "input",
          },
          messages: [],
          meta: { label: text(1_010_001, "Sign in with password") },
        },
      ],
    },
  };
}
