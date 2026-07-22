export type UiTextType = "info" | "error" | "success";

export type UiTextContext = {
  name?: string;
  title?: string;
  [key: string]: unknown;
};

export type UiText = {
  id: number;
  text: string;
  type?: UiTextType;
  context?: UiTextContext;
};

export type UiNode = {
  type: "input";
  group: "default" | "password";
  attributes: {
    name: string;
    type: string;
    value?: string | number | boolean;
    required?: boolean;
    disabled?: boolean;
    node_type: "input";
    autocomplete?: string;
  };
  messages: UiText[];
  meta: {
    label?: UiText;
  };
};

export type LoginFlowState =
  | "choose_method"
  | "sent_email"
  | "passed_challenge";

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
    messages?: UiText[];
  };

  created_at: string;
  updated_at: string;
  refresh: boolean;
  requested_aal: "aal1" | "aal2" | "aal3";
  state: LoginFlowState;
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
