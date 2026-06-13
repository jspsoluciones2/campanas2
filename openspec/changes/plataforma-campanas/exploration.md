# Exploración: plataforma-campanas

**Fecha**: 2026-06-13  
**Modo**: Híbrido (archivos + Engram)  
**Fuentes**: Requerimientos del product owner + plan SDD

---

## Resumen ejecutivo

Plataforma **SaaS multi-campaña**: UI en Next.js + análisis/IA en Python (Flask) + Supabase.

---

## Bloque 1 — Contexto y actores

### Decisión / supuesto

| Tema | Respuesta documentada | Estado |
|------|----------------------|--------|
| Multi-tenant | **Confirmado**: SaaS — vender producto a distintos políticos |
| Actores | Recolector, Supervisor, Admin campaña, Admin marca, Abogado (E14), Superadmin plataforma | Confirmado implícito |
| Volumen MVP | 50k votantes/campaña, 500 recolectores, 10k msg/día WhatsApp | Supuesto escalable |

### Roles y permisos (borrador)

| Rol | Permisos clave |
|-----|----------------|
| Recolector | Capturar votantes en canales asignados; ver solo su zona |
| Supervisor | Resolver cuarentena; ver estadísticas de su equipo/zona |
| Admin campaña | Configurar zonas, canales, usuarios, branding |
| Abogado | Consultar E14, informes de anomalías |
| Superadmin | Gestionar campañas, módulos, parámetros globales |

---

## Bloque 2 — Modelo de datos del votante

### Campos core

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| cedula | Sí (MVP) | Clave de identidad primaria; normalizada sin puntos |
| nombres | Sí | |
| apellidos | Sí | |
| telefono | Sí | E.164 Colombia (+57) |
| zona | Sí | Territorio electoral asignado |
| puesto_votacion | Condicional | Requerido post-verificación CAPTCHA Solver |
| municipio, departamento | Opcional | Derivables de puesto |
| estado | Sí | Ver máquina de estados |
| canal_origen | Sí | whatsapp \| telegram \| web |
| recolector_id | Sí* | *Nullable si auto-registro web público |

### Máquina de estados

```
borrador → pendiente_verificacion → activo
                ↓                        ↓
           en_cuarentena ←──────────────┘
                ↓
    fusionado | rechazado | escalado
```

---

## Bloque 3 — Cuarentena y duplicados

### Criterios de match (prioridad)

1. **Cédula exacta** → cuarentena automática si ya existe registro activo
2. **Teléfono + similitud nombre** (>85%) → cuarentena con revisión
3. **Mismo puesto + nombre similar** → alerta, no bloqueo automático

### Flujo

1. Segundo registro detectado → **NO** escribe en `voters` maestro
2. Crea registro en `voter_quarantine` con referencia al conflicto
3. Notifica supervisor (dashboard + opcional WhatsApp interno)
4. Resolución: fusionar (merge auditado), descartar duplicado, o escalar
5. SLA sugerido: 48h para supervisores; escalado automático a admin a las 72h

---

## Bloque 4 — Canales de captura

| Canal | Usuario | Flujo |
|-------|---------|-------|
| WhatsApp | Recolector autenticado (vinculación teléfono) | Bot conversacional: cédula → nombres → teléfono votante → zona |
| Telegram | Recolector autenticado | Mismo flujo que WhatsApp |
| Web pública por enlace | Sin login — solo quien tiene URL/token | Formulario con branding; canal `web_publico` |

**Nota:** Campos detallados del votante se definirán en fase de diseño Supabase.

### Trazabilidad

Cada registro MUST incluir: `created_by`, `channel`, `campaign_id`, `timestamp`, `session_id` del canal.

### Supuesto técnico

- WhatsApp: **Twilio** (sin integración directa Meta en la app)
- Telegram: Bot API con webhook a Supabase Edge Function
- Web: Next.js con Supabase Auth

---

## Bloque 5 — Branding configurable

| Elemento | Configurable | Almacenamiento |
|----------|--------------|----------------|
| Logo | Sí | Supabase Storage |
| Colores primario/secundario/accent | Sí | JSON design tokens en `platform_brand_config` (solo plataforma) |
| Tipografía | Sí | Google Fonts o upload |
| Favicon | Sí | Storage |
| Preview | Sí | Vista previa antes de publicar |

Equipo de diseño entregará assets → admin los sube o importa tokens JSON.

---

## Bloque 6 — CAPTCHA Solver + estadísticas

### CAPTCHA Solver

- Integración vía adaptador con contrato en design.md
- Aplicación **CAPTCHA Solver** resuelve captchas de registraduría
- Consulta: cédula → nombre, puesto, municipio, departamento
- API key por campaña en `campaign_integrations`
- Fallback: cola de reintento; `pendiente_verificacion` si servicio cae

### Estadísticas MVP

| KPI | Descripción |
|-----|-------------|
| Votantes por zona | Conteo y % del total |
| Pureza de datos | % cédula verificada, % con puesto, % teléfono válido |
| Cuarentena | Pendientes, resueltos, tiempo medio resolución |
| Recolectores | Top por zona, registros/día |
| Canales | Distribución whatsapp/telegram/web |

---

## Bloque 7 — E14 + IA

| Aspecto | Decisión |
|---------|----------|
| Ingesta | Upload manual PDF; bulk ZIP; metadatos: mesa, puesto, zona |
| Almacenamiento | Supabase Storage con RLS por campaña |
| Procesamiento | Cola async (Edge Function + job table) |
| IA | Modelo multimodal (visión) — extracción de totales, firmas, tachones |
| Anomalías | Totales inconsistentes, campos vacíos, alteraciones visuales, duplicados de mesa |
| Salida | Informe PDF/HTML para abogados + dashboard de alertas |
| Retención | 90 días post-elección (configurable por campaña) |

---

## Bloque 8 — Stack Supabase

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| Auth | Supabase Auth (email + magic link; OAuth futuro) |
| DB | Supabase Postgres + RLS |
| Storage | PDFs E14, logos, informes |
| Edge Functions | Webhooks WA/TG, CAPTCHA Solver proxy, E14 job trigger |
| Realtime | Dashboard stats (opcional MVP) |
| IA | API externa (OpenAI/Anthropic/Google) vía Edge Function — sin exponer keys al cliente |

---

## Riesgos identificados

| Riesgo | Mitigación |
|--------|------------|
| API CAPTCHA Solver no documentada | Adaptador + mock para desarrollo |
| Límites WhatsApp Business | Cola de mensajes, rate limiting |
| Privacidad datos electorales | RLS, cifrado at-rest, políticas de retención |
| Costo IA E14 | Procesamiento batch, límites por campaña |
| Duplicados masivos día D | Cuarentena automática + panel supervisor |

---

## Preguntas abiertas

1. Documentación/credenciales de **CAPTCHA Solver**
2. Modelo IA para E14
3. Volumen pico día electoral
4. **Campos definitivos del votante** — en fase Supabase
