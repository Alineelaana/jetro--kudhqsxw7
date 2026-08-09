migrate(
  (app) => {
    // Stage 1: No vector field, no embedding, no semantic search.
    // blueprint_chunks must remain inert per acceptance criteria.
    // This migration is intentionally a no-op.
    console.log('BLUEPRINT-0171: Stage 1 — no vector field, blueprint_chunks remains inert')
  },
  (app) => {
    // No-op: nothing was created, nothing to revert.
  },
)
