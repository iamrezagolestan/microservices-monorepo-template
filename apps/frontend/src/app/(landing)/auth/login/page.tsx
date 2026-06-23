// Kratos self-service login flow (ADR-0010, ADR-0014). Public route under
// (landing). The browser fetches the flow from the Kratos public API (same
// origin via Traefik, /auth/self-service/* → ory-kratos-public) and renders its
// UI nodes as a native form that POSTs straight back to Kratos — no client SDK;
// the session and CSRF cookies are Kratos's. Client component because the flow id
// and those cookies only exist in the browser.
"use client";

import { useEffect, useState } from "react";
import { landing } from "@/strings/landing";

type UiText = { id: number; text: string };
type UiNode = {
  attributes: {
    node_type?: string;
    name?: string;
    type?: string;
    value?: string | number | boolean;
    required?: boolean;
    disabled?: boolean;
  };
  messages?: UiText[];
  meta: { label?: UiText };
};
type LoginFlow = {
  ui: { action: string; method: string; nodes: UiNode[]; messages?: UiText[] };
};

function FlowField({ node }: { node: UiNode }) {
  const attr = node.attributes;
  const value = String(attr.value ?? "");
  const labelText = node.meta.label ? node.meta.label.text : undefined;

  if (attr.type === "hidden") {
    return <input type="hidden" name={attr.name} value={value} />;
  }
  if (attr.type === "submit") {
    return (
      <button
        type="submit"
        name={attr.name}
        value={value}
        className="w-full rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
      >
        {labelText ?? landing.auth.submit}
      </button>
    );
  }
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{labelText ?? attr.name}</span>
      <input
        name={attr.name}
        type={attr.type}
        required={attr.required}
        disabled={attr.disabled}
        defaultValue={attr.type === "password" ? undefined : value}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
      />
      {node.messages?.map((message) => (
        <span key={message.id} className="mt-1 block text-sm text-red-600">
          {message.text}
        </span>
      ))}
    </label>
  );
}

// Kratos sets the CSRF cookie and redirects back here with ?flow=<id>.
function restart(): void {
  const returnTo = new URLSearchParams(window.location.search).get("return_to");
  const init = new URL("/auth/self-service/login/browser", window.location.origin);
  if (returnTo) {
    init.searchParams.set("return_to", returnTo);
  }
  window.location.replace(init.toString());
}

export default function LoginPage() {
  const [flow, setFlow] = useState<LoginFlow | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("flow");
    if (!id) {
      restart();
      return;
    }
    fetch(`/auth/self-service/login/flows?id=${encodeURIComponent(id)}`, {
      headers: { accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 404 || res.status === 410) {
          // Expired or unknown flow — start a fresh one.
          restart();
          return null;
        }
        if (!res.ok) {
          throw new Error(String(res.status));
        }
        return res.json() as Promise<LoginFlow>;
      })
      .then((data) => data && setFlow(data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">{landing.auth.title}</h1>
        <p className="mt-2 text-red-600">{landing.auth.error}</p>
      </main>
    );
  }

  if (!flow) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">{landing.auth.title}</h1>
        <p className="mt-2 text-slate-600">{landing.auth.starting}</p>
      </main>
    );
  }

  const inputs = flow.ui.nodes.filter((node) => node.attributes.node_type === "input");

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">{landing.auth.title}</h1>
      {flow.ui.messages?.map((message) => (
        <p key={message.id} className="mt-2 text-slate-600">
          {message.text}
        </p>
      ))}
      <form method={flow.ui.method} action={flow.ui.action} className="mt-4 space-y-3">
        {inputs.map((node) => (
          <FlowField key={node.attributes.name} node={node} />
        ))}
      </form>
    </main>
  );
}
