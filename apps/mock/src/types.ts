export type UiText = {
  id: number;
  text: string;
  type?: "info" | "error" | "success";
};

export type UiNode = {
  type: "input";
  group: "default" | "password";
  attributes: {
    name: string;
    type: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
  };
  messages: UiText[];
  meta: {
    label?: UiText;
  };
};

export type LoginFlow = {
  id: string;
  organization_id: null;
  type: "browser";
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: {
    action: string;
    method: "POST";
    nodes: UiNode[];
    messages: UiText[];
  };
};

export type MockSession = {
  id: string;
  identity: {
    id: string;
    traits: {
      email: string;
    };
  };
  authenticated_at: string;
};