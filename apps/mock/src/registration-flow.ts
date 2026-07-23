import type {
  RegistrationFlow,
  RegistrationTraits,
  UiNode,
  UiText,
} from "./types";

const REGISTRATION_FLOW_LIFESPAN_MS = 60 * 60 * 1000;

const DEFAULT_APP_ORIGIN =
  process.env.APP_ORIGIN ?? "https://dev.localtest.me:8443";

function createCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  return Buffer.from(bytes).toString("base64");
}

function createCsrfNode(csrfToken: string): UiNode {
  return {
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
  };
}

function createEmailNode(
  type: "email" | "hidden",
  value?: string,
): UiNode {
  return {
    type: "input",
    group: "default",
    attributes: {
      name: "traits.email",
      type,
      ...(value !== undefined ? { value } : {}),
      required: true,
      autocomplete: "email",
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
  };
}

function createNameNode(
  type: "text" | "hidden",
  value?: string,
): UiNode {
  return {
    type: "input",
    group: "default",
    attributes: {
      name: "traits.name",
      type,
      ...(value !== undefined ? { value } : {}),
      disabled: false,
      node_type: "input",
    },
    messages: [],
    meta: {
      label: {
        id: 1070002,
        text: "Name",
        type: "info",
        context: {
          name: "traits.name",
          title: "Name",
        },
      },
    },
  };
}

function createOperatorNode(
  type: "checkbox" | "hidden",
  value?: string,
): UiNode {
  return {
    type: "input",
    group: "default",
    attributes: {
      name: "traits.operator",
      type,
      ...(value !== undefined ? { value } : {}),
      disabled: false,
      node_type: "input",
    },
    messages: [],
    meta: {
      label: {
        id: 1070002,
        text: "Operator",
        type: "info",
        context: {
          name: "traits.operator",
          title: "Operator",
        },
      },
    },
  };
}

function createProfileSubmitNode(): UiNode {
  return {
    type: "input",
    group: "profile",
    attributes: {
      name: "method",
      type: "submit",
      value: "profile",
      disabled: false,
      node_type: "input",
    },
    messages: [],
    meta: {
      label: {
        id: 1040001,
        text: "Sign up",
        type: "info",
      },
    },
  };
}

function createPasswordNode(): UiNode {
  return {
    type: "input",
    group: "password",
    attributes: {
      name: "password",
      type: "password",
      required: true,
      autocomplete: "new-password",
      disabled: false,
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
  };
}

function createPasswordSubmitNode(): UiNode {
  return {
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
        id: 1040001,
        text: "Sign up",
        type: "info",
      },
    },
  };
}

function createBackNode(): UiNode {
  return {
    type: "input",
    group: "profile",
    attributes: {
      name: "screen",
      type: "submit",
      value: "previous",
      disabled: false,
      node_type: "input",
    },
    messages: [],
    meta: {
      label: {
        id: 1040008,
        text: "Back",
        type: "info",
      },
    },
  };
}

export function createRegistrationFlow(
  origin = DEFAULT_APP_ORIGIN,
  now = new Date(),
): RegistrationFlow {
  const id = crypto.randomUUID();
  const csrfToken = createCsrfToken();

  const issuedAt = now.toISOString();

  const expiresAt = new Date(
    now.getTime() + REGISTRATION_FLOW_LIFESPAN_MS,
  ).toISOString();

  return {
    id,
    type: "browser",
    expires_at: expiresAt,
    issued_at: issuedAt,

    request_url:
      `${origin}/self-service/registration/browser`,

    ui: {
      action:
        `${origin}/auth/self-service/registration` +
        `?flow=${encodeURIComponent(id)}`,

      method: "POST",

      nodes: [
        createCsrfNode(csrfToken),
        createEmailNode("email"),
        createNameNode("text"),
        createOperatorNode("checkbox"),
        createProfileSubmitNode(),
      ],
    },

    organization_id: null,
    state: "choose_method",
  };
}
export function moveRegistrationFlowToPassword(
  flow: RegistrationFlow,
  traits: RegistrationTraits,
): RegistrationFlow {
  const csrfNode = flow.ui.nodes.find(
    (node) => node.attributes.name === "csrf_token",
  );

  if (!csrfNode) {
    throw new Error("Registration flow does not contain a CSRF node");
  }

  return {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: [
        csrfNode,
        createEmailNode("hidden", traits.email),
        createPasswordNode(),
        createNameNode("hidden", traits.name),
        createOperatorNode("hidden", traits.operator ?? ""),
        createPasswordSubmitNode(),
        createBackNode(),
      ],
      messages: [
        {
          id: 1040009,
          text: "Please choose a credential to authenticate yourself with.",
          type: "info",
        },
      ],
    },
  };
}

export function addRegistrationMessage(
  flow: RegistrationFlow,
  message: UiText,
): RegistrationFlow {
  return {
    ...flow,
    ui: {
      ...flow.ui,
      messages: [message],
    },
  };
}

export function getRegistrationCsrfToken(
  flow: RegistrationFlow,
): string | undefined {
  const csrfNode = flow.ui.nodes.find(
    (node) => node.attributes.name === "csrf_token",
  );

  const value = csrfNode?.attributes.value;

  return typeof value === "string" ? value : undefined;
}

export function getTraitsFromRegistrationFlow(
  flow: RegistrationFlow,
): RegistrationTraits | undefined {
  const emailNode = flow.ui.nodes.find(
    (node) => node.attributes.name === "traits.email",
  );

  const nameNode = flow.ui.nodes.find(
    (node) => node.attributes.name === "traits.name",
  );

  const operatorNode = flow.ui.nodes.find(
    (node) => node.attributes.name === "traits.operator",
  );

  const email = emailNode?.attributes.value;
  const name = nameNode?.attributes.value;
  const operator = operatorNode?.attributes.value;

  if (typeof email !== "string" || typeof name !== "string") {
    return undefined;
  }

  return {
    email,
    name,
    operator: typeof operator === "string" ? operator : "",
  };
}