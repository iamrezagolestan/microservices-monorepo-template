# orgs

B2B multi-tenancy service (ADR-0010). Owns organisations + memberships.
Receives an east-west webhook from Kratos at `POST /identity-created`
(`x-audience: cluster`, ADR-0008 — off the edge, in neither docs portal) to create
a personal org for every new identity. Maps cleanly onto SpiceDB's `org` definition.
