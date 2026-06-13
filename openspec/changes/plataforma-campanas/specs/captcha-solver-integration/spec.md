# CAPTCHA Solver Integration Specification

## Purpose

Verificación de cédulas contra la registraduría nacional usando la aplicación **CAPTCHA Solver** para resolver captchas y consultar puesto de votación y datos oficiales del votante.

## Requirements

### Requirement: Consulta por cédula

The system MUST exponer servicio interno `verifyCedula(cedula, campaignId)` que consulta registraduría vía CAPTCHA Solver y retorna: nombres oficiales, puesto de votación, municipio, departamento, estado de consulta.

#### Scenario: Consulta exitosa

- GIVEN cédula válida y CAPTCHA Solver disponible
- WHEN se invoca verificación
- THEN MUST retornar datos de registraduría
- AND MUST actualizar votante a `activo` si nombres son compatibles

### Requirement: Adaptador desacoplado

The integration MUST implementarse como adaptador (`CaptchaSolverAdapter`) con interfaz `IVoterVerificationProvider`. Implementación concreta MUST ser intercambiable sin modificar `voter-registry`.

#### Scenario: Mock en desarrollo

- GIVEN entorno de desarrollo con `CAPTCHA_SOLVER_MOCK=true`
- WHEN se verifica cédula
- THEN MUST usar adaptador mock sin llamar API externa

### Requirement: Resolución de captchas

The system MUST delegar resolución de captchas de la registraduría a **CAPTCHA Solver** según su API. Credenciales MUST almacenarse cifradas por campaña en `campaign_integrations`.

#### Scenario: Captcha resuelto automáticamente

- GIVEN la registraduría requiere captcha en la consulta
- WHEN el adaptador invoca CAPTCHA Solver
- THEN MUST completar flujo sin intervención manual del recolector

### Requirement: Reintentos y degradación

The system MUST reintentar consultas fallidas (max 3, backoff exponencial). Si CAPTCHA Solver no responde, votante MUST permanecer en `pendiente_verificacion` y encolarse en `verification_queue`.

#### Scenario: Servicio caído

- GIVEN API CAPTCHA Solver timeout
- WHEN fallan 3 reintentos
- THEN MUST dejar votante en `pendiente_verificacion`
- AND MUST encolar job para reintento posterior

### Requirement: Comparación de nombres

The system MUST comparar nombres ingresados vs registraduría. Discrepancia significativa (> umbral configurable) MUST generar alerta para supervisor sin rechazar automáticamente.

#### Scenario: Nombre con variación menor

- GIVEN "JUAN CARLOS" registrado vs "Juan Carlos" en registraduría
- WHEN se comparan normalizados
- THEN MUST considerarse match válido

### Requirement: Rate limiting

The system MUST respetar límites de CAPTCHA Solver por campaña. Exceso MUST encolar consultas sin perder solicitudes.

#### Scenario: Límite alcanzado

- GIVEN rate limit de campaña alcanzado
- WHEN llega nueva solicitud de verificación
- THEN MUST encolarse en `verification_queue` con prioridad FIFO
