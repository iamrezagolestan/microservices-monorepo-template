// Root loading boundary (ADR-0014). Per-route-group versions override this.
export default function Loading() {
  return (
    <main className="p-6 text-sm text-quaternary" aria-busy="true">
      Loading…
    </main>
  );
}
