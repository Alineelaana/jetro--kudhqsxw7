/*
 * Migration 0170 — NO-OP (Neutralized)
 *
 * Original name: 0170_seed_blueprint_data.js
 * Original status: pending (never applied)
 * Original type: Seed migration (old architecture)
 *
 * Historical record:
 *   - This migration was part of the old Blueprint architecture.
 *   - It was a seed migration that referenced collections `blueprint_adrs`
 *     and `blueprint_gaps` which are not part of the approved frozen
 *     architecture (migration 0169).
 *   - It was never applied to the database (status: pending).
 *   - Verified references: `blueprint_adrs`, `blueprint_gaps`.
 *
 * Reason for neutralization:
 *   The old seed data referenced collections and structures that do not
 *   exist in the approved Phase 1 architecture defined by migration 0169.
 *   Running this migration would introduce data inconsistent with the
 *   frozen schema. The migration has been converted to a no-op to
 *   preserve chain integrity without executing any schema or seed logic.
 *
 * Date of neutralization: 2026-08-09
 * Responsible technical party: Technical Lead — Blueprint Migration Chain
 *
 * Architectural decision:
 *   The user consciously accepts the loss of the original seed content,
 *   based on documented evidence that it belonged to a superseded
 *   architecture. No data was ever persisted by this migration.
 */
migrate(
  (app) => {
    // No-op: intentionally left empty.
    // This migration is neutralized and performs no operations.
  },
  (app) => {
    // No-op: intentionally left empty.
    // No revert logic needed — nothing was ever applied.
  },
)
