# Proposal: Plataforma de campañas políticas

## Intent

Construir una plataforma **modular, parametrizable y escalable** para campañas políticas en Colombia que permita:

1. **Recolectar información de votantes** (nombres, apellidos, teléfono, puesto de votación, zona) mediante WhatsApp, Telegram y canal web activo.
2. **Gestionar la marca** de cada campaña (logo, colores, tipografía) de forma autónoma.
3. **Visualizar estadísticas** operativas (votantes por zona, pureza de datos, KPIs).
4. **Verificar cédulas** contra la registraduría vía integración con **CAPTCHA Solver**.
5. **Auditar formularios E14** (PDF) con IA para detectar anomalías e informar a abogados.
6. **Detectar y aislar duplicados** mediante un módulo de **cuarentena** que no contamine la base maestra hasta resolución.

El problema central es la dispersión de datos de votantes en múltiples canales sin control de calidad, sin verificación electoral y sin capacidad de detectar inconsistencias (duplicados, E14 alterados) a escala.

## Scope

### In Scope

- **Producto SaaS comercial**: múltiples campañas/clientes políticos en una instalación
- Plataforma web: **Next.js** (UI) + **Python/Flask** (stats, IA) + **Supabase** (datos)
- Multi-tenancy por campaña con aislamiento RLS
- Módulo de registro de votantes con estados y auditoría
- Módulo de cuarentena y resolución de duplicados
- Canales: WhatsApp (Twilio), Telegram, formulario web autenticado + **formulario público por enlace**
- Módulo de branding **de plataforma** (logo, colores, tipografía — solo dueños, no por político)
- Dashboard de estadísticas MVP
- Integración CAPTCHA Solver (consulta registraduría / puesto de votación)
- Módulo E14: carga PDF, análisis IA async, informes para abogados
- Auth, roles y permisos por campaña
- API modular entre bounded contexts
- Campos detallados del votante: definición en fase de diseño Supabase

### Out of Scope (MVP)

- Donaciones y recaudación de fondos
- Movilización masiva (convocatorias a eventos)
- App nativa offline completa
- Integración directa con registraduría sin CAPTCHA Solver
- Certificación legal / compliance electoral formal
- Módulos futuros no especificados

## Capabilities

### New Capabilities

- `platform-core`: Auth SaaS, **módulo único de admin para dueños** (`platform_owner`), asignación de usuarios a campañas, roles, feature flags
- `voter-registry`: CRUD de votantes, estados, normalización, auditoría (campos finales en fase BD)
- `voter-quarantine`: Detección de duplicados, cola de cuarentena, panel de resolución
- `capture-channels`: WhatsApp (Twilio), Telegram, web autenticada, web pública por enlace
- `brand-config`: Logo, colores, tipografía de **la plataforma** (solo `platform_owner`)
- `analytics-dashboard`: KPIs por zona, pureza, cuarentena, canales, recolectores
- `captcha-solver-integration`: Consulta registraduría vía CAPTCHA Solver, verificación puesto/nombre
- `e14-ai-audit`: Ingesta PDF, pipeline IA, detección de anomalías, informes abogados

### Modified Capabilities

_(Ninguna — proyecto greenfield)_

## Approach

Arquitectura **híbrida y sencilla**:

- **Next.js 15 + Tailwind + shadcn/ui** (`apps/web/`) — UI limpia, moderna, profesional
- **Python 3.12 + Flask** (`services/python/`) — estadísticas, ciencia de datos, IA (E14), export ZIP, PDF de cierre, jobs
- **Supabase** — Postgres + RLS, Auth, Storage; Edge Functions solo para webhooks ligeros

**Supabase** como fuente de verdad. **Flask** para todo procesamiento analítico y pesado. **Next.js** solo presentación y flujos de usuario.

**Cuarentena**: tabla `voter_quarantine`; promoción a `voters` tras resolución explícita.

**CAPTCHA Solver y E14**: cola `job_queue` procesada por worker Flask.

**WhatsApp**: Twilio → Edge Function delgada → Flask/Postgres.

## Decisiones confirmadas (PO — 2026-06-13)

| Tema | Decisión |
|------|----------|
| Modelo de negocio | SaaS multi-campaña — producto vendible a distintos políticos |
| Admin de plataforma | **Un solo módulo** para dueños — asignan usuarios a cada campaña |
| Coincidencias | **Crítico** — cuarentena por campaña, sin cruce entre políticos |
| Formulario web público | Sí, en MVP — acceso solo por enlace único (no listado público) |
| Verificación registraduría | **CAPTCHA Solver** (resolución de captchas + consulta puesto) |
| WhatsApp | **Twilio** — número y credenciales **por campaña** |
| Integraciones | **Por campaña** (WA, CAPTCHA, TG, IA); Supabase **compartido** |
| Campos del votante | Se definen en fase de construcción de BD Supabase |
| Stack | Next.js (UI) + **Python/Flask** (stats, IA, export) + Supabase |
| UI | Tailwind + shadcn/ui — limpia, moderna, sin sobre-ingeniería |

## MVP Delivery Order

| Fase | Módulos | Entregable |
|------|---------|------------|
| 1 | `platform-core` | Auth, campañas, roles, RLS base |
| 2 | `voter-registry` + `voter-quarantine` | Modelo de datos, cuarentena, API interna |
| 3 | `capture-channels` (web primero) | Formulario web + trazabilidad |
| 4 | `brand-config` | Branding de plataforma (solo dueños) |
| 5 | `analytics-dashboard` | Dashboard MVP |
| 6 | `captcha-solver-integration` | Verificación cédulas / puesto vía CAPTCHA Solver |
| 7 | `capture-channels` (WA + TG) | Bots conversacionales |
| 8 | `e14-ai-audit` | Pipeline E14 + informes |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/` | New | Especificaciones y diseño SDD |
| `apps/web/` | New | Next.js UI (Tailwind + shadcn/ui) |
| `services/python/` | New | Flask API: stats, export, E14, jobs |
| `supabase/migrations/` | New | Schema Postgres + RLS |
| `supabase/functions/` | New | Edge Functions webhooks delgados |

## Rollback Plan

- Feature flags por módulo en `campaign_features` — desactivar canal o integración sin despliegue
- Migraciones Supabase reversibles por fase
- CAPTCHA Solver/E14: modo degradado (cola pendiente) si servicio externo cae

## Risks

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| API CAPTCHA Solver no documentada | Alta | Adaptador + mock; contrato en design.md |
| Límites WhatsApp | Media | Cola + rate limit |
| Privacidad datos electorales | Alta | RLS, retención configurable, audit log |
| Costo IA E14 | Media | Límites por campaña, batch processing |

## Open Questions (pendientes)

1. Documentación/credenciales de **CAPTCHA Solver** para afinar contrato API
2. Modelo IA para E14 (costo/latencia/precisión)
3. Volumen pico día electoral (dimensionar colas)
4. **Campos definitivos del votante** — se definirán al construir esquema Supabase
