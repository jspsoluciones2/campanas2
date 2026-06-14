# Guía completa — Base de datos Supabase

Runbook para **montar la BD desde cero** o **migrar a la base definitiva** (producción).  
Las migraciones viven en Git; el proyecto Supabase es configurable por variables de entorno.

**Documentos relacionados**

| Documento | Para qué sirve |
|-----------|----------------|
| [DICCIONARIO-DATOS.md](./DICCIONARIO-DATOS.md) | Significado de cada campo y enum |
| [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) | Mapa rápido de tablas |
| [SETUP-DB.md](./SETUP-DB.md) | Resumen corto (enlaza aquí) |

---

## 1. Registro de proyectos Supabase

Anota cada entorno para no mezclar credenciales.

| Entorno | Project ref | URL | Cuenta Supabase | Fecha setup | Notas |
|---------|-------------|-----|-----------------|-------------|-------|
| **Prueba / dev** | `kadhnauhghzyhfhsomif` | https://kadhnauhghzyhfhsomif.supabase.co | anamariagarcia093@gmail.com | 2026-06-14 | BD + dueño configurados |
| **Definitiva / prod** | _pendiente_ | _pendiente_ | _pendiente_ | | |

> Al cambiar de proyecto solo actualizas `.env`, `apps/web/.env.local` y (opcional) `supabase link`. **No** hay que cambiar código de la app.

### 1.1 Plantilla — proyecto definitivo (copiar y rellenar)

Cuando crees la BD de producción, **duplica este bloque** en un archivo propio (ej. `supabase/PROYECTO-PROD.md`, **no** subir keys a Git) o complétalo aquí en la fila de la tabla.

```markdown
# Proyecto Supabase — DEFINITIVO / PRODUCCIÓN

## Identificación
- Nombre en dashboard:
- Project ref:
- URL: https://<PROJECT-REF>.supabase.co
- Región:
- Cuenta / organización Supabase:
- Fecha de creación:

## Credenciales API (Dashboard → Settings → API)
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=          # anon / publishable — va en apps/web/.env.local
- SUPABASE_SERVICE_ROLE_KEY=             # solo servidor Flask — NUNCA en el navegador

## Usuario dueño plataforma
- Email dueño prod:
- UUID auth.users:
- INSERT ejecutado: [ ] sí  [ ] no

```sql
INSERT INTO miembros_plataforma (id_usuario, rol)
VALUES ('<UUID-DUEÑO-PROD>', 'dueno_plataforma');
```

## Migraciones aplicadas
- [ ] 001_platform_core.sql — fecha:
- [ ] 002_domain_schema.sql — fecha:
- [ ] 003+ (futuras)

## Variables actualizadas en el repo local
- [ ] `.env` (raíz)
- [ ] `apps/web/.env.local`
- [ ] Secretos de despliegue (Vercel / hosting)

## Verificación
- [ ] Login en /login con dueño prod
- [ ] Crear cliente + campaña en /platform
- [ ] RLS: usuario lector no puede escribir

## Notas
-
```

### 1.2 Enlaces rápidos por proyecto

| | Prueba (actual) | Definitiva (cuando exista) |
|--|-----------------|----------------------------|
| Dashboard | https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif | _pendiente_ |
| SQL Editor | https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/sql/new | _pendiente_ |
| API keys | https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/settings/api | _pendiente_ |
| Authentication | https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/auth/users | _pendiente_ |

---

## 2. Qué se versiona en Git vs qué vive en Supabase

| En Git (reutilizable) | En Supabase (por proyecto) |
|----------------------|----------------------------|
| `supabase/migrations/*.sql` | Usuarios Auth (`auth.users`) |
| Documentación | Datos de negocio (clientes, campañas, votantes…) |
| `.env.example` | API keys (anon, service_role) |
| Código Next.js + Flask | Storage, Edge Functions desplegadas |

**Implicación al migrar a la BD definitiva:** el esquema se reaplica con las migraciones; los **usuarios Auth se crean de nuevo** en el proyecto nuevo; los **datos de prueba** se cargan otra vez (o se exportan/importan con scripts si ya hay volumen).

---

## 3. Checklist — BD nueva (prueba o definitiva)

Marca cada paso al completarlo.

```
[ ] 1. Crear proyecto en Supabase (o elegir el definitivo)
[ ] 2. Anotar project ref, URL y keys en la tabla de la sección 1
[ ] 3. Ejecutar 001_platform_core.sql
[ ] 4. Ejecutar 002_domain_schema.sql
[ ] 5. Verificar tablas y funciones RLS (consultas sección 6)
[ ] 6. Crear usuario(s) en Authentication
[ ] 7. INSERT dueño en miembros_plataforma (UUID real, sección 7)
[ ] 8. Configurar .env y apps/web/.env.local
[ ] 9. Probar login en http://localhost:3000
[ ] 10. Crear cliente + proceso electoral + campaña desde /platform
[ ] 11. (Opcional) Usuarios editor/lector + datos de prueba (sección 9)
```

---

## 4. Crear proyecto Supabase

1. https://supabase.com → **New project**
2. Nombre sugerido: `plataforma-campanas` (o `plataforma-campanas-prod`)
3. Región: la más cercana a Colombia (ej. `South America (São Paulo)` si está disponible)
4. Guarda la contraseña de la base de datos (solo para acceso directo Postgres; la app usa API)

**Obtener credenciales API**

Dashboard → **Project Settings** → **API**:

| Variable | Dónde se usa |
|----------|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (navegador + RLS) |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` (solo Flask/servidor, **nunca** en el cliente) |

---

## 5. Aplicar migraciones (orden obligatorio)

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 1º | `migrations/001_platform_core.sql` | Plataforma, campañas, helpers RLS |
| 2º | `migrations/002_domain_schema.sql` | Votantes, catálogos, RLS por rol |

### Opción A — SQL Editor (recomendada)

1. Dashboard → **SQL** → **New query**
2. Abre `supabase/migrations/001_platform_core.sql` en el repo, copia **todo** el archivo, **Run**
3. Repite con `002_domain_schema.sql`
4. Si un paso falla, **no** ejecutes el siguiente hasta corregir el error

### Opción B — Supabase CLI

```powershell
cd "c:\Users\ACER NITRO\Downloads\Proyecto_Campañas"
npx supabase login
npx supabase link --project-ref <TU-PROJECT-REF>
npx supabase db push
```

`db push` aplica todas las migraciones pendientes en `supabase/migrations/` en orden.

### Reaplicar en proyecto vacío

Si el proyecto **nunca** tuvo migraciones, basta con ejecutar 001 y 002.  
Si ya ejecutaste una versión antigua y hay conflictos, lo más simple en **dev** es crear un proyecto Supabase nuevo y volver a aplicar desde cero. En **prod** se usan migraciones incrementales (003, 004…) cuando existan.

---

## 6. Verificación post-migración

Ejecuta en SQL Editor después de 001 + 002.

### 6.1 Tablas creadas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Debes ver entre otras: `barrios`, `campanas`, `clientes`, `comunas`, `miembros_campana`, `miembros_plataforma`, `novedades`, `procesos_electorales`, `puestos_votacion`, `roles`, `tipos_novedad`, `votantes`.

### 6.2 Tipos ENUM

```sql
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname IN (
  'rol_miembro_campana', 'tipo_sexo', 'estado_votante', 'tipo_documento'
)
ORDER BY t.typname, e.enumsortorder;
```

`tipo_sexo` debe mostrar: `Masculino`, `Femenino`.

### 6.3 Funciones RLS

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'es_dueno_plataforma',
    'ids_campanas_usuario',
    'puede_leer_campana',
    'puede_editar_campana',
    'puede_administrar_campana',
    'subarbol_votantes'
  )
ORDER BY routine_name;
```

Deben aparecer las seis funciones.

### 6.4 RLS habilitado

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('votantes', 'campanas', 'miembros_plataforma')
ORDER BY tablename;
```

`rowsecurity` debe ser `true` en todas las tablas de negocio.

---

## 7. Usuario dueño de plataforma (`dueno_plataforma`)

La app de administración (`/platform`) exige una fila en `miembros_plataforma` vinculada a un usuario de **Supabase Auth**.

### 7.1 Crear usuario Auth

Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**

- Email y contraseña (la usarás en el login local)
- **Auto Confirm User**: activado (recomendado en dev)

### 7.2 Obtener el UUID real

**Nunca** uses placeholders como `<UUID-USUARIO>` ni UUIDs de ejemplo.

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

Copia el valor exacto de la columna `id` (formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

Ejemplo real (proyecto de prueba actual):

| id | email |
|----|-------|
| `1a9105d7-e0d8-4d02-9a88-b34ec796f1c7` | anamariagarcia093@gmail.com |

### 7.3 Insertar dueño

```sql
INSERT INTO miembros_plataforma (id_usuario, rol)
VALUES ('1a9105d7-e0d8-4d02-9a88-b34ec796f1c7', 'dueno_plataforma');
```

En la BD **definitiva** sustituye el UUID por el del usuario que corresponda en ese proyecto.

### 7.4 Verificar

```sql
SELECT mp.id_usuario, mp.rol, u.email
FROM miembros_plataforma mp
JOIN auth.users u ON u.id = mp.id_usuario;
```

Resultado esperado: una fila con `rol = dueno_plataforma`.

### 7.5 Errores frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| `invalid input syntax for type uuid: "<UUID-USUARIO>"` | Se pegó el texto del ejemplo | Usar UUID real del `SELECT` en `auth.users` |
| `violates foreign key ... miembros_plataforma_id_usuario_fkey` | El UUID no existe en `auth.users` | Crear usuario en Authentication primero; copiar su `id` |
| `relation "miembros_plataforma" does not exist` | No se aplicó `001` | Ejecutar `001_platform_core.sql` |

---

## 8. Variables de entorno (local)

Desde la raíz del repo:

```powershell
copy .env.example .env
copy apps\web\.env.local.example apps\web\.env.local
```

### Raíz — `.env` (Flask + referencia)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT-REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FLASK_API_URL=http://localhost:5000
FLASK_PORT=5000
```

### Web — `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT-REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
FLASK_API_URL=http://localhost:5000
```

Reinicia `npm run dev:web` después de cambiar `.env.local`.

### Al migrar a la BD definitiva

1. Crea el proyecto nuevo en Supabase
2. Aplica migraciones (sección 5)
3. Crea dueño (sección 7)
4. **Solo** cambia URL y keys en `.env` y `.env.local` por las del proyecto definitivo
5. Vuelve a probar login y `/platform`

---

## 9. Arrancar la app y prueba funcional

```powershell
# Terminal 1 — UI
npm run dev:web

# Terminal 2 — API Python
python services/python/run.py
```

| URL | Uso |
|-----|-----|
| http://localhost:3000 | Login y panel |
| http://localhost:5000 | API Flask |

**Flujo mínimo de prueba (como dueño)**

1. Login con email/contraseña del usuario Auth
2. `/platform/clients` → crear cliente
3. `/platform/campaigns` → crear proceso electoral + campaña
4. Abrir detalle de campaña y revisar que carga sin error

---

## 10. Roles de campaña y RLS (datos de prueba)

### Matriz de permisos (dominio electoral)

| Acción | `lector` | `editor` | `administrador_campana` | `dueno_plataforma` |
|--------|----------|----------|-------------------------|-------------------|
| Leer votantes, catálogos | ✅ | ✅ | ✅ | ✅ |
| Crear / editar | ❌ | ✅ | ✅ | ✅ |
| Eliminar | ❌ | ❌ | ✅ | ✅ |
| Gestionar clientes / campañas SaaS | ❌ | ❌ | ❌ | ✅ |

### Crear usuarios de prueba

1. Authentication → crear `editor@test.com` y `lector@test.com`
2. Obtener UUIDs:

```sql
SELECT id, email FROM auth.users WHERE email LIKE '%test%';
```

3. Obtener UUID de una campaña:

```sql
SELECT id, nombre FROM campanas ORDER BY creado_en DESC LIMIT 5;
```

4. Asignar membresías:

```sql
INSERT INTO miembros_campana (id_campana, id_usuario, rol)
VALUES
  ('<UUID-CAMPANA>', '<UUID-EDITOR>', 'editor'),
  ('<UUID-CAMPANA>', '<UUID-LECTOR>', 'lector');
```

### Cargar datos mínimos de dominio

```sql
-- Sustituir <UUID-CAMPANA> por el id real de campanas
INSERT INTO comunas (id_campana, nombre, numero)
VALUES ('<UUID-CAMPANA>', 'Comuna 1', '01');

INSERT INTO roles (id_campana, nombre, nivel_jerarquia)
VALUES ('<UUID-CAMPANA>', 'Líder zona', 1);

INSERT INTO votantes (
  id_campana, tipo_documento, numero_documento, nombres, apellidos, sexo
) VALUES (
  '<UUID-CAMPANA>', 'CC', '1234567890', 'Juan', 'Pérez', 'Masculino'
);
```

---

## 11. Migrar de BD de prueba → BD definitiva

Cuando la base definitiva esté lista (cuenta/org de producción):

### Esquema (siempre)

1. Proyecto Supabase nuevo (prod)
2. Ejecutar **las mismas** migraciones del repo (`001`, `002`, y las futuras en orden)
3. Verificación sección 6
4. Crear usuarios Auth de producción (dueño real, no contraseñas de dev en prod)
5. `INSERT` en `miembros_plataforma` con UUID del dueño prod
6. Actualizar `.env` / `.env.local` / secretos de despliegue (Vercel, etc.)

### Datos de negocio

| Escenario | Acción |
|-----------|--------|
| Poca data de prueba | Recrear manualmente desde `/platform` |
| Muchos votantes/catálogos | Export CSV o `pg_dump` solo datos (tablas `public`) e importar en prod **después** del esquema; revisar UUIDs de `auth.users` si hay `id_usuario` en miembros |
| Usuarios Auth | Recrear en prod; **no** copiar `auth.users` entre proyectos sin proceso formal |

### Lo que NO debes reutilizar en prod

- `service_role` key de dev en producción
- Contraseñas débiles de prueba
- Datos personales reales en entorno de desarrollo (usar datos ficticios)

---

## 12. Roadmap de migraciones futuras

| # | Archivo | Contenido | Estado |
|---|---------|-----------|--------|
| 001 | `001_platform_core.sql` | Plataforma + RLS base | ✅ |
| 002 | `002_domain_schema.sql` | Dominio electoral + RLS por rol | ✅ |
| 003 | `003_capture.sql` | Web público, sesiones WA/TG | Pendiente |
| 004 | `004_platform_brand.sql` | Branding + storage | Pendiente |
| 005 | `005_jobs.sql` | Cola de jobs | Pendiente |
| 007 | `007_e14.sql` | E14 + anomalías | Pendiente |

Al añadir `003+` en Git: aplicar en **prueba** primero, verificar, luego en **definitiva** con el mismo orden.

---

## 13. Referencia rápida — proyecto de prueba actual

| Campo | Valor |
|-------|-------|
| Project ref | `kadhnauhghzyhfhsomif` |
| URL | https://kadhnauhghzyhfhsomif.supabase.co |
| SQL Editor | https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/sql/new |
| Dueño configurado | `anamariagarcia093@gmail.com` → `dueno_plataforma` |

---

*Última actualización: 2026-06-14 — incluye RLS por rol, `tipo_sexo` Masculino/Femenino, y pasos validados en el primer setup.*
