# Platform Core Specification

## Purpose

Base multi-tenant de la plataforma: autenticación, **administración de plataforma (dueños)**, campañas, asignación de usuarios, roles, permisos y feature flags.

## Modelo de administración (dos niveles)

```
┌─────────────────────────────────────────────────────────┐
│  NIVEL 1 — Plataforma (nosotros, los dueños del SaaS)   │
│  Un solo módulo de administración / configuración       │
│  • Crear clientes (políticos recurrentes) y campañas por elección │
│  • Asignar usuarios a cada campaña                      │
│  • Activar módulos por campaña (feature flags)          │
│  • Ver métricas globales (sin mezclar datos de votantes)│
└───────────────────────────┬─────────────────────────────┘
                            │ asigna usuarios
                            ▼
┌─────────────────────────────────────────────────────────┐
│  NIVEL 2 — Campaña (equipo de cada político)            │
│  • campaign_admin, supervisores, recolectores, abogados │
│  • Gestión de votantes, cuarentena, stats, E14        │
│  • Sin acceso a otras campañas                          │
└─────────────────────────────────────────────────────────┘
```

**Regla clave:** Los dueños gobiernan **todas** las campañas desde `/platform`, pero cada político vive en un **silo cerrado**: no ve, no compara ni entra en la campaña de otro. La cuarentena solo detecta duplicados **entre recolectores de la misma campaña** — ver `voter-quarantine`. Político 1 y político 2 **no se cruzan nunca**.

## Requirements

### Requirement: Módulo único de administración de plataforma (dueños)

The system MUST exponer un **módulo de administración de plataforma** exclusivo para `platform_owner`. MUST ser **uno solo** a nivel instalación — no uno por campaña. Solo usuarios con rol `platform_owner` MUST acceder a rutas `/platform/*`.

Funciones del módulo:
- Crear, editar, pausar y archivar campañas (clientes/políticos)
- **Asignar y revocar usuarios** en cada campaña con su rol de campaña
- Configurar feature flags e integraciones por campaña
- Auditoría de asignaciones y cambios de configuración

#### Scenario: Dueño asigna usuario a campaña del político

- GIVEN un `platform_owner` autenticado
- WHEN asigna al usuario `maria@ejemplo.com` a la campaña "Candidato X" con rol `campaign_admin`
- THEN MUST crearse registro en `campaign_members`
- AND maria MUST poder acceder solo a la campaña "Candidato X", no a otras
- AND MUST registrarse en `audit_log` quién asignó, a quién y con qué rol

#### Scenario: Usuario de campaña sin acceso al módulo de plataforma

- GIVEN un usuario con rol `campaign_admin` en una campaña
- WHEN intenta acceder a `/platform/campaigns`
- THEN el sistema MUST denegar acceso con HTTP 403

### Requirement: SaaS multi-campaña (producto comercial)

The system MUST operar como **plataforma SaaS**: una instalación sirve múltiples campañas políticas independientes (diferentes clientes/candidatos). Cada campaña MUST tener aislamiento total de datos vía `campaign_id` y Supabase RLS. Solo `platform_owner` MUST poder provisionar nuevas campañas.

#### Scenario: Nueva campaña cliente

- GIVEN `platform_owner` crea campaña para nuevo político
- WHEN se activa la campaña
- THEN MUST existir espacio aislado (datos, integraciones, enlaces)
- AND ningún usuario de otra campaña MUST ver sus votantes ni su cuarentena

### Requirement: Multi-tenant por campaña

The system MUST aislar todos los datos por `campaign_id` usando Supabase RLS. Un usuario MUST NOT acceder a datos de campañas donde no tiene membresía. `platform_owner` MAY listar campañas y metadatos pero MUST NOT consultar votantes ni cuarentena sin justificación auditada (soporte).

#### Scenario: Aislamiento entre campañas

- GIVEN un recolector miembro solo de la campaña A
- WHEN consulta votantes
- THEN solo recibe registros con `campaign_id = A`

#### Scenario: Coincidencias aisladas por campaña

- GIVEN la misma cédula registrada en campaña A y campaña B (distintos políticos)
- WHEN se evalúan duplicados
- THEN cada coincidencia MUST resolverse **solo dentro de su campaña**
- AND MUST NOT fusionar ni alertar cruzado entre campañas A y B

### Requirement: Roles en dos niveles

**Nivel plataforma** (global, solo dueños):
- `platform_owner` — administración completa del SaaS, asignación de usuarios a campañas

**Nivel campaña** (por político, asignados por dueños):
- `campaign_admin` — administra su campaña (usuarios internos si se delega, config operativa)
- `supervisor` — resuelve **coincidencias/cuarentena**, ve estadísticas de su equipo
- `collector` — captura votantes en canales asignados
- `lawyer` — consulta E14 e informes de anomalías

Cada rol de campaña MUST definirse en `campaign_members.role`. Un usuario MAY pertenecer a varias campañas con roles distintos.

#### Scenario: Recolector sin acceso a E14

- GIVEN un usuario con rol `collector`
- WHEN intenta acceder al módulo E14
- THEN el sistema MUST denegar acceso con HTTP 403

#### Scenario: Supervisor resuelve coincidencias

- GIVEN un usuario con rol `supervisor` en campaña X
- WHEN accede al panel de cuarentena
- THEN MUST ver solo coincidencias de campaña X
- AND MUST poder fusionar, descartar o escalar registros en cuarentena

### Requirement: Asignación de usuarios por dueños de plataforma

The system MUST permitir a `platform_owner` invitar o vincular usuarios existentes a una campaña con rol específico. La asignación MUST poder revocarse. Usuarios de campaña MUST NOT auto-asignarse a otras campañas.

#### Scenario: Revocar acceso a campaña

- GIVEN usuario asignado a campaña X como `collector`
- WHEN `platform_owner` revoca su membresía
- THEN el usuario MUST perder acceso inmediato a datos de campaña X
- AND MUST registrarse en `audit_log`

### Requirement: Cliente recurrente (cuenta del político)

The system MUST modelar **clientes** (`clients`) como cuenta persistente del político u organización. Un cliente MAY tener **múltiples campañas** a lo largo del tiempo (ej. alcaldía 2024, senado 2028). Las campañas MUST referenciar `client_id`.

El historial del cliente MUST mostrar campañas pasadas (nombre, fechas, estado). Tras `purged`, MUST NOT exponer votantes, cuarentena, E14 ni archivos de esa campaña.

#### Scenario: Político recurrente con segunda campaña

- GIVEN cliente "Candidato X" con campaña 2024 en estado `purged`
- WHEN `platform_owner` crea campaña 2028 para el mismo `client_id`
- THEN MUST existir nueva campaña con silo operativo vacío
- AND el cliente MUST ver ambas en historial (2024 finalizada, 2028 activa)
- AND MUST NOT reutilizar votantes ni cuarentena de 2024

### Requirement: Cierre de campaña y exportación para entrega

When `platform_owner` marca una campaña como `ended`, el sistema MUST dejar de aceptar captura nueva y MUST habilitar **exportación** de datos operativos para entrega al político. Solo `platform_owner` MUST poder finalizar campañas y generar exportaciones; `campaign_admin` MAY descargar export ya generada durante `ended` si el dueño lo delega vía permiso.

El paquete de export para entrega al político MUST incluir **únicamente**:

1. **Votantes** (`voters`) + **historial** (`voter_history`)
2. **Cuarentena** (`voter_quarantine` — registros y resoluciones exportables)
3. **E14** (`e14_documents`, `e14_anomalies`, PDFs en Storage)
4. **Estadísticas** — un **PDF** con el snapshot de cómo quedó la campaña al momento del cierre (KPIs, zonas, pureza, cuarentena, canales agregados)

The system MUST NOT incluir en el export: branding (es de la plataforma, no del político), canales, enlaces de verificación/captura, configuración de campaña ni `audit_log`. Formato: **ZIP** con carpetas por dominio + `manifest.json` con checksums. MUST registrarse en `campaign_exports` y `audit_log` (la acción de export, no el contenido de auditoría en el ZIP).

#### Scenario: Exportación al finalizar para entrega al político

- GIVEN campaña en `ended` con votantes, cuarentena, E14 y stats
- WHEN `platform_owner` marca `ended` y solicita export
- THEN MUST generarse ZIP con: `voters/`, `voter_history/`, `quarantine/`, `e14/` (PDFs + anomalías), `estadisticas-cierre.pdf`
- AND MUST NOT incluir branding, canales, enlaces, config ni audit
- AND MUST registrarse en `campaign_exports` con actor, timestamp y checksum
- AND la campaña MUST permanecer en `ended` con datos aún consultables por dueños

#### Scenario: Campaña finalizada sin captura nueva

- GIVEN campaña en estado `ended`
- WHEN llega registro por WhatsApp o web público
- THEN MUST rechazarse o ignorarse según canal
- AND MUST registrarse evento de skip en `audit_log`

### Requirement: Purga discrecional — solo decisión del dueño

The system MUST NOT purgar campañas automáticamente. Solo `platform_owner` MUST poder ejecutar purga manual (`ended` → `purged`), de forma **irreversible**. Antes de purgar, el sistema SHOULD advertir si no existe export reciente. La purga MUST eliminar: `voters`, `voter_quarantine`, `e14_*`, `channel_sessions`, `capture_public_links`, exports en Storage y colas asociadas. MUST conservar metadatos de campaña + `audit_log` sin PII de votantes.

#### Scenario: Dueño decide no purgar aún

- GIVEN campaña en `ended` con export ya entregada
- WHEN pasan días o meses sin acción de purga
- THEN los datos MUST seguir en el SaaS
- AND solo `platform_owner` MUST ver opción de purgar en `/platform`

#### Scenario: Purga manual por ahorro de espacio

- GIVEN campaña en `ended` y export confirmada
- WHEN `platform_owner` confirma purga
- THEN estado MUST ser `purged`
- AND consultas operativas MUST devolver vacío
- AND historial del cliente MUST mostrar "purgada" sin acceso a datos

### Requirement: Silos entre campañas del mismo cliente

Votantes y cuarentena MUST NOT compartirse entre campañas del mismo `client_id`. Cada `campaign_id` es silo independiente — igual que entre políticos distintos.

#### Scenario: Misma cédula en dos campañas del mismo político

- GIVEN cédula registrada en campaña 2024 (activa o ya purgada)
- WHEN se registra en campaña 2028 del mismo cliente
- THEN MUST tratarse solo dentro de campaña 2028
- AND MUST NOT alertar ni fusionar con campaña 2024

### Requirement: Gestión de campañas

The system MUST permitir solo a `platform_owner` crear, activar y desactivar campañas. Cada campaña MUST tener nombre, slug, `client_id`, timezone y estado (`active` | `paused` | `ended` | `purged`).

#### Scenario: Crear campaña

- GIVEN un `platform_owner` autenticado
- WHEN crea una campaña con nombre y slug únicos
- THEN la campaña queda en estado `active`
- AND queda lista para asignación de usuarios del político

### Requirement: Integraciones por campaña (APIs externas)

Solo `platform_owner` MUST configurar en `/platform/campaigns/{id}/integrations` las credenciales **propias de cada campaña** para servicios externos. MUST almacenarse cifradas en `campaign_integrations` con `campaign_id` + `provider`.

Integraciones configurables por campaña:
- **CAPTCHA Solver**: API key y URL base
- **Telegram**: bot token
- **IA (E14)**: proveedor, API key, modelo

Cada campaña MUST usar **sus** credenciales al invocar servicios externos — nunca mezclar números ni keys entre campañas.

#### Scenario: CAPTCHA Solver por campaña

- GIVEN dos campañas con API keys distintas en `campaign_integrations`
- WHEN Flask procesa verificación de cédula
- THEN MUST usar la key de la `campaign_id` correspondiente

### Requirement: Supabase compartido (una sola instancia)

The system MUST usar **un solo proyecto Supabase** para toda la plataforma. MUST NOT provisionar proyecto Supabase por campaña en MVP. Aislamiento de datos vía `campaign_id` + RLS. Control de gastos de infra Supabase es **global** (un plan); el control por cliente se hace en **APIs externas** y uso medido por campaña.

#### Scenario: Sin Supabase por político

- GIVEN campaña del Político A y campaña del Político B
- WHEN consultan votantes
- THEN ambas usan el mismo proyecto Supabase con RLS distinto
- AND MUST NOT existir URL ni service key Supabase separada por campaña

### Requirement: Control de gastos — solo administradores de plataforma

The system MUST registrar uso en `campaign_usage` por campaña (mensajes WA, consultas CAPTCHA Solver, tokens IA E14, exports). Solo `platform_owner` MUST ver el panel `/platform/campaigns/{id}/usage`. Usuarios de campaña (`campaign_admin`, `supervisor`, `collector`, `lawyer`) MUST NOT ver costos, contadores de consumo ni desglose por proveedor — ustedes entregan un **paquete cerrado** al cliente.

#### Scenario: Equipo del político sin acceso a gastos

- GIVEN `campaign_admin` de la campaña X
- WHEN intenta acceder a `/platform/campaigns/X/usage` o cualquier vista de costos
- THEN MUST recibir HTTP 403

#### Scenario: Dueño revisa gastos internos

- GIVEN campaña activa con WhatsApp y CAPTCHA Solver
- WHEN `platform_owner` abre panel de uso
- THEN MUST ver contadores del período solo para control interno
- AND MUST NOT exponerse en dashboard de campaña del político

### Requirement: Feature flags por campaña

The system MUST almacenar flags de módulos (`capture_whatsapp`, `capture_telegram`, `capture_web_public`, `captcha_solver`, `e14_audit`, etc.) en `campaign_features`. Solo `platform_owner` MUST modificar flags. Módulos deshabilitados MUST NOT exponerse en UI ni procesar eventos.

#### Scenario: Cliente contrató módulo E14

- GIVEN `platform_owner` activa `e14_audit = true` para la campaña
- WHEN `lawyer` o `campaign_admin` entra a la app
- THEN MUST ver módulo E14 en `/campaign/{id}/e14`

#### Scenario: Cliente sin módulo E14

- GIVEN `e14_audit = false`
- WHEN cualquier usuario de la campaña navega
- THEN MUST NOT existir módulo ni menú E14

#### Scenario: Desactivar WhatsApp

- GIVEN `capture_whatsapp = false` para la campaña
- WHEN llega un webhook de WhatsApp
- THEN el sistema MUST ignorar el mensaje y registrar evento de skip

### Requirement: Auditoría de acciones sensibles

The system MUST registrar en `audit_log` acciones de: asignación/revocación de usuarios a campañas, creación de campañas, cambio de feature flags, login, cambio de rol, resolución de cuarentena/coincidencias, cambio de branding de plataforma, carga E14, **exportación de campaña**, **purga de campaña**, cierre (`ended`).

#### Scenario: Log de asignación por dueño

- GIVEN `platform_owner` asigna usuario a campaña
- WHEN confirma la asignación
- THEN MUST existir entrada en `audit_log` con actor, campaña, usuario asignado y rol

#### Scenario: Log de resolución de coincidencia

- GIVEN un supervisor resuelve un duplicado en cuarentena
- WHEN confirma fusión
- THEN MUST existir entrada en `audit_log` con actor, acción y entidad afectada
