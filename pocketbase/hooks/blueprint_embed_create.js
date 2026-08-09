// Stage 1: Hook deactivated — infrastructure only, no embeddings, no AI, no RAG.
// To reactivate: restore the original callback body from version control.
onRecordAfterCreateSuccess((e) => {
  return e.next()
}, 'blueprint_chapters')
