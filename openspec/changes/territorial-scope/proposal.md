# Proposal: Territorial Scope Restructure

## Intent

Replace the current flexible multi-row territory model (0..N combinations of depto+municipio) with an exclusive 3-type model — Nacional, Departamental, Municipal — enforced at the DB level via a UNIQUE constraint and a CHECK constraint. This eliminates invalid states (e.g., a campaign with coverage gaps or overlapping rows) and simplifies the UI from checkbox trees to radio buttons.

## Scope

### In Scope
- DB migration: new constraints on `campana_territorio` (UNIQUE per campaign, CHECK for valid 3-type combinations)
- `territorio-alcance-editor.tsx`: full redesign — 3 radio buttons (Nacional / Departamental / Municipal) with single-select dropdowns for departamento/municipio
- `create-campaign-form.tsx`: wiring to pass new editor data shape
- `platform/campaigns/[id]/page.tsx`: adapt alcance read/write for single-row model; add voter-outside-scope warning on change
- Server actions (`syncCampaignAlcance`, `updateCampaignAlcanceAction`): rewrite for single-row upsert with server-side validation
- New helper `queryComunasPorAlcance` in `comunas.ts` to centralize alcance-based filtering (optional)

### Out of Scope
- Data migration for existing multi-row campaigns (consolidation — handled in a separate advisory step or manual fix)
- Changes to `comuna-barrio.ts`, `catalog-bulk-import.ts`, `puestos.ts` — existing queries are correct
- Changes to platform maestras (comunas-list, barrios-list, etc.) — they are platform-global and unaffected
- Voter re-assignment or automatic data movement when scope narrows (advisory only)
- RLS policy changes (current policies are per-campaign and unaffected)

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `platform-core`: campaign territory scope shifts from free-form multi-row to exclusive 3-type model (Nacional/Departamental/Municipal). New validation rules, new UI, single-row persistence. Voter-outside-scope warning added on scope change.

## Approach

1. **DB (migration):** Drop the existing `al_menos_uno` CHECK and `(id_campaña, id_departamento, id_municipio)` UNIQUE. Add `UNIQUE(id_campaña)` and new CHECK enforcing `(id_departamento IS NOT NULL AND id_municipio IS NULL) OR (id_departamento IS NULL AND id_municipio IS NOT NULL)` for rows, with 0-rows = Nacional semantics unchanged.
2. **Server actions:** `syncCampaignAlcance` reads 3 mutually exclusive string values from form: `tipo` ("nacional"|"departamental"|"municipal"), `id_departamento` (nullable), `id_municipio` (nullable). Upserts a single row or deletes all for Nacional. Server-side validation rejects invalid combinations.
3. **Editor component:** Replace mode toggle + checkbox tree with 3 radio buttons. On "Departamental" show a single departamento dropdown. On "Municipal" show a single municipio dropdown. Output hidden form fields directly (no JSON encoding).
4. **Campaign detail page:** On scope change, query voters whose `puesto_votacion.id_comuna.id_municipio` (or departamento) falls outside the new scope. Display a non-blocking warning banner if any exist.
5. **`fetchTerritorioAlcance`** stays unchanged — its `{departamentos: [], municipios: []}` return already handles the 3 types correctly (empty arrays = Nacional, one departamento = Departamental, one municipio = Municipal).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/036_territorial_scope_constraints.sql` | New | Migration: drop old constraints, add UNIQUE(id_campaña) + CHECK |
| `apps/web/src/components/platform/territorio-alcance-editor.tsx` | Modified | Redesign from checkbox tree to 3 radio buttons with dropdowns |
| `apps/web/src/components/platform/create-campaign-form.tsx` | Modified | Adapt to new editor output shape (no JSON hidden field) |
| `apps/web/src/app/(platform)/platform/actions.ts` | Modified | Rewrite `syncCampaignAlcance`, `updateCampaignAlcanceAction` |
| `apps/web/src/app/(platform)/platform/campaigns/[id]/page.tsx` | Modified | Read/write single-row alcance; add voter warning |
| `apps/web/src/lib/campaign/comunas.ts` | Modified | Add `queryComunasPorAlcance` helper (optional) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing campaigns with multiple rows break on deploy | Medium | Run pre-migration check script; manual consolidation for multi-row campaigns before deploying new constraints |
| Voters accidentally excluded when scope narrows | Medium | Advisory warning only — non-blocking, no auto-delete. Owner must explicitly confirm |
| Front-end FormData shape mismatch between old JSON and new flat fields | Low | Both old and new code paths live server-side; validation catches missing fields |
| `fetchTerritorioAlcance` callers silently misinterpret single-row data | Low | Return shape stays `{departamentos: string[], municipios: string[]}` — semántica unchanged |

## Rollback Plan

1. Revert migration `036` and restore previous constraints (DROP UNIQUE, restore `al_menos_uno` + old UNIQUE)
2. Revert `territorio-alcance-editor.tsx`, `actions.ts`, campaign page, and `create-campaign-form.tsx` to previous versions
3. Verify existing campaigns with multiple rows are functional via rollback migration

## Dependencies

- Supabase migration must run before front-end deploy (schema must accept new constraint before code writes to it)
- Existing multi-row campaigns data cleanup (manual step, documented in migration comments)

## Success Criteria

- [ ] `campana_territorio` rejects invalid combinations (departamento+municipio same row, both null) at DB level
- [ ] Web UI shows 3 radio options, produces correct single-row or zero-row state
- [ ] Creating a campaign with each scope type saves and reads back correctly
- [ ] Changing scope shows non-blocking warning when voters exist outside new scope
- [ ] Server actions reject invalid scope combinations with clear error messages
- [ ] All existing queries (`fetchComunasPorAlcance`, callers in `comuna-barrio.ts`, `catalog-bulk-import.ts`, `puestos.ts`) continue to work with single-row data
