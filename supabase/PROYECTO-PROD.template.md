# Plantilla — proyecto Supabase DEFINITIVO

> Copia este archivo como `PROYECTO-PROD.md` (local) o rellénalo cuando tengas la BD de producción.  
> **No subas API keys a Git.**

## Identificación

| Campo | Valor |
|-------|-------|
| Nombre en dashboard | |
| Project ref | |
| URL | https://\<PROJECT-REF\>.supabase.co |
| Región | |
| Cuenta / organización | |
| Fecha de creación | |

## Credenciales API

Dashboard → Settings → API

| Variable | Valor (local / secretos deploy) |
|----------|----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | → `apps/web/.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | → `.env` (solo Flask) |

## Dueño plataforma (producción)

| Campo | Valor |
|-------|-------|
| Email | |
| UUID (`auth.users.id`) | |

```sql
INSERT INTO miembros_plataforma (id_usuario, rol)
VALUES ('<UUID-DUEÑO-PROD>', 'dueno_plataforma');
```

## Migraciones

- [ ] `001_platform_core.sql` — fecha: ______
- [ ] `002_domain_schema.sql` — fecha: ______

## Checklist al cambiar de prueba → definitiva

- [ ] Proyecto Supabase prod creado
- [ ] Migraciones 001 + 002 aplicadas
- [ ] Usuario Auth dueño creado + INSERT en `miembros_plataforma`
- [ ] `.env` y `apps/web/.env.local` actualizados con keys **prod**
- [ ] Login y `/platform` probados
- [ ] Proyecto de **prueba** sigue separado (no mezclar keys)

## Notas

-
