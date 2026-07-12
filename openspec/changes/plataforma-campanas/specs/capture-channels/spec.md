# Capture Channels Specification

## Purpose

Captura de votantes vía WhatsApp, Telegram y formulario web con flujos conversacionales y trazabilidad.

## Requirements

### Requirement: Canal WhatsApp fuera de alcance

El sistema no incluye un canal de WhatsApp. La captura se realiza mediante Telegram y formularios web.

#### Scenario: Flujo completo WhatsApp

- GIVEN recolector vinculado y autenticado por teléfono
- WHEN completa todos los pasos del flujo
- THEN MUST crearse registro con `canal_origen = whatsapp` y `created_by = recolector_id`

### Requirement: Canal Telegram

The system MUST ofrecer bot Telegram con flujo equivalente a WhatsApp. Webhook MUST validar firma/token del bot.

#### Scenario: Registro vía Telegram

- GIVEN recolector con cuenta Telegram vinculada
- WHEN completa el flujo del bot
- THEN MUST crearse registro con `canal_origen = telegram`

### Requirement: Canal web autenticado

The system MUST ofrecer formulario web responsive con **branding de la plataforma** (no por campaña) para recolectores logueados.

#### Scenario: Formulario web autenticado

- GIVEN recolector logueado en la web
- WHEN envía formulario válido
- THEN MUST crearse registro con `canal_origen = web` y `created_by = recolector_id`

### Requirement: Formulario web público por enlace

The system MUST ofrecer formulario público **sin login**, accesible solo mediante **enlace único por campaña** (token/UUID en URL). El enlace MUST poder regenerarse y revocarse por `campaign_admin`. No MUST indexarse ni listarse públicamente.

#### Scenario: Captura vía enlace público

- GIVEN ciudadano con enlace válido `/c/{campaign_slug}/registro/{token}`
- WHEN completa y envía el formulario
- THEN MUST crearse registro con `canal_origen = web_publico` y `created_by = null`
- AND MUST aplicarse reglas de cuarentena igual que otros canales

#### Scenario: Enlace revocado

- GIVEN admin revocó el token del formulario público
- WHEN un usuario accede al enlace
- THEN MUST mostrarse página de enlace no válido sin exponer datos de campaña

### Requirement: Validación en canal

Cada canal MUST validar formato de cédula y teléfono antes de enviar al registro central. Errores MUST mostrarse al usuario en el mismo canal con opción de corregir.

#### Scenario: Teléfono inválido en web

- GIVEN teléfono sin formato válido
- WHEN el usuario envía el formulario
- THEN MUST mostrarse error de validación sin crear registro

### Requirement: Trazabilidad

Cada registro MUST incluir `channel_session_id`, `message_ids` (si aplica) y timestamp de cada paso del flujo conversacional.

#### Scenario: Auditoría de canal

- GIVEN registro creado vía WhatsApp
- WHEN un supervisor consulta detalle
- THEN MUST poder ver historial de mensajes asociados al registro

### Requirement: Integración con cuarentena

Canales MUST invocar el servicio de registro central que aplica reglas de duplicados. Si va a cuarentena, el canal MUST recibir respuesta diferenciada y comunicarla al usuario.

#### Scenario: Duplicado en Telegram

- GIVEN cédula duplicada
- WHEN el bot envía el registro
- THEN MUST responder que fue recibido en revisión
- AND MUST NOT indicar éxito de registro definitivo
