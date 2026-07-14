# Design: Territorial Scope Restructure

## Technical Approach

Replace the current multi-row `campana_territorio` (0..N depto+municipio combos) with an exclusive 3-type model — Nacional (0 rows), Departamental (1 row, id_departamento only), Municipal (1 row, id_municipio only). Enforce at DB level via `UNIQUE(id_campana)` + CHECK constraint. Redesign the editor from checkbox tree to radio buttons with single dropdown. Server actions rewrite to upsert/delete single row. Return shape of `fetchTerritorioAlcance` stays unchanged — existing callers (`puestos.ts`, `comuna-barrio.ts`, `catalog-bulk-import.ts`) are unaffected.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| JSON hidden input vs. individual form fields | JSON keeps editor as single contract point; flat fields are more explicit but expose internals to form | **JSON hidden input** (single contract, cleaner server parsing) |
| Inline SQL migration vs. Supabase migration file | Migration file preserves sequential ordering and is reversible | **New file `036_territorial_scope_constraints.sql`** following existing pattern |
| Delete-insert vs. single-row upsert in server action | Upsert is cleaner but requires knowing the row type; delete+insert handles both create and update uniformly | **Delete all, then insert new row** — matches current pattern, minimal risk |
| Server-side voter warning vs. client-side pre-check | DB query is authoritative; client pre-check adds latency and duplicates logic | **Server-side** — query voters whose `puesto_votacion.id_comuna → municipio` falls outside new alcance, return warning in action response |
| New `queryComunasPorAlcance` vs. inline | Centralized helper prevents scattered filter logic | **New helper** in `comunas.ts` — optional but recommended |

## Data Flow

```
[Radio: Nacional/Depto/Muni] → JSON hidden input → form submit →
  syncCampaignAlcance(supabase, campaignId, formData) {
    parse JSON → validate tipo+id combination
    DELETE FROM campana_territorio WHERE id_campana = ?
    IF tipo !== nacional → INSERT one row
    IF tipo changed → query voters outside new scope → return warning
  }
```

**fetchTerritorioAlcance** (unchanged signature):
```
Nacional   → { departamentos: [], municipios: [] }
Departamental → { departamentos: [depId], municipios: [] }
Municipal  → { departamentos: [], municipios: [munId] }
```

## Database Model

**Before** (migration 033):
```sql
CREATE TABLE campana_territorio (
  id_campana      bigint NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  id_departamento text REFERENCES departamentos(id),
  id_municipio    text REFERENCES municipios(id),
  CONSTRAINT al_menos_uno CHECK (id_departamento IS NOT NULL OR id_municipio IS NOT NULL),
  UNIQUE (id_campana, id_departamento, id_municipio)
);
```

**After** (migration 036):
```sql
-- Drop old constraints first
ALTER TABLE campana_territorio DROP CONSTRAINT IF EXISTS al_menos_uno;
ALTER TABLE campana_territorio DROP CONSTRAINT IF EXISTS campana_territorio_id_campana_id_departamento_id_municipio_key;

-- Add new constraints
ALTER TABLE campana_territorio ADD CONSTRAINT campana_territorio_id_campana_key UNIQUE (id_campana);
ALTER TABLE campana_territorio ADD CONSTRAINT alcance_exclusivo CHECK (
  (id_departamento IS NOT NULL AND id_municipio IS NULL) OR
  (id_departamento IS NULL AND id_municipio IS NOT NULL)
);
```

Pre-migration check: detect campaigns with >1 row in `campana_territorio` and report before applying migration.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/036_territorial_scope_constraints.sql` | Create | Drop old constraints, add UNIQUE(id_campana) + CHECK |
| `apps/web/src/components/platform/territorio-alcance-editor.tsx` | Modify | 3 radio buttons (Nacional/Departamental/Municipal), conditional dropdowns, JSON hidden output |
| `apps/web/src/app/(platform)/platform/actions.ts` | Modify | Rewrite `syncCampaignAlcance`: typed input + voter scope validation |
| `apps/web/src/app/(platform)/platform/campaigns/[id]/page.tsx` | Modify | Adapt alcance read for single-row model; show voter warning banner |
| `apps/web/src/components/platform/create-campaign-form.tsx` | Modify | Adapt to new editor — no structural changes, editor already renders self-contained |
| `apps/web/src/lib/campaign/comunas.ts` | Modify | Add `queryComunasPorAlcance` helper (optional) |

## Interfaces / Contracts

```typescript
// server action input (parsed from hidden JSON)
type AlcanceInput =
  | { tipo: "nacional" }
  | { tipo: "departamental"; id_departamento: string }
  | { tipo: "municipal"; id_municipio: string };

// server action output
type AlcanceResult = {
  ok: boolean;
  error?: string;
  warning?: string; // voters outside new scope
};

// fetchTerritorioAlcance (unchanged)
type TerritorioAlcance = {
  departamentos: string[];
  municipios: string[];
};
```

## State Machine (Editor)

```
Estado actual: initialAlcance (0 rows = Nacional, 1 row with depto = Departamental, 1 row with muni = Municipal)

Radio selection:
  Nacional   → hide dropdowns → JSON: {tipo: "nacional"}
  Departamental → show departamento dropdown → JSON: {tipo: "departamental", id_departamento}
  Municipal  → show municipio dropdown (filtered by selected depto if available) → JSON: {tipo: "municipal", id_municipio}

Validation: at least one option selected; if Departamental, departamento required; if Municipal, municipio required
```

## Voter Validation Strategy

On scope change in `syncCampaignAlcance`:
1. Query voters whose `puesto_votacion.id_comuna → municipio.id_departamento` (or `id_municipio`) falls outside new scope
2. Count voters outside scope
3. If count > 0, include `warning` in response — non-blocking, no auto-delete
4. Campaign page client component displays warning banner

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| DB | New constraints enforce exclusivity | Manual SQL verification against migration |
| Unit | `syncCampaignAlcance` parsing + validation | TypeScript-level tests (when Vitest is set up) |
| Integration | Create/update alcance round-trip | Server action + query verification |
| E2E | Full radio → save → reload flow | Manual browser test (Playwright in future) |

## Migration / Rollout

1. **Pre-check**: Run advisory SQL to find campaigns with >1 row — report to operator
2. **Manual fix**: Consolidate multi-row campaigns (operator decides target scope)
3. **Deploy migration 036**: Drop old constraints, add new ones
4. **Deploy front-end**: Both editor and server actions must be deployed together
5. **Rollback**: Revert migration 036 (restore old constraints), revert front-end files

## Open Questions

- [ ] What happens to existing multi-row campaigns in production? Manual consolidation per campaign or automatic merge to first row?
- [ ] Should the municipio dropdown in Municipal mode be filtered by a pre-selected departamento, or show all municipios? (Current spec: "cargados según departamento seleccionado O todos si no hay departamento")
