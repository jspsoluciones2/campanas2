# Voter Registry Specification

## Purpose

Registro maestro de votantes con normalización, estados y trazabilidad de origen.

## Requirements

### Requirement: Esquema de campos (definición diferida)

Los campos obligatorios y opcionales del votante MUST definirse en la fase de **diseño de base de datos Supabase** (`sdd-tasks` / migraciones). Esta spec establece campos mínimos provisionales: `cedula`, `nombres`, `apellidos`, `telefono`, `zona`, `puesto_votacion`, `estado`, `canal_origen`, `campaign_id`, `created_by`, `created_at`. Campos adicionales MUST agregarse sin romper módulos gracias a extensibilidad del esquema.

#### Scenario: Extensión de campos en migración

- GIVEN el PO define campos adicionales en fase de BD
- WHEN se aplica migración Supabase
- THEN los módulos de captura y registro MUST adaptarse vía configuración o columnas nuevas sin cambiar contratos de cuarentena

### Requirement: Campos mínimos del votante

The system MUST almacenar al menos: `cedula`, `nombres`, `apellidos`, `telefono`, `zona`, `estado`, `canal_origen`, `campaign_id`, `created_by` (nullable si `web_publico`), `created_at`.

#### Scenario: Registro válido

- GIVEN datos mínimos completos y cédula no duplicada activa
- WHEN se registra un votante
- THEN el registro queda en estado `activo` o `pendiente_verificacion` según verificación vía CAPTCHA Solver

### Requirement: Normalización de cédula y teléfono

The system MUST normalizar cédula (solo dígitos) y teléfono (formato E.164 Colombia +57). Entradas inválidas MUST rechazarse con mensaje claro al canal de origen.

#### Scenario: Cédula con puntos

- GIVEN cédula ingresada como "1.234.567.890"
- WHEN se procesa el registro
- THEN se almacena como "1234567890"

### Requirement: Identidad única por campaña

The system MUST tratar `cedula` + `campaign_id` como identidad única para registros activos. Un segundo registro con misma cédula MUST NOT escribirse directamente en la tabla maestra.

#### Scenario: Duplicado por cédula

- GIVEN existe votante activo con cédula X en la campaña
- WHEN llega nuevo registro con cédula X
- THEN MUST delegarse a `voter-quarantine` sin modificar el registro activo

### Requirement: Máquina de estados

The system MUST soportar estados: `borrador`, `pendiente_verificacion`, `activo`, `en_cuarentena`, `fusionado`, `rechazado`, `escalado`. Transiciones MUST ser auditadas.

#### Scenario: Verificación pendiente

- GIVEN registro sin verificación vía CAPTCHA Solver
- WHEN se crea el votante
- THEN estado inicial MUST ser `pendiente_verificacion`

### Requirement: Historial de cambios

The system MUST mantener `voter_history` con cambios de campos críticos (cédula, puesto, zona, estado) incluyendo valor anterior, nuevo, actor y timestamp.

#### Scenario: Actualización de puesto

- GIVEN votante verificado vía CAPTCHA Solver
- WHEN se actualiza `puesto_votacion`
- THEN MUST existir entrada en `voter_history`
