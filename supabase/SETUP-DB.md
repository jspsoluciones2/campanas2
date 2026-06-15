# Supabase — inicio rápido

Guía corta. **Runbook completo (prueba → BD definitiva):** [GUIA-MIGRACION-BD.md](./GUIA-MIGRACION-BD.md)

---

## Proyecto actual (prueba)

| Campo | Valor |
|-------|-------|
| **URL** | https://kadhnauhghzyhfhsomif.supabase.co |
| **Project ref** | `kadhnauhghzyhfhsomif` |

---

## Checklist mínimo

1. Ejecutar migraciones en orden: `001` → `002` → `003` → `004` (SQL Editor o `supabase db push`)
2. Crear usuario en **Authentication**
3. `INSERT` dueño con UUID **real** (ver [sección 7 de la guía](./GUIA-MIGRACION-BD.md#7-usuario-dueño-de-plataforma-dueno_plataforma))
4. Completar `apps/web/.env.local` (URL + anon key)
5. Login en http://localhost:3000 → probar `/platform`

---

## Dueño — copiar y pegar (solo este proyecto de prueba)

```sql
-- 1) Ver UUID
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 2) Insertar (UUID del dueño en este proyecto)
INSERT INTO miembros_plataforma (id_usuario, rol)
VALUES ('1a9105d7-e0d8-4d02-9a88-b34ec796f1c7', 'dueno_plataforma');

-- 3) Verificar
SELECT mp.rol, u.email
FROM miembros_plataforma mp
JOIN auth.users u ON u.id = mp.id_usuario;
```

En la **BD definitiva** usa el UUID del usuario de ese proyecto, no este.

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [GUIA-MIGRACION-BD.md](./GUIA-MIGRACION-BD.md) | Migración completa, verificación, errores, prod |
| [PROYECTO-PROD.template.md](./PROYECTO-PROD.template.md) | Plantilla para rellenar BD definitiva |
| [DESARROLLO-LOCAL.md](./DESARROLLO-LOCAL.md) | Arrancar localhost (3000 + 5000) |
| [DICCIONARIO-DATOS.md](./DICCIONARIO-DATOS.md) | Campos y enums |
| [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) | Mapa de tablas |
