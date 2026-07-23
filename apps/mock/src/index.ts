import { serve } from "bun";
import { Hono } from "hono";
import { loginRoutes } from "./login-routes";
import { clearMockState } from "./store";

const app = new Hono();
app.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "mock-kratos",
  }),
);
app.route("/auth/self-service/login", loginRoutes);
app.post("/__mock/reset", (c) => {
  clearMockState();
  return c.body(null, 204);
});

app.notFound((c) =>
  c.json(
    {
      error: {
        id: "mock_route_not_found",
        message: `No mock route exists for ${c.req.method} ${c.req.path}`,
      },
    },
    404,
  ),
);

app.onError((error, c) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  return c.json(
    {
      error: {
        id: "mock_internal_error",
        message: error.message,
      },
    },
    500,
  );
});
const port = Number(process.env.MOCK_KRATOS_PORT ?? 4010);
process.stdout.write(`Mock Kratos is running at http://localhost:${port}\n`);
serve({
  port,
  fetch: app.fetch,
});
