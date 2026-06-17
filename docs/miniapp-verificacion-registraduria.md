# Miniapp — Verificación registraduría (CapSolver)

Esta plataforma **no** configura ni ejecuta CapSolver. El worker vive en un **repositorio/servidor aparte** por cliente. Los resultados se escriben en Supabase en la tabla `verificaciones_registraduria` y la app principal los muestra haciendo **JOIN por documento** con `votantes`.

## Tabla compartida

Migración: `supabase/migrations/027_verificaciones_registraduria.sql`

| Columna | Uso |
|---------|-----|
| `id_campana` | Campaña a la que pertenece la consulta |
| `documento` | Solo dígitos (mín. 5). **Clave de join con `votantes.documento`** |
| `tipo_documento` | Default `CC`. Join con `votantes.tipo_documento` |
| `estado` | `pendiente` → `en_proceso` → `exitoso` \| `error` \| `discrepancia_nombre` |
| `nombres_oficial`, `apellidos_oficial` | Lo devuelto por registraduría |
| `departamento`, `municipio`, `puesto_votacion`, `mesa` | Datos electorales |
| `mensaje_error` | Detalle si `estado = error` |
| `datos_crudos` | JSON completo de la respuesta (debug) |
| `id_corrida` | ID de lote (texto libre, ej. `2026-06-15T10:00:00Z`) |
| `intentos` | Contador de reintentos |
| `consultado_en` | Última consulta exitosa o fallida |

**Índice único:** `(id_campana, documento, tipo_documento)` → usar **upsert** desde el worker.

### Join en la app principal

```sql
SELECT
  v.id,
  v.nombres,
  v.apellidos,
  v.documento,
  v.estado AS estado_votante,
  vr.estado AS verificacion_estado,
  vr.nombres_oficial,
  vr.apellidos_oficial,
  vr.municipio,
  vr.puesto_votacion,
  vr.mesa,
  vr.mensaje_error,
  vr.consultado_en
FROM votantes v
LEFT JOIN verificaciones_registraduria vr
  ON vr.id_campana = v.id_campana
 AND vr.documento = v.documento
 AND vr.tipo_documento = v.tipo_documento
WHERE v.id_campana = :id_campana;
```

Solo se ven resultados de votantes **ya registrados** en esa campaña.

## Qué debe hacer la miniapp

### 1. Repositorio y despliegue

- Repo separado (ej. `verificacion-registraduria-worker`).
- Un despliegue por cliente/campaña que contrate el servicio (VPS propio o dedicado).
- Variables de entorno locales (no van a `integraciones_campana` de la plataforma):

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo en el servidor del worker
ID_CAMPANA=uuid-de-la-campana
CAPSOLVER_API_KEY=...
CAPSOLVER_WEBSITE_URL=https://eleccionescolombia.registraduria.gov.co/identificacion
CAPSOLVER_WEBSITE_KEY=...          # sitekey reCAPTCHA si aplica
# Proxy residencial (recomendado producción)
CAPSOLVER_PROXY_TYPE=http
CAPSOLVER_PROXY_ADDRESS=...
CAPSOLVER_PROXY_PORT=...
CAPSOLVER_PROXY_LOGIN=...
CAPSOLVER_PROXY_PASSWORD=...
WORKER_POLL_SECONDS=30
WORKER_BATCH_SIZE=10
WORKER_MAX_CONCURRENT=2
```

### 2. Autenticación Supabase

- Usar **`service_role`** en el worker (bypass RLS).
- **Nunca** exponer esa key en la app web ni en el navegador.

### 3. Flujo del worker (loop)

```
1. Generar id_corrida (opcional, por ejecución del cron)
2. Obtener documentos a verificar:
   - Opción A: SELECT documento, tipo_documento FROM votantes
              WHERE id_campana = :id AND estado IN ('registrado','pendiente_verificacion',...)
                AND NOT EXISTS (verificación exitosa reciente)
   - Opción B: SELECT * FROM verificaciones_registraduria
              WHERE id_campana = :id AND estado IN ('pendiente','error') AND intentos < 3
3. Por cada documento:
   a. UPSERT fila → estado = 'en_proceso', intentos += 1
   b. Resolver captcha (CapSolver createTask → getTaskResult)
   c. Consultar registraduría con token captcha + documento
   d. Comparar nombres (normalizados) vs votante en BD
   e. UPSERT resultado:
      - exitoso: datos oficiales + consultado_en
      - discrepancia_nombre: guardar datos pero estado discrepancia_nombre
      - error: mensaje_error + backoff antes de reintentar
4. Registrar uso/costo en logs locales o tabla propia (opcional)
5. Dormir WORKER_POLL_SECONDS y repetir
```

### 4. Upsert ejemplo (Python + supabase-py)

```python
from datetime import datetime, timezone

def normalizar_documento(doc: str) -> str:
    return "".join(ch for ch in doc if ch.isdigit())

client.table("verificaciones_registraduria").upsert(
    {
        "id_campana": CAMPANA_ID,
        "documento": normalizar_documento(documento),
        "tipo_documento": tipo_documento or "CC",
        "estado": "exitoso",
        "nombres_oficial": nombres,
        "apellidos_oficial": apellidos,
        "departamento": depto,
        "municipio": municipio,
        "puesto_votacion": puesto,
        "mesa": mesa,
        "mensaje_error": None,
        "datos_crudos": payload_crudo,
        "id_corrida": corrida_id,
        "consultado_en": datetime.now(timezone.utc).isoformat(),
    },
    on_conflict="id_campana,documento,tipo_documento",
).execute()
```

> Nota: si el cliente de Supabase no soporta `on_conflict` con ese nombre, usar el índice único vía RPC o `insert ... on conflict` en SQL.

### 5. CapSolver (referencia)

La lógica que **antes** estaba en `services/python/app/adapters/capsolver.py` de este repo debe vivir **solo en la miniapp**:

1. `createTask` (ReCaptchaV2EnterpriseTask o ProxyLess según entorno)
2. Poll `getTaskResult` hasta `ready`
3. Usar `gRecaptchaResponse` en el POST a registraduría

Tipos de tarea habituales:

- Producción con proxy: `ReCaptchaV2EnterpriseTask`
- Pruebas: `ReCaptchaV2EnterpriseTaskProxyLess`

### 6. Comparación de nombres

- Normalizar: mayúsculas, sin tildes, sin espacios dobles.
- Si similitud < umbral (ej. 0.85): `estado = discrepancia_nombre` (no sobrescribir silenciosamente `votantes.nombres`).
- La app principal puede mostrar alerta y que un supervisor decida.

### 7. Rate limiting y aislamiento

- `WORKER_MAX_CONCURRENT` bajo (1–3) para no quemar IP/proxy.
- Un worker por cliente evita que un bloqueo de registraduría afecte a otros.
- Reintentos con backoff exponencial; máx. 3 intentos por documento.

### 8. Módulo en la plataforma

- En `/platform/campaigns/{id}` el flag **«Verificación registraduría»** (`caracteristicas_campana.resolutor_captcha`) indica que el cliente **contrató** el servicio.
- No hay pantalla de API keys CapSolver en esta app.
- La UI de campaña (pendiente) leerá `verificaciones_registraduria` con el JOIN anterior.

## Checklist de implementación miniapp

- [ ] Proyecto Python (o Node) con cron/systemd/docker
- [ ] `.env` por despliegue con `ID_CAMPANA` + CapSolver + Supabase service role
- [ ] Cliente Supabase con upsert a `verificaciones_registraduria`
- [ ] Adaptador CapSolver + scraper registraduría
- [ ] Logs estructurados (documento, estado, duración, error)
- [ ] Healthcheck HTTP opcional (`/health`)
- [ ] Documentar en runbook cómo levantar/parar por cliente

## Checklist en esta app (después de aplicar migración 027)

- [ ] `supabase db push` o aplicar `027_verificaciones_registraduria.sql`
- [ ] Pantalla `/campaign/[id]/verificacion` con tabla JOIN votantes ↔ verificaciones
- [ ] Botón «Encolar pendientes» (opcional): insertar filas `pendiente` para votantes sin fila en verificaciones
- [ ] KPIs: % verificados, % error, % discrepancia nombre

## Seguridad

- Service role solo en el servidor del worker.
- RLS en la tabla: usuarios de campaña **leen**; escritura masiva solo vía worker.
- No guardar API keys de CapSolver en `integraciones_campana`.
