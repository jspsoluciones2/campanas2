# Voter Quarantine Specification

## Purpose

Detectar **coincidencias** (registros conflictivos o duplicados), aislarlos en **cuarentena** y permitir resolución sin contaminar la base maestra de votantes. Módulo de **alta prioridad** para la integridad de datos de cada campaña.

**Principio de silos (crítico):** Político 1 y político 2 **no tienen relación**. Sus cuarentenas **nunca** se comparan entre sí. La cuarentena existe solo para conflictos **dentro de una misma campaña** (típicamente: dos recolectores del mismo político registran al mismo votante).

**Alcance:** Toda detección de coincidencias filtra estrictamente por `campaign_id`. Una cédula en campaña A y la misma cédula en campaña B son registros **independientes** — cero cruce, cero alerta, cero fusión entre campañas.

## Requirements

### Requirement: Coincidencias solo dentro de campaña

The system MUST evaluar duplicados únicamente contra votantes y cuarentena de la **misma** `campaign_id`. MUST NOT alertar ni fusionar registros entre campañas distintas.

#### Scenario: Misma cédula en dos políticos distintos

- GIVEN cédula 1234567890 activa en campaña del Político A
- WHEN se registra la misma cédula en campaña del Político B
- THEN MUST crearse registro normal en campaña B (sin conflicto cruzado)
- AND MUST NOT aparecer en cuarentena de campaña A

### Requirement: Detección automática de coincidencias (duplicados)

The system MUST evaluar cada registro entrante contra criterios: (1) cédula exacta en votante activo, (2) teléfono + similitud de nombre >85%, (3) alerta por nombre similar en misma zona. Criterios 1 y 2 MUST enviar a cuarentena automática.

#### Scenario: Duplicado por cédula

- GIVEN votante activo con cédula 1234567890
- WHEN llega registro con misma cédula
- THEN MUST crearse entrada en `voter_quarantine` con `match_type = cedula_exacta`
- AND MUST NOT insertarse en tabla `voters` maestra

### Requirement: Aislamiento de cuarentena

Registros en cuarentena MUST almacenarse en `voter_quarantine` con referencia al conflicto (`conflict_voter_id` o `conflict_quarantine_id`), datos propuestos y metadatos de canal.

#### Scenario: Segundo recolector mismo votante

- GIVEN recolector B registra votante ya capturado por recolector A
- WHEN se detecta conflicto
- THEN el registro de B MUST quedar solo en cuarentena
- AND el registro de A MUST permanecer intacto en `voters`

### Requirement: Panel de resolución

The system MUST exponer UI para supervisores con acciones: `fusionar`, `descartar`, `escalar`. Solo roles `supervisor`, `campaign_admin` o superior MUST resolver.

#### Scenario: Fusión auditada

- GIVEN conflicto en cuarentena con dos registros compatibles
- WHEN supervisor elige `fusionar`
- THEN MUST actualizarse registro maestro con merge de campos no conflictivos
- AND cuarentena MUST pasar a estado `resuelto`
- AND MUST registrarse en `audit_log`

### Requirement: SLA y escalado

The system SHOULD notificar supervisores al crear cuarentena. Si no se resuelve en 72 horas, MUST escalarse automáticamente a `campaign_admin`.

#### Scenario: Escalado automático

- GIVEN cuarentena con `created_at` > 72h y estado `pendiente`
- WHEN corre job de escalado
- THEN estado MUST cambiar a `escalado` y notificar admin

### Requirement: Recepción sin pérdida

El canal de captura MUST confirmar al recolector que el registro fue recibido aunque vaya a cuarentena. El mensaje MUST indicar que está pendiente de revisión.

#### Scenario: Confirmación WhatsApp

- GIVEN registro enviado a cuarentena
- WHEN finaliza el procesamiento
- THEN el bot MUST responder "Registro recibido, pendiente de verificación por supervisor"
