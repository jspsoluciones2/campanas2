```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:f83065481d356ee2089c5303228fa0ec6cab0e6f7577f8dd85f14c7671a277ae
verdict: fail
blockers: 0
critical_findings: 1
requirements: 5/6
scenarios: 0/0
test_command: node node_modules\typescript\bin\tsc --noEmit (no test runner)
test_exit_code: 2
test_output_hash: sha256:f83065481d356ee2089c5303228fa0ec6cab0e6f7577f8dd85f14c7671a277ae
build_command: node node_modules\typescript\bin\tsc --noEmit
build_exit_code: 2
build_output_hash: sha256:f83065481d356ee2089c5303228fa0ec6cab0e6f7577f8dd85f14c7671a277ae
```

## Verification Report

**Change**: Territorial Scope Restructure
**Version**: N/A (no spec version)
**Mode**: Standard (no Strict TDD)

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 7 |
| Tasks complete | 7 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ❌ Failed (2 pre-existing errors in `.next/types/validator.ts`, unrelated to change)
```text
.next/types/validator.ts(71,39): error TS2307: Cannot find module
  '../../src/app/(campaign)/campaign/[id]/catalogos/barrios/page.js'
.next/types/validator.ts(80,39): error TS2307: Cannot find module
  '../../src/app/(campaign)/campaign/[id]/catalogos/comunas/page.js'
```

**Tests**: ➖ N/A (no test runner configured, Strict TDD inactive)

**Coverage**: ➖ Not available

### Spec Compliance Matrix
No formal spec scenarios exist. Compliance evaluated against the 6 Success Criteria from the proposal:

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| SC-1 | `campana_territorio` rejects invalid combos at DB level | ✅ Compliant | Migration `036_alcance_territorio_unico.sql` adds UNIQUE(id_campana) + CHECK XOR constraint |
| SC-2 | Web UI shows 3 radio options, produces correct single/zero-row state | ✅ Compliant | Editor renders 3 radios; JSON hidden output matches AlcanceInput shape |
| SC-3 | Creating campaign with each scope type saves and reads back correctly | ✅ Compliant | syncCampaignAlcance handles all 3 types; page.tsx reads single-row correctly |
| SC-4 | Changing scope shows non-blocking warning when voters exist outside | ❌ Failing | Voter query runs in `updateCampaignAlcanceAction` but `updateCampaignAlcanceFormAction` returns `void`, dropping the warning. Page has no client-side warning display. |
| SC-5 | Server actions reject invalid scope combos with clear error messages | ⚠️ Partial | Missing input silently degrades to Nacional (no error). No server-side validation for empty id_departamento/id_municipio. |
| SC-6 | All existing queries continue to work with single-row data | ✅ Compliant | fetchTerritorioAlcance unchanged; callers in puestos.ts, comuna-barrio.ts, catalog-bulk-import.ts all unaffected |

**Compliance summary**: 4/6 compliant (SC-4 FAILING, SC-5 PARTIAL)

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| Migration DDL | ✅ Implemented | Drops old constraints, adds UNIQUE + CHECK XOR. File named `036_alcance_territorio_unico.sql` (matches project Spanish convention) |
| fetchMunicipiosPorDepartamento helper | ✅ Implemented | In `comunas.ts` — correctly filters municipios by id_departamento |
| Editor rewrite | ✅ Implemented | 3 radios (Nacional/Departamental/Municipal), conditional dropdowns, JSON hidden output. Exports `parseInitial` and `AlcanceValue` type. |
| Form wiring | ✅ Implemented | `create-campaign-form.tsx` renders editor, passes props correctly |
| syncCampaignAlcance rewrite | ✅ Implemented | Parses JSON from hidden field, DELETE + INSERT, handles all 3 types |
| updateCampaignAlcanceAction | ✅ Implemented | Same logic + voter validation query. Warning computed but **never surfaced** |
| Campaign detail page | ⚠️ Partial | Reads single-row alcance correctly. BUT: uses `updateCampaignAlcanceFormAction` (returns `void`) — no warning banner |
| Warning banner UI | ❌ Missing | No client component, no `useActionState`, no toast or banner in the campaign page |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| JSON hidden input | ✅ Yes | Editor produces `alcance` hidden field with `JSON.stringify(AlcanceValue)` |
| Migration file | ✅ Yes | New file `036_alcance_territorio_unico.sql` (different name than design's `036_territorial_scope_constraints.sql` but follows same pattern) |
| Delete-insert pattern | ✅ Yes | `syncCampaignAlcance` deletes all rows, conditionally inserts one |
| Server-side voter warning | ❌ No | Logic exists in `updateCampaignAlcanceAction` but `updateCampaignAlcanceFormAction` (the form action used in the page) returns `void`, discarding the warning. This contradicts Design Decision 4 and the Data Flow diagram. |
| New helper in comunas.ts | ✅ Yes | `fetchMunicipiosPorDepartamento` added (named differently from task's `queryMunicipiosPorDepartamento` but functionally equivalent) |

### Issues Found

**CRITICAL**:
1. **Warning banner never displayed** — `updateCampaignAlcanceFormAction` wraps `updateCampaignAlcanceAction` and returns `Promise<void>`, discarding the `{ok, warning}` response. The campaign page (`page.tsx`) uses `action={updateCampaignAlcanceFormAction}` and is a server component with no mechanism to intercept or display server action responses. The voter warning is computed server-side but entirely invisible. Breaks Success Criterion SC-4.

**WARNING**:
1. **Silent fallback on invalid server input** — When `syncCampaignAlcance` receives `{tipo: "departamental", id_departamento: ""}` or `{tipo: "municipal", id_municipio: ""}`, it silently deletes existing rows and inserts nothing, degrading the campaign scope to Nacional without error. The design requires "clear error messages" for invalid combinations (SC-5). Browser-side `required` on the select fields mitigates this in practice but is not server-side enforcement.
2. **Function name mismatch** — Task 1.2 specifies `queryMunicipiosPorDepartamento` but implementation is `fetchMunicipiosPorDepartamento`. Function works correctly; purely a naming inconsistency.
3. **Migration name mismatch** — Design/tasks reference `036_territorial_scope_constraints.sql` but actual file is `036_alcance_territorio_unico.sql`. The actual name follows the project's Spanish convention and is arguably better.

**SUGGESTION**:
1. **Unused export** — `parseInitial` is exported from `territorio-alcance-editor.tsx` but has no imports anywhere in the codebase. Consider removing or documenting its intended usage.
2. **Fragile non-null assertion** — `page.tsx` line 106 uses `alcanceData.data.id_departamento!` with a non-null assertion. Currently safe due to the CHECK XOR constraint, but silently produces `String(null)` → `"null"` if both columns are null. Could be made defensive with explicit checks.

### Verdict
**FAIL**

The voter-outside-scope warning is computed but never displayed — the form action wrapper (`updateCampaignAlcanceFormAction`) returns `void`, discarding the response. This breaks Success Criterion SC-4 ("Changing scope shows non-blocking warning when voters exist outside new scope"). A fix requires either: (a) making the campaign page a client component with `useActionState` to capture the response, or (b) using a different pattern (e.g., server action with `revalidatePath` + flash message, or a client wrapper component that reads the action response).
