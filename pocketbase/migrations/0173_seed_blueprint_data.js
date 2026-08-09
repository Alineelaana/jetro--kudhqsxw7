/*
 * Migration 0173 — NO-OP (Neutralized)
 *
 * Original name: 0173_seed_blueprint_data.js
 * Original purpose: Seed data for the old Blueprint architecture,
 *   including collections `blueprint_decisions`, `blueprint_documents`,
 *   and old ADR-related fields.
 *
 * Old architecture context:
 *   This seed migration was written for a superseded architecture that
 *   included the following collections which are NOT part of the approved
 *   frozen schema (migration 0169):
 *     - `blueprint_decisions` (removed — ADR is now a node type, not a
 *        separate collection)
 *     - `blueprint_documents` (removed — content lives in
 *        `blueprint_chapters` and `blueprint_sections`)
 *   Additionally, the seed used field names (`name`, `description`,
 *   `order`, `status`, `type`, `version_number`) that do not match the
 *   approved collection schemas (which use `title`, `summary`,
 *   `display_order`, etc.).
 *
 * Reason for neutralization:
 *   The referenced collections do not exist in the approved architecture.
 *   Running this migration would either fail (collections not found) or
 *   require creating non-approved collections, both of which constitute
 *   architectural divergence. The migration has been converted to a
 *   no-op to preserve chain integrity.
 *
 * Corresponding architectural decision:
 *   ADR: Blueprint Architecture — Phase 1 (Frozen)
 *   Decision: ADRs are treated as a node type within `blueprint_relations`
 *   (source_type/target_type value: 'adr'), not as a standalone collection.
 *   Documents are represented as chapters/sections within the canonical
 *   content hierarchy. No `blueprint_decisions` or `blueprint_documents`
 *   collections are part of the approved schema.
 *
 * Date of neutralization: 2026-08-09
 * Responsible technical party: Technical Lead — Blueprint Migration Chain
 */
migrate(
  (app) => {
    // No-op: intentionally left empty.
    // blueprint_decisions and blueprint_documents are not part of the
    // approved architecture. No seed data is applied.
  },
  (app) => {
    // No-op: intentionally left empty.
    // No revert logic needed — nothing was ever applied.
  },
)
