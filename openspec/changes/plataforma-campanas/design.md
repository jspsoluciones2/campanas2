# Design: Plataforma de campañas políticas

## Technical Approach

Stack **híbrido y sencillo** — cada capa con el lenguaje que mejor le corresponde:

| Capa | Tecnología | Responsabilidad |
|------|------------|-----------------|
| **UI** | Next.js 15 + TypeScript + Tailwind + shadcn/ui | Interfaz limpia, moderna y profesional; solo presentación y flujos de usuario |
| **Datos e IA** | **Python 3.12 + Flask** | Estadísticas, ciencia de datos, IA (E14), export ZIP, PDF de cierre, jobs pesados |
| **Backend** | Supabase | Postgres + RLS, Auth, Storage; Edge Functions **solo** para webhooks ligeros (Twilio/Telegram) |

Monorepo:
```
apps/web/              ← Next.js (UI)
services/python/       ← Flask API (stats, export, E14, jobs)
supabase/              ← migraciones, webhooks delgados
```

**Principio de simplicidad:** Next.js no hace cálculos estadísticos ni IA. Flask no renderiza pantallas complejas. Supabase no reemplaza Python en análisis de datos. Sin microservicios extra ni frameworks adicionales en MVP.

Ocho módulos de negocio se mantienen como bounded contexts; la lógica de datos/IA vive en `services/python/app/modules/`.

## Architecture Decisions

### Decision: Stack híbrido Next.js + Python (Flask)

**Choice**: UI en **Next.js 15** con **Tailwind CSS** y **shadcn/ui** (interfaz limpia y moderna). Lógica de **estadísticas, export, E14/IA y jobs de datos** en **Python 3.12 + Flask** (`services/python/`).  
**Alternatives considered**: Todo Next.js/TS; Django full-stack; FastAPI; microservicios múltiples.  
**Rationale**: El PO pide Python por expertise en ciencia de datos e IA; Flask por **simplicidad** y bajo ceremony. Next.js entrega UI profesional sin complicar el backend analítico.

**División de responsabilidades:**
- **Next.js**: login, dashboards, formularios, cuarentena UI, admin plataforma
- **Flask**: agregaciones stats, `estadisticas-cierre.pdf`, export ZIP, pipeline E14, cola CAPTCHA Solver, purga batch
- **Supabase Edge Functions**: solo webhooks Twilio/Telegram (receptor delgado → Flask o Postgres)

### Decision: UI limpia y moderna (sin sobre-ingeniería)

**Choice**: Tailwind + shadcn/ui + layout consistente (sidebar, cards, tablas). Paleta desde `platform_brand_config`. Sin design system custom ni librerías UI adicionales en MVP.  
**Alternatives considered**: Material UI, Ant Design, CSS modules custom.  
**Rationale**: shadcn es moderno, accesible y mantenible con pocos componentes; cumple “profesional pero no complicado”.

### Decision: Administración en dos niveles (dueños vs campaña)

**Choice**: Módulo único `/platform` para `platform_owner` (dueños del SaaS) + dashboards `/campaign/{id}` para equipos de cada político.  
**Alternatives considered**: Un solo admin con superadmin por campaña; self-service signup de políticos.  
**Rationale**: El PO es el operador del producto: **ellos asignan usuarios a cada campaña**. Los políticos no se auto-provisionan; el control de acceso centralizado es requisito comercial.

**Flujo de onboarding cliente:**
1. `platform_owner` crea campaña (político X)
2. `platform_owner` asigna usuarios del político (campaign_admin, supervisores, recolectores…)
3. Equipo del político opera solo su campaña
4. Coincidencias de votantes se resuelven en cuarentena por supervisores de esa campaña

### Decision: Cierre con exportación + purga discrecional del dueño

**Choice**: Al finalizar campaña (`ended`): export ZIP con **solo** votantes+historial, cuarentena, E14 y **PDF de estadísticas** al cierre. Sin branding, canales, enlaces, config ni audit en el paquete. Purga manual posterior por `platform_owner`.

**Ciclo de vida campaña:**
```
active → paused → ended ──► export disponible (entrega al político)
                    │
                    │  (datos siguen en SaaS; decisión del dueño)
                    ▼
              purged  ← solo platform_owner, manual, irreversible
                    ↑
              borra voters, quarantine, e14, storage...
              queda: metadata campaña + audit_log agregado
```

### Decision: Cliente recurrente + campaña desechable (post-purga)

**Choice**: Entidad `clients` + `campaigns` con `client_id`. Tras purga manual, solo metadato de historial. Nueva campaña = silo vacío.  
**Alternatives considered**: Sin historial; conservar votantes entre elecciones.  
**Rationale**: Clientes recurrentes sin arrastrar datos electorales.

### Decision: Aislamiento absoluto entre políticos (silos)

**Choice**: Cada campaña es silo cerrado. Cuarentena solo dentro de la misma `campaign_id`.  
**Alternatives considered**: Cuarentena cross-campaña.  
**Rationale**: Políticos no deben verse ni cruzarse.

### Decision: Branding único de plataforma

**Choice**: `platform_brand_config` en `/platform/settings/brand`; solo `platform_owner`. Sin tema por campaña; no va en export.  
**Alternatives considered**: White-label por político.  
**Rationale**: El branding es de los dueños del SaaS, no del político.

### Decision: Multi-tenant con RLS (un código, un servidor)

**Choice**: **Un** repositorio, **un** deploy (Next.js + Supabase), aislamiento lógico con `campaign_id` + RLS en todas las tablas de negocio. Panel `/platform` para dueños que gobiernan todas las campañas sin mezclar datos operativos de votantes.  
**Alternatives considered**: Deploy + base de datos **por político** (instancia dedicada por cliente); schema por campaña en Postgres.  
**Rationale**: El PO debe gobernar **todas** las campañas desde un solo módulo de administración. N deploys implican N mantenimientos y pierden el panel central. RLS en Supabase es el estándar probado para SaaS B2B; el aislamiento que exige el negocio se logra en políticas, no duplicando infraestructura. Tier “dedicado” (proyecto Supabase separado) puede ofrecerse después como premium, con el **mismo** código fuente.

### Decision: Cuarentena en tabla separada

**Choice**: `voter_quarantine` independiente de `voters`; promoción explícita tras resolución.  
**Alternatives considered**: Flag `is_duplicate` en misma tabla; soft-delete.  
**Rationale**: Evita contaminar base maestra; auditoría clara; consultas de producción más simples.

### Decision: Integraciones vía adaptadores

**Choice**: Interfaces `IVoterVerificationProvider`, `IMessagingChannel`, `IE14Analyzer` con implementaciones intercambiables.  
**Alternatives considered**: Llamadas directas a APIs en handlers.  
**Rationale**: CAPTCHA Solver, WhatsApp y IA pueden cambiar sin tocar dominio.

### Decision: Gastos internos — invisible al cliente

**Choice**: `campaign_usage` registrado por campaña; panel `/platform/campaigns/{id}/usage` **exclusivo** de `platform_owner`. Equipos de campaña MUST NOT ver costos ni consumo por proveedor.  
**Rationale**: El PO entrega paquete cerrado al político; gastos son control de margen interno.

### Decision: E14 — una ejecución, cliente solo ve

**Choice**: `platform_owner` dispara **una vez** por lote electoral: descarga E14 registraduría + análisis IA (tachones, cuentas, etc.). Campañas con `e14_audit = true` del mismo proceso **ven el mismo resultado** en su módulo — **solo lectura**. Cliente no sube, no descarga, no ejecuta.  
**Rationale**: E14 es documento público por mesa; un análisis sirve a todos los políticos que contrataron el módulo en esa elección.

### Decision: Integraciones externas por campaña; Supabase compartido

**Choice**: Tras crear campaña, `platform_owner` configura en `/platform/campaigns/{id}/integrations` credenciales **propias por campaña**: Twilio/WA (número propio, subaccount ISV), CAPTCHA Solver, Telegram, IA E14. Tabla `campaign_integrations` cifrada. **Un solo Supabase** para toda la plataforma — no un proyecto Supabase por político.  
**Alternatives considered**: APIs globales compartidas (un WA para todos); Supabase por cliente (tier premium).  
**Rationale**: El PO quiere **controlar gastos** por campaña/cliente. Twilio subaccounts y API keys separadas permiten atribuir costos. Supabase compartido mantiene un panel, un RLS y evita multiplicar costos fijos de infra × N políticos.

**Control de gastos:**
```
Gasto atribuible por campaña     →  Twilio, CAPTCHA, IA (keys/números propios + campaign_usage)
Gasto infra compartido           →  Supabase, hosting (un plan; optimizar con purga)
Apagar módulo caro               →  campaign_features (sin redeploy)
```

| Servicio | ¿Por campaña? | Motivo |
|----------|---------------|--------|
| WhatsApp/Twilio | **Sí** | Número y facturación propios |
| CAPTCHA Solver | **Sí** | Medir consultas por cliente |
| Telegram | **Sí** | Bot propio por campaña |
| IA E14 | **Sí** | Limitar tokens por cliente |
| Supabase | **No** (compartido) | Un edificio, apartamentos con RLS |

### Decision: WhatsApp vía Twilio (sin integración directa Meta)

**Choice**: Twilio Programmable Messaging para WhatsApp — webhooks a Supabase Edge Functions, Messaging Service por campaña (subaccounts en modelo ISV).  
**Alternatives considered**: Meta Cloud API directa; APIs no oficiales; solo Telegram/web.  
**Rationale**: El PO prefiere **no integrar Meta directamente** en la aplicación. Twilio abstrae onboarding WABA, plantillas, webhooks y reintentos. La app solo habla con Twilio.  
**Nota técnica**: WhatsApp oficial siempre transita la red de Meta; Twilio elimina la dependencia operativa directa (tokens Meta, webhooks Meta, rotación) en nuestro código. Si WhatsApp falla a nivel red, Telegram + web público por enlace siguen operativos.

**Proceso Twilio (resumen para implementación)**:
1. Cuenta Twilio (+ subaccount por campaña cliente en modelo ISV)
2. Registrar WhatsApp Sender vía Twilio Console o Channels API
3. Aprobar plantillas de mensaje (Meta vía Twilio)
4. Configurar webhook inbound → Edge Function `webhook-whatsapp`
5. Validar firma `X-Twilio-Signature` en cada request
6. Responder con TwiML o Messages API según flujo conversacional

### Decision: Jobs async — Python Flask (no Edge Functions pesadas)

**Choice**: Tabla `job_queue` procesada por **worker Flask** (cron o polling). CAPTCHA Solver, E14 e export/purga corren en Python.  
**Alternatives considered**: Supabase Edge Functions para todo; Celery + Redis en MVP.  
**Rationale**: Python ya está en el stack para stats/IA; un solo worker Flask mantiene el estándar simple. Celery se añade solo si el volumen lo exige.

### Decision: Frontend modular (Next.js)

**Choice**: Route groups `(platform)`, `(campaign)`, `(capture)` en `apps/web/`; componentes por módulo.  
**Alternatives considered**: Micro-frontends separados.  
**Rationale**: MVP más rápido; un deploy; módulos lógicamente separados.

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              Next.js + Tailwind + shadcn/ui (apps/web)        │
│   Platform Admin │ Campaign UI │ Capture forms │ Dashboards   │
└────────────────────────────┬─────────────────────────────────┘
                             │ REST (JWT Supabase)
┌────────────────────────────▼─────────────────────────────────┐
│              Python 3.12 + Flask (services/python)            │
│   /stats  /export  /e14  /jobs  /purge                        │
│   pandas · reportlab/weasyprint · IA SDK                      │
└────────────────────────────┬─────────────────────────────────┘
                             │ supabase-py (service role scoped)
┌────────────────────────────▼─────────────────────────────────┐
│                         Supabase                              │
│   Postgres+RLS │ Auth │ Storage │ Edge Fn (webhooks delgados) │
└────────────────────────────┬─────────────────────────────────┘
         Twilio WA │ Telegram │ CAPTCHA Solver │ OpenAI/etc.
```

## Data Flow — Registro con cuarentena

```
Canal (WA/TG/Web)
    │
    ▼
capture-channels (validar formato)
    │
    ▼
voter-registry.registerVoter()
    │
    ├── sin conflicto ──► voters (activo/pendiente)
    │
    └── conflicto ──► voter-quarantine.create()
                           │
                           ▼
                    Notificar supervisor
                           │
                           ▼
                    Resolución (fusionar/descartar)
                           │
                           ▼
                    voters (actualizado) + audit_log
```

## Data Flow — Verificación CAPTCHA Solver

```
voter creado (pendiente_verificacion)
    │
    ▼
job_queue.enqueue('verify_cedula')
    │
    ▼
Edge Function (webhook delgado) → encola job
    │
    ▼
Flask worker → CaptchaSolverAdapter.verify()
    │
    ├── éxito ──► actualizar puesto, nombres → activo
    └── fallo ──► reintento / permanece pendiente
```

## Database Schema (core tables)

| Tabla | Módulo | Descripción |
|-------|--------|-------------|
| `platform_members` | platform-core | Dueños del SaaS (`platform_owner`) |
| `clients` | platform-core | Político como cuenta recurrente (historial de campañas) |
| `campaigns` | platform-core | FK `client_id`, `electoral_process_id`, estados hasta `purged` |
| `electoral_processes` | platform-core | Misma elección — agrupa campañas para E14 compartido |
| `client_members` | platform-core | Usuarios vinculados al cliente (opcional; re-asignación por campaña) |
| `campaign_exports` | platform-core | Registro de exportaciones generadas (entrega al político) |
| `campaign_members` | platform-core | Usuarios asignados por dueños → campaña + rol |
| `platform_brand_config` | brand-config | Logo, colores, tipografía — solo plataforma |
| `campaign_features` | platform-core | Feature flags |
| `campaign_integrations` | platform-core | Credenciales cifradas por campaña (Twilio, CAPTCHA, TG, IA) |
| `campaign_usage` | platform-core | Contadores consumo — **solo visible a platform_owner** |
| `voters` | voter-registry | Registro maestro |
| `voter_history` | voter-registry | Auditoría cambios |
| `voter_quarantine` | voter-quarantine | Duplicados pendientes |
| `channel_sessions` | capture-channels | Sesiones WA/TG |
| `capture_public_links` | capture-channels | Tokens de formulario web público |
| `verification_queue` | captcha-solver-integration | Cola verificación registraduría |
| `e14_runs` | e14-ai-audit | Una ejecución: descarga registraduría + análisis IA |
| `e14_documents` | e14-ai-audit | PDFs por `e14_run_id` |
| `e14_anomalies` | e14-ai-audit | Tachones, cuentas, inconsistencias |
| `e14_analysis_jobs` | e14-ai-audit | Estado jobs del run |
| `job_queue` | shared | Cola genérica async |
| `audit_log` | platform-core | Auditoría global |

### RLS Pattern (ejemplo)

```sql
-- voters: solo miembros de la campaña
CREATE POLICY voters_select ON voters FOR SELECT
  USING (campaign_id IN (
    SELECT campaign_id FROM campaign_members
    WHERE user_id = auth.uid()
  ));
```

## Module Structure

```
apps/web/                          ← Next.js (UI)
├── app/(platform)/ (campaign)/ (capture)/ (auth)/
├── components/ui/                 ← shadcn/ui
└── lib/supabase/                  ← cliente browser (RLS)

services/python/                   ← Flask (datos, stats, IA)
├── app/
│   ├── api/                       ← blueprints: stats, export, e14, jobs
│   ├── modules/                   ← 8 bounded contexts (lógica)
│   ├── adapters/                  ← supabase, captcha, ia, twilio
│   └── worker.py                  ← job_queue consumer
├── requirements.txt
└── pyproject.toml

supabase/
├── migrations/
└── functions/                     ← webhooks delgados WA/TG
```

## Interfaces / Contracts

### IVoterVerificationProvider

```typescript
interface VoterVerificationResult {
  status: 'verified' | 'pending' | 'error';
  officialName?: string;
  pollingStation?: string;
  municipality?: string;
  department?: string;
  rawResponse?: unknown;
}

interface IVoterVerificationProvider {
  verifyCedula(cedula: string, campaignId: string): Promise<VoterVerificationResult>;
}
```

### IRegistrationService (interno)

```typescript
interface RegisterVoterInput {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  zona: string;
  canalOrigen: 'whatsapp' | 'telegram' | 'web' | 'web_publico';
  createdBy: string;
  campaignId: string;
}

type RegisterVoterResult =
  | { outcome: 'created'; voterId: string }
  | { outcome: 'quarantined'; quarantineId: string }
  | { outcome: 'validation_error'; errors: string[] };
```

### CAPTCHA Solver API (contrato provisional — validar con proveedor)

```typescript
// Integración con aplicación "CAPTCHA Solver"
// Responsabilidad: resolver captcha de registraduría + devolver datos de consulta
// POST {base_url}/consulta (ruta exacta TBD)
// Headers: Authorization: Bearer {api_key}
// Body: { cedula: string }
// Response: { nombre, puesto, municipio, departamento, mesa? }
```

### Webhook WhatsApp (Twilio)

```
POST /api/webhooks/whatsapp
→ Edge Function: validate signature
→ capture-channels.handleIncomingMessage()
→ respuesta TwiML / API reply
```

## Edge Functions

| Function | Trigger | Responsabilidad |
|----------|---------|-----------------|
| `webhook-whatsapp` | HTTP POST Twilio | Mensajes entrantes WA |
| `webhook-telegram` | HTTP POST Telegram | Mensajes entrantes TG |
| `process-verification-queue` | Cron 1min | Jobs CAPTCHA Solver |
| `process-e14-analysis` | Cron / trigger | Pipeline IA E14 |
| `escalate-quarantine` | Cron 1h | SLA 72h cuarentena |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Reglas duplicados, normalización, estados | Vitest en `src/modules/*/domain/` |
| Integration | RLS policies, adapters Supabase | Supabase local + test client |
| E2E | Flujo web captura, cuarentena UI | Playwright |
| Contract | CAPTCHA Solver mock, Twilio webhooks | MSW + fixtures |

## Migration / Rollout

1. **Fase 1**: Schema base + RLS + Auth (sin canales externos)
2. **Fase 2**: voter-registry + quarantine + web capture
3. **Fase 3**: brand + analytics
4. **Fase 4**: CAPTCHA Solver (mock → prod)
5. **Fase 5**: WhatsApp (Twilio) + Telegram
6. **Fase 6**: E14 + IA

Feature flags en `campaign_features` permiten activar módulos por campaña sin redeploy.

## Security

- RLS en todas las tablas de negocio
- API keys en `campaign_integrations` cifradas (Supabase Vault o env)
- Webhooks con validación de firma (Twilio, Telegram)
- PDFs E14 solo roles legal/admin
- Rate limiting en Edge Functions
- Habeas Data: política de retención configurable

## Open Questions

- [ ] Contrato API real de **CAPTCHA Solver** (URL, auth, rate limits)
- [ ] Modelo IA para E14 (costo/latencia/precisión)
- [ ] Volumen pico día electoral (dimensionar colas)
- [ ] **Campos definitivos del votante** — definición en fase migraciones Supabase
