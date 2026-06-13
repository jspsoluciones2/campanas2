# Analytics Dashboard Specification

## Purpose

Estadísticas operativas de campaña: votantes por zona, pureza de datos, cuarentena y rendimiento de canales.

## Requirements

### Requirement: Votantes por zona

The system MUST mostrar conteo y porcentaje de votantes agrupados por `zona`. Supervisores MUST ver solo zonas asignadas; admins ven toda la campaña.

#### Scenario: Dashboard por zona

- GIVEN campaña con 1000 votantes en 10 zonas
- WHEN admin abre estadísticas
- THEN MUST ver tabla/gráfico con conteo y % por zona

### Requirement: Pureza de datos

The system MUST calcular KPIs: `% cedula_verificada`, `% con_puesto`, `% telefono_valido`, `% pendiente_verificacion`. Fórmulas MUST documentarse en la UI.

#### Scenario: Pureza parcial

- GIVEN 800 votantes verificados de 1000 totales
- WHEN se muestra pureza de cédula
- THEN MUST indicar 80%

### Requirement: Métricas de cuarentena

The system MUST mostrar: pendientes, resueltos hoy, tiempo medio de resolución, top conflictos por tipo (`cedula_exacta`, `telefono_nombre`).

#### Scenario: Cuarentena pendiente

- GIVEN 15 registros en cuarentena pendiente
- WHEN supervisor abre dashboard
- THEN MUST ver contador de pendientes con enlace al panel de resolución

### Requirement: Rendimiento por canal y recolector

The system MUST mostrar registros por canal (whatsapp, telegram, web) y ranking de recolectores por período (día, semana). Datos MUST respetar RLS.

#### Scenario: Ranking recolectores

- GIVEN período de 7 días seleccionado
- WHEN admin consulta rendimiento
- THEN MUST ver top recolectores por cantidad de registros aceptados (excluyendo descartados en cuarentena)

### Requirement: PDF de estadísticas al cierre (export campaña)

The system MUST generar `estadisticas-cierre.pdf` al exportar campaña finalizada: snapshot de KPIs (zonas, pureza, cuarentena, canales, recolectores) **al momento del cierre**. Este PDF MUST incluirse en el ZIP de entrega al político.

#### Scenario: Export con stats PDF

- GIVEN campaña en `ended` con datos operativos
- WHEN `platform_owner` genera export
- THEN el ZIP MUST contener `estadisticas-cierre.pdf` con métricas congeladas al cierre
- AND MUST NOT incluir CSV operativo de canales ni enlaces

### Requirement: Exportación operativa en dashboard

The system SHOULD permitir exportar reportes agregados a CSV desde el dashboard (uso interno). Export MUST NOT incluir PII sin permiso `campaign_admin`.
