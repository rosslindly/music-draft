# localstorage-export

## Goal
Add a simple export/import mechanism for all app localStorage data. This is a safety net for the solo alpha: if state is accidentally wiped (dev tools, wrong button tap), the user can restore from a JSON backup without losing their league, lineup, and listener snapshots.

## Inputs
- `src/ui.js` — add export and import controls to the Settings screen (or a temporary "Data" section on League Home if Settings doesn't exist yet)
- `src/main.js` — wire up export/import handlers
- `src/style.css` — minimal styles for the export/import buttons

## Acceptance Criteria
- [ ] An "Export Data" button downloads a `.json` file containing all `md_*` localStorage keys and their values
- [ ] Exported filename includes the date: `music-draft-backup-YYYY-MM-DD.json`
- [ ] An "Import Data" button opens a file picker; selecting a valid backup JSON restores all keys to localStorage and reloads the app
- [ ] Import validates that the file is valid JSON before writing; shows an inline error if not
- [ ] Import does not silently overwrite with an empty or malformed file — user sees a confirmation: "This will replace all current data. Continue?"
- [ ] Both controls are accessible without being in the critical user flow (tucked into a Settings or footer area)

## Output
- Branch: `feat/localstorage-export`
- Commit: `feat: localStorage export and import for data safety`

## Out of Scope
- Merging imported data with existing data (full replace only)
- Cloud backup or auto-sync (that's Supabase)
- Exporting individual records (all-or-nothing for simplicity)
