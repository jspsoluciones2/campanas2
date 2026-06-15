# Tasks: Plataforma de campañas políticas

## Phase 0: Bootstrap

- [x] 0.1 Crear `apps/web/` — Next.js 15 (App Router, TS) + Tailwind + shadcn/ui
- [x] 0.2 Crear `services/python/` — Flask 3, `requirements.txt`, estructura `app/api/`, `app/modules/`
- [x] 0.3 `supabase init` + link remoto; `supabase/migrations`, `supabase/functions`
- [x] 0.4 Scaffold route groups `(platform)`, `(campaign)`, `(capture)`, `(auth)` en `apps/web/`
- [x] 0.5 `.env.example`: Supabase, `FLASK_API_URL`, Twilio, CAPTCHA Solver, IA
- [x] 0.6 Script dev local: Next.js + Flask + Supabase (`package.json` + `Makefile` o `docker-compose.yml`)

## Phase 1: platform-core

- [x] 1.1 Migración `001_platform_core.sql`: … `electoral_processes`, `campaign_integrations`, `campaign_usage`, `audit_log`
- [x] 1.2 RLS: `platform_owner` + aislamiento `campaign_id`
- [x] 1.3 Auth Supabase + middleware Next.js; cliente Flask valida JWT
- [x] 1.4 UI `/platform`: clients, campaigns, assignments (shadcn)
- [x] 1.4b UI `/platform/campaigns/{id}/integrations` (solo `platform_owner`)
- [x] 1.4c UI `/platform/campaigns/{id}/usage` (solo `platform_owner`)
- [x] 1.5 Ciclo campaña: `active` → `paused` → `ended` → `purged` (manual)
- [ ] 1.6 Flask `POST /export/{campaign_id}`: ZIP voters, history, quarantine, e14, stats PDF
- [ ] 1.7 UI export en campaña `ended`
- [ ] 1.8 Flask `POST /purge/{campaign_id}`

## Phase 2: voter-registry + voter-quarantine

- [x] 2.1 Migración `002_domain_schema.sql` (campos PO: votante, puestos, comunas, barrios, roles, novedades, trabajadores)
- [x] 2.2 Next.js formularios catálogos + registro manual votantes (`/campaign/{id}`)
- [x] 2.2b Flask `registerVoter()`
- [x] 2.3 Cuarentena scoped `campaign_id`
- [x] 2.4 UI `/campaign/{id}/quarantine`

## Phase 3: capture-channels (web)

- [ ] 3.1 Migración `003_capture.sql`
- [ ] 3.2 Formularios web autenticado + público por token
- [ ] 3.3 Flask captura → `registerVoter()`

## Phase 4: brand-config (plataforma)

- [ ] 4.1 Migración `004_platform_brand.sql` + bucket `platform-assets`
- [ ] 4.2 UI `/platform/settings/brand`
- [ ] 4.3 CSS variables globales Tailwind

## Phase 5: analytics-dashboard

- [ ] 5.1 Flask `/stats/{campaign_id}` (pandas)
- [ ] 5.2 Dashboard Next.js + recharts
- [ ] 5.3 `estadisticas-cierre.pdf` para export

## Phase 6: captcha-solver-integration

- [ ] 6.1 Migración `005_jobs.sql`
- [ ] 6.2 Flask CAPTCHA Solver adapter + worker
- [ ] 6.3 Flag `captcha_solver`

## Phase 7: capture-channels (WA + TG)

- [ ] 7.1 Edge Function webhook Twilio → Flask
- [ ] 7.2 Flask flujo WA; `campaign_integrations`
- [ ] 7.3 Bot Telegram

## Phase 8: e14-ai-audit

- [ ] 8.0 Migración `007_e14.sql`: `e14_runs`, `e14_documents`, `e14_anomalies` + bucket
- [ ] 8.1 UI `/platform/e14-runs`: Play descarga registraduría + IA (solo `platform_owner`)
- [ ] 8.2 Worker Flask: descarga registraduría + detección tachones/cuentas
- [ ] 8.3 UI `/campaign/{id}/e14`: **solo lectura** si `e14_audit=true`
- [ ] 8.4 Mismo `e14_run` en todas las campañas del proceso que contrataron E14
- [ ] 8.5 E14 en export ZIP si contrató módulo

## Phase 9: Verificación

- [ ] 9.1 pytest Flask
- [ ] 9.2 Tests RLS
- [ ] 9.3 E2E Playwright
- [ ] 9.4 `sdd-verify plataforma-campanas`
