# E14 AI Audit Specification

## Purpose

Auditoría de formularios E14: descarga desde la **registraduría**, revisión de PDFs con IA (tachones, totales que no cuadran, firmas, etc.) e informes para abogados.

**Reglas básicas:**
1. El **cliente solo ve** — no descarga, no sube, no ejecuta el análisis.
2. Ustedes (`platform_owner`) **activan** el módulo por campaña y **disparan una sola vez** el proceso por lote electoral.
3. El resultado se **comparte** con **todas** las campañas que contrataron E14 (`e14_audit = true`) en ese mismo proceso.

## Flujo (una sola ejecución)

```
platform_owner  →  Play (una vez)
       │
       ├─► 1. Descarga E14 desde web registraduría (Flask + CAPTCHA Solver si aplica)
       │
       ├─► 2. Almacena PDFs en Storage
       │
       └─► 3. IA revisa cada PDF (tachones, cuentas, inconsistencias…)
                    │
                    ▼
       Todas las campañas con e14_audit=true del mismo lote  →  solo lectura en su módulo
```

## Requirements

### Requirement: Cliente solo lectura

Usuarios de campaña (`lawyer`, `campaign_admin`) MUST **solo consultar** informes, anomalías y PDFs en `/campaign/{id}/e14`. MUST NOT descargar de registraduría, MUST NOT subir PDFs, MUST NOT disparar análisis. Solo `platform_owner` MUST ejecutar el pipeline.

#### Scenario: Abogado consulta informe

- GIVEN campaña con `e14_audit = true` y lote E14 ya procesado
- WHEN `lawyer` abre módulo E14
- THEN MUST ver informes y anomalías
- AND MUST NOT ver botones de carga, descarga registraduría ni "ejecutar análisis"

#### Scenario: Cliente intenta ejecutar pipeline

- GIVEN `campaign_admin` sin rol `platform_owner`
- WHEN intenta disparar descarga o análisis E14
- THEN MUST recibir HTTP 403

### Requirement: Módulo visible solo si contrató E14

Solo `platform_owner` MUST activar `e14_audit = true`. Sin flag → no existe módulo E14 para esa campaña.

#### Scenario: No contrató E14

- GIVEN `e14_audit = false`
- WHEN usuario de la campaña navega la app
- THEN MUST NOT existir módulo E14

### Requirement: Una sola ejecución — compartida a quienes contrataron

`platform_owner` MUST disparar **una vez** un `e14_run` (descarga registraduría + análisis IA) por lote/proceso electoral. MUST NOT re-ejecutar para cada político por separado si comparten el mismo E14.

Todas las campañas con `e14_audit = true` vinculadas al mismo `e14_run_id` (o mismo `electoral_process_id`) MUST ver el **mismo** resultado en **su** módulo `/campaign/{id}/e14` — solo lectura.

#### Scenario: Tres políticos contrataron E14 en la misma elección

- GIVEN `platform_owner` ejecuta un `e14_run` para proceso electoral X (una vez)
- AND campañas A, B y C con `e14_audit = true` en proceso X
- WHEN abogados de A, B y C abren su módulo E14
- THEN los tres MUST ver el mismo análisis (mismas mesas, mismas anomalías)
- AND el análisis IA MUST haber corrido una sola vez

#### Scenario: Político sin módulo contratado

- GIVEN `e14_run` completado para proceso X
- AND campaña D con `e14_audit = false`
- WHEN usuarios de campaña D usan la app
- THEN MUST NOT ver módulo E14 ni resultados del lote

### Requirement: Descarga desde registraduría

The system MUST automatizar descarga de formularios E14 desde la página de la registraduría vía worker Flask. MAY usar integración CAPTCHA Solver para captchas. Solo `platform_owner` MUST iniciar descarga. Parámetros: territorio, mesas/puestos según configuración del `e14_run`.

#### Scenario: Play de descarga

- GIVEN `platform_owner` en `/platform/e14-runs/{id}` pulsa ejecutar
- WHEN inicia el job
- THEN MUST encolar descarga registraduría + análisis
- AND MUST registrar estado `descargando` → `analizando` → `completado`

### Requirement: Detección de anomalías (IA)

IA multimodal MUST detectar: **tachones**, totales que **no coinciden**, campos vacíos, firmas ausentes, alteraciones visuales, mesas duplicadas. Severidad: `critica`, `advertencia`, `info`.

#### Scenario: Tachón detectado

- GIVEN PDF E14 con campo tachado
- WHEN IA completa revisión
- THEN MUST generar anomalía tipo `tachon` con severidad según reglas

#### Scenario: Cuentas no coinciden

- GIVEN totales de votos que no cuadran
- WHEN IA completa revisión
- THEN MUST generar anomalía `total_inconsistente` severidad `critica`

### Requirement: Informes en módulo del cliente

Informe consolidado (web + PDF descargable de **informe**, no de re-ejecutar pipeline) visible en módulo E14 de cada campaña autorizada.

### Requirement: Export al cierre

ZIP incluye E14 del lote accesible solo si `e14_audit = true`.

### Requirement: Permisos y datos

`collector` MUST NOT acceder. Votantes y demás módulos MUST permanecer aislados. Claves IA y registraduría solo en Flask; `platform_owner` opera pipeline.

## Modelo de datos (resumen)

| Entidad | Descripción |
|---------|-------------|
| `e14_runs` | Una ejecución: descarga + análisis (play una vez) |
| `electoral_process_id` | Agrupa campañas de la misma elección |
| `e14_documents` / `e14_anomalies` | Ligados al `e14_run`, no duplicados por político |
| `e14_audit` flag | Por campaña — contrató módulo → ve el lote en su UI |
