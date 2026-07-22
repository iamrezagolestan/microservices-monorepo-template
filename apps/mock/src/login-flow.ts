import type { LoginFlow, UiNode } from "./types";

const FLOW_LIFETIME_MS = 10 * 60 * 1000;

function createLoginNodes(csrfToken: string): UiNode[] {
  return [
    {
      type: "input",
      group: "default",
      attributes: {
        name: "csrf_token",
        type: "hidden",
        value: csrfToken,
        required: true
      },
      messages: [],
      meta: {}
    },
    {
      type: "input",
      group: "default",
      attributes: {
        name: "identifier",
        type: "text",
        required: true
      },
      messages: [],
      meta: {
        label: {
          id: 1070004,
          text: "ID"
        }
      }
    },
    {
      type: "input",
      group: "password",
      attributes: {
        name: "password",
        type: "password",
        required: true
      },
      messages: [],
      meta: {
        label: {
          id: 1070001,
          text: "Password"
        }
      }
    },
    {
      type: "input",
      group: "password",
      attributes: {
        name: "method",
        type: "submit",
        value: "password"
      },
      messages: [],
      meta: {
        label: {
          id: 1010001,
          text: "Sign in"
        }
      }
    }
  ];
}

export function createLoginFlow(origin: string): LoginFlow {
  const id = crypto.randomUUID();
  const csrfToken = crypto.randomUUID();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + FLOW_LIFETIME_MS);

  return {
    id,
    organization_id: null,
    type: "browser",
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    request_url: `${origin}/auth/self-service/login/browser`,
    ui: {
      action: `/auth/self-service/login?flow=${id}`,
      method: "POST",
      nodes: createLoginNodes(csrfToken),
      messages: []
    }
  };
}

export function isLoginFlowExpired(flow: LoginFlow): boolean {
  return Date.now() >= new Date(flow.expires_at).getTime();
}

export function getFlowCsrfToken(flow: LoginFlow): string | undefined {
  const node = flow.ui.nodes.find(
    (item) => item.attributes.name === "csrf_token"
  );

  const value = node?.attributes.value;

  return typeof value === "string" ? value : undefined;
}
