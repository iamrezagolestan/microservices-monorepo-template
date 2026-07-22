import { Hono } from "hono";
import { loginRoutes } from "./login-routes";
import { clearMockState } from "./store";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "mock-kratos"
  });
});

app.route("/auth/self-service/login", loginRoutes);

/*
 * برای توسعه و بعداً برای Playwright:
 * همه flowها و sessionها را پاک می‌کند.
 */
app.post("/__mock/reset", (c) => {
  clearMockState();
  return c.body(null, 204);
});

app.notFound((c) => {
  return c.json(
    {
      error: {
        id: "mock_route_not_found",
        message: `No mock route exists for ${c.req.method} ${c.req.path}`
      }
    },
    404
  );
});

app.onError((error, c) => {
  console.error(error);

  return c.json(
    {
      error: {
        id: "mock_internal_error",
        message: error.message
      }
    },
    500
  );
});

const port = Number(process.env.MOCK_KRATOS_PORT ?? 4010);

console.log(`Mock Kratos is running at http://localhost:${port}`);

Bun.serve({
  port,
  fetch: app.fetch
});
