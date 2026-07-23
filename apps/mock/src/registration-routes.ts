import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import {
  addRegistrationMessage,
  createRegistrationFlow,
  getRegistrationCsrfToken,
  getTraitsFromRegistrationFlow,
  moveRegistrationFlowToPassword,
} from "./registration-flow";
import {
  deleteRegistrationFlow,
  findIdentityByEmail,
  getRegistrationFlow,
  saveIdentity,
  saveRegistrationFlow,
  saveSession,
} from "./store";
import type {
  MockIdentity,
  MockSession,
  RegistrationFlow,
  RegistrationStep,
} from "./types";

const FRONTEND_REGISTER_PATH = "/auth/register";
const SUCCESS_REDIRECT_PATH = "/";

const registrationRoutes = new Hono();

function readFormString(
  body: Record<string, string | File>,
  key: string,
): string {
  const value = body[key];

  return typeof value === "string" ? value : "";
}

function isExpired(flow: RegistrationFlow): boolean {
  return new Date(flow.expires_at).getTime() <= Date.now();
}

function redirectToRegistration(flowId: string): string {
  return (
    `${FRONTEND_REGISTER_PATH}?flow=` +
    encodeURIComponent(flowId)
  );
}

function saveFlowError(
  flow: RegistrationFlow,
  step: RegistrationStep,
  text: string,
): void {
  saveRegistrationFlow({
    step,
    flow: addRegistrationMessage(flow, {
      id: 4000001,
      text,
      type: "error",
    }),
  });
}

registrationRoutes.get("/browser", (c) => {
  const flow = createRegistrationFlow();

  saveRegistrationFlow({
    flow,
    step: "profile",
  });

  const acceptHeader = c.req.header("accept") ?? "";
  const expectsJson = acceptHeader
    .toLowerCase()
    .includes("application/json");

  if (expectsJson) {
    return c.json(flow);
  }

  return c.redirect(redirectToRegistration(flow.id), 303);
});

registrationRoutes.get("/flows", (c) => {
  const flowId = c.req.query("id");

  if (!flowId) {
    return c.json(
      {
        error: {
          id: "missing_registration_flow_id",
          message: "The registration flow id is required.",
        },
      },
      400,
    );
  }

  const storedFlow = getRegistrationFlow(flowId);

  if (!storedFlow) {
    return c.json(
      {
        error: {
          id: "registration_flow_not_found",
          message: "The registration flow could not be found.",
        },
      },
      404,
    );
  }

  if (isExpired(storedFlow.flow)) {
    deleteRegistrationFlow(flowId);

    return c.json(
      {
        error: {
          id: "registration_flow_expired",
          message: "The registration flow has expired.",
        },
      },
      410,
    );
  }

  return c.json(storedFlow.flow);
});

registrationRoutes.post("/", async (c) => {
  const flowId = c.req.query("flow");

  if (!flowId) {
    return c.json(
      {
        error: {
          id: "missing_registration_flow_id",
          message: "The registration flow id is required.",
        },
      },
      400,
    );
  }

  const storedFlow = getRegistrationFlow(flowId);

  if (!storedFlow) {
    return c.json(
      {
        error: {
          id: "registration_flow_not_found",
          message: "The registration flow could not be found.",
        },
      },
      404,
    );
  }

  if (isExpired(storedFlow.flow)) {
    deleteRegistrationFlow(flowId);

    return c.json(
      {
        error: {
          id: "registration_flow_expired",
          message: "The registration flow has expired.",
        },
      },
      410,
    );
  }

  const body = await c.req.parseBody();

  const csrfToken = readFormString(body, "csrf_token");
  const method = readFormString(body, "method");
  const screen = readFormString(body, "screen");

  const expectedCsrfToken = getRegistrationCsrfToken(
    storedFlow.flow,
  );

  if (!expectedCsrfToken || csrfToken !== expectedCsrfToken) {
    saveFlowError(
      storedFlow.flow,
      storedFlow.step,
      "The CSRF token is invalid or missing.",
    );

    return c.redirect(redirectToRegistration(flowId), 303);
  }

  /*
   * Back button در مرحله Password
   */
  if (screen === "previous") {
    const flow = createRegistrationFlow();

    deleteRegistrationFlow(flowId);

    saveRegistrationFlow({
      flow,
      step: "profile",
    });

    return c.redirect(redirectToRegistration(flow.id), 303);
  }

  /*
   * مرحله اول: دریافت Profile
   */
  if (method === "profile") {
    const email = readFormString(body, "traits.email")
      .trim()
      .toLowerCase();

    const name = readFormString(body, "traits.name").trim();

    const operator = readFormString(
      body,
      "traits.operator",
    );

    if (!email) {
      saveFlowError(
        storedFlow.flow,
        "profile",
        "E-Mail is required.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    if (!email.includes("@")) {
      saveFlowError(
        storedFlow.flow,
        "profile",
        "The E-Mail address is not valid.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    if (!name) {
      saveFlowError(
        storedFlow.flow,
        "profile",
        "Name is required.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    if (findIdentityByEmail(email)) {
      saveFlowError(
        storedFlow.flow,
        "profile",
        "An account with this E-Mail already exists.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    const passwordFlow = moveRegistrationFlowToPassword(
      storedFlow.flow,
      {
        email,
        name,
        operator,
      },
    );

    saveRegistrationFlow({
      flow: passwordFlow,
      step: "password",
    });

    return c.redirect(redirectToRegistration(flowId), 303);
  }

  /*
   * مرحله دوم: دریافت Password و ساخت User
   */
  if (method === "password") {
    if (storedFlow.step !== "password") {
      saveFlowError(
        storedFlow.flow,
        storedFlow.step,
        "Complete the profile step before choosing a password.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    const password = readFormString(body, "password");

    if (password.length < 8) {
      saveFlowError(
        storedFlow.flow,
        "password",
        "Password must be at least 8 characters long.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    const traits = getTraitsFromRegistrationFlow(
      storedFlow.flow,
    );

    if (!traits) {
      saveFlowError(
        storedFlow.flow,
        "password",
        "The registration profile is incomplete.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    if (findIdentityByEmail(traits.email)) {
      saveFlowError(
        storedFlow.flow,
        "password",
        "An account with this E-Mail already exists.",
      );

      return c.redirect(redirectToRegistration(flowId), 303);
    }

    const now = new Date();
    const identityId = crypto.randomUUID();

    const identity: MockIdentity = {
      id: identityId,
      traits,
      password,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    saveIdentity(identity);
const sessionToken = crypto.randomUUID();
const session: MockSession = {
  id: crypto.randomUUID(),
  identity: {
    id: identity.id,
    traits: {
      email: identity.traits.email,
    },
  },
  authenticated_at: now.toISOString(),
};

saveSession(sessionToken, session);

    setCookie(c, "mock_kratos_session", sessionToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    deleteRegistrationFlow(flowId);

    return c.redirect(SUCCESS_REDIRECT_PATH, 303);
  }

  saveFlowError(
    storedFlow.flow,
    storedFlow.step,
    "Unsupported registration method.",
  );

  return c.redirect(redirectToRegistration(flowId), 303);
});

export { registrationRoutes };
