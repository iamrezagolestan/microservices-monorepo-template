import type { LoginFlow, UiNode } from "./types";

const FLOW_LIFETIME_MS = 60 * 60 * 1000;

function createCsrfToken(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);

  return Buffer.from(bytes).toString("base64");
}

function createLoginNodes(csrfToken: string): UiNode[] {
  return [
    {
      type: "input",
      group: "default",
      attributes: {
        name: "csrf_token",
        type: "hidden",
        value: csrfToken,
        required: true,
        disabled: false,
        node_type: "input",
      },
      messages: [],
      meta: {},
    },
    {
      type: "input",
      group: "default",
      attributes: {
        name: "identifier",
        type: "text",
        value: "",
        required: true,
        disabled: false,
        node_type: "input",
      },
      messages: [],
      meta: {
        label: {
          id: 1070002,
          text: "E-Mail",
          type: "info",
          context: {
            name: "traits.email",
            title: "E-Mail",
          },
        },
      },
    },
    {
      type: "input",
      group: "password",
      attributes: {
        name: "password",
        type: "password",
        required: true,
        disabled: false,
        autocomplete: "current-password",
        node_type: "input",
      },
      messages: [],
      meta: {
        label: {
          id: 1070001,
          text: "Password",
          type: "info",
        },
      },
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
      meta: {
        label: {
          id: 1010022,
          text: "Sign in with password",
          type: "info",
        },
      },
    },
  ];
}

export function createLoginFlow(origin: string): LoginFlow {
  const id = crypto.randomUUID();
  const csrfToken = createCsrfToken();

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + FLOW_LIFETIME_MS);

  const issuedAtIso = issuedAt.toISOString();
  const expiresAtIso = expiresAt.toISOString();

  return {
    id,
    organization_id: null,
    type: "browser",

    expires_at: expiresAtIso,
    issued_at: issuedAtIso,
    request_url: `${origin}/self-service/login/browser`,

    ui: {
      action: `/auth/self-service/login?flow=${encodeURIComponent(id)}`,
      method: "POST",
      nodes: createLoginNodes(csrfToken),
    },

    created_at: issuedAtIso,
    updated_at: issuedAtIso,
    refresh: false,
    requested_aal: "aal1",
    state: "choose_method",
  };
}

export function isLoginFlowExpired(flow: LoginFlow): boolean {
  return Date.now() >= new Date(flow.expires_at).getTime();
}

export function getFlowCsrfToken(flow: LoginFlow): string | undefined {
  const node = flow.ui.nodes.find(
    (item) => item.attributes.name === "csrf_token",
  );

  const value = node?.attributes.value;

  return typeof value === "string" ? value : undefined;
}
