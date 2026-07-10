export const devportal = {
  title: "Developer portal",
  description: "API documentation coming soon.",
  // The flat /api surface (ADR-0017) hides service topology, so specs are served
  // by the topology-aware internal devportal itself (ADR-0009), not under /api.
  endpoints: [
    "GET /devportal/catalog/openapi.yaml",
    "GET /devportal/orders/openapi.yaml",
    "GET /devportal/payment/openapi.yaml",
    "GET /devportal/orgs/openapi.yaml",
  ] as const,
} as const;
