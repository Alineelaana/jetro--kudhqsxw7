/*
 * Migration 0170 — NEUTRALIZED (no-op)
 *
 * Original purpose: Seed of the old blueprint architecture.
 *
 * Neutralization rationale:
 *   - This migration was NEVER applied.
 *   - It was registered as `pending`.
 *   - It referenced the collections `blueprint_gaps` and `blueprint_adrs`.
 *   - The collection `blueprint_adrs` does NOT belong to the frozen architecture
 *     and must not be created or seeded.
 *   - The migration was neutralized to preserve the migration chain numbering
 *     without creating obsolete seed data or an incompatible schema.
 *
 * This file now performs zero database logic. Both `up` and `down` are empty
 * no-ops. No collection is created, modified, or seeded.
 */
migrate(
  (app) => {
    // No-op — intentionally empty.
  },
  (app) => {
    // No-op — intentionally empty.
  },
)
