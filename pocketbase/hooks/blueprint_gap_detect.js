// Stage 1: Hook deactivated — infrastructure only, no gap detection.
// To reactivate: restore the original callback body from version control.
onRecordAfterCreateSuccess((e) => {
  return e.next()
}, 'blueprint_screen_links')
