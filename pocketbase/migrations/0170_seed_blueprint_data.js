migrate(
  (app) => {
    // Stage 1: Infrastructure only — no seed data.
    // Collections are born empty per acceptance criteria.
    // This migration is intentionally a no-op.
    console.log('BLUEPRINT-0170: Stage 1 — no seed data, collections remain empty')
  },
  (app) => {
    // No-op: nothing was created, nothing to revert.
  },
)
