// Stage 1: Hook deactivated — infrastructure only, no semantic search.
// To reactivate: restore the original callback body from version control.
routerAdd(
  'POST',
  '/backend/v1/blueprint/search',
  (e) => {
    return e.json(503, { error: 'Blueprint search is not active in Stage 1' })
  },
  $apis.requireAuth(),
)
