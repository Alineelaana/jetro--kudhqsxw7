/*
 * Migration 0172 — NO-OP (Neutralized)
 *
 * Original name: 0172_stage1_correct_collections.js
 * Original purpose: Add `embedding` (vector) and `chunk_text` fields
 *   to the `blueprint_chapters` collection.
 *
 * Architectural incompatibility:
 *   The approved frozen architecture (migration 0169) designates
 *   `blueprint_chunks` as the exclusive collection for vector embeddings
 *   and semantic search content. Adding an `embedding` vector field to
 *   `blueprint_chapters` violates the separation of concerns between
 *   canonical content storage (`blueprint_chapters`) and chunked
 *   embedding storage (`blueprint_chunks`).
 *
 * Key architectural rule:
 *   Embeddings belong EXCLUSIVELY to the `blueprint_chunks` collection.
 *   The `blueprint_chapters` collection holds canonical content only.
 *
 * Reason for neutralization:
 *   Running this migration would introduce a vector field on the wrong
 *   collection, creating architectural divergence from the approved
 *   Phase 1 design. The migration has been converted to a no-op to
 *   preserve schema integrity.
 *
 * Date of neutralization: 2026-08-09
 * Responsible technical party: Technical Lead — Blueprint Migration Chain
 */
migrate(
  (app) => {
    // No-op: intentionally left empty.
    // Embeddings belong exclusively to blueprint_chunks, not blueprint_chapters.
  },
  (app) => {
    // No-op: intentionally left empty.
    // No revert logic needed — nothing was ever applied.
  },
)
