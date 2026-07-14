# Tasks: Territorial Scope Restructure

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~560 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Migration + helper → PR 2: Editor + forms → PR 3: Actions + page |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | DB constraints + municipio helper | PR 1 | `tsc --noEmit` (web) + manual SQL verify via Supabase | N/A — infra only | Revert migration 036 file |
| 2 | Editor rewrite + form wiring | PR 2 | `tsc --noEmit` + `npm run lint --workspace=web` | Create campaign form in browser (create + verify DB row) | Revert editor + form files |
| 3 | Server actions + campaign page | PR 3 | `tsc --noEmit` + `npm run lint --workspace=web` | Change alcance in campaign detail page, verify voters warning | Revert actions + page files |

## Phase 1: Foundation

- [ ] 1.1 Create `supabase/migrations/036_territorial_scope_constraints.sql` — DROP old CHECK + UNIQUE, ADD UNIQUE(id_campana) + CHECK exclusivo
- [ ] 1.2 Add `queryMunicipiosPorDepartamento(deptoId: string)` helper to `apps/web/src/lib/campaign/comunas.ts`

## Phase 2: Editor UI

- [ ] 2.1 Rewrite `apps/web/src/components/platform/territorio-alcance-editor.tsx` — 3 radio buttons (Nacional/Departamental/Municipal), conditional dropdowns, JSON serialized hidden output
- [ ] 2.2 Update `apps/web/src/components/platform/create-campaign-form.tsx` — adapt imports, editor already self-contained

## Phase 3: Server Actions + Page

- [ ] 3.1 Rewrite `syncCampaignAlcance` in `apps/web/src/app/(platform)/platform/actions.ts` — parse typed JSON (`AlcanceInput`), DELETE + INSERT single row, validate tipo+id combo
- [ ] 3.2 Add `updateCampaignAlcanceAction` in `actions.ts` — same logic + query voters outside new scope (puesto_votacion → comuna → municipio → match), return `AlcanceResult` with optional warning
- [ ] 3.3 Update `apps/web/src/app/(platform)/platform/campaigns/[id]/page.tsx` — adapt alcance read to single-row model; display warning banner from action response

## Phase 4: Verification

- [ ] 4.1 Manual smoke test — create campaign with each alcance type (nacional / departamental / municipal), verify DB row(s) and round-trip on reload
- [ ] 4.2 Scope change with existing voters — verify warning banner when voters exist outside new scope (non-blocking)
