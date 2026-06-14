# Plataforma de Campañas

SaaS multi-campaña para campañas políticas en Colombia: votantes, cuarentena, WhatsApp (Twilio), Telegram, web pública, CAPTCHA Solver, E14+IA, estadísticas y export al cierre.

## Stack

| Capa | Tecnología |
|------|------------|
| UI | Next.js 16 + Tailwind + shadcn/ui (`apps/web`) |
| Datos / IA | Python 3 + Flask (`services/python`) |
| Backend | Supabase (Postgres + RLS + Auth + Storage) |

## Desarrollo local

```powershell
# Dependencias
npm install
pip install -r services/python/requirements.txt

# Variables de entorno
copy .env.example .env
# Completar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

# Supabase (migraciones)
npx supabase db push

# Servicios (UI + API a la vez)
npm run dev

# O por separado:
python services/python/run.py   # http://localhost:5000
npm run dev:web                 # http://localhost:3000
```

Ver [`supabase/DESARROLLO-LOCAL.md`](supabase/DESARROLLO-LOCAL.md) para `.env.local` y login.

## Estructura

```
apps/web/              Next.js — UI
services/python/       Flask — stats, export, E14, jobs
supabase/              Migraciones y Edge Functions
openspec/              Especificaciones SDD
```

## Base de datos Supabase

1. Aplicar migraciones en orden: `001_platform_core.sql` → `002_domain_schema.sql`
2. Crear usuario en Auth y registrar dueño en `miembros_plataforma`
3. Configurar `apps/web/.env.local`

**Guía completa (prueba → BD definitiva):** [`supabase/GUIA-MIGRACION-BD.md`](supabase/GUIA-MIGRACION-BD.md)  
**Checklist rápido:** [`supabase/SETUP-DB.md`](supabase/SETUP-DB.md)

## Documentación

Especificaciones y decisiones de producto en `openspec/changes/plataforma-campanas/`.  
| Recurso | Archivo |
|---------|---------|
| Diccionario de campos | `supabase/DICCIONARIO-DATOS.md` |
| Esquema / tablas | `supabase/DATABASE-SCHEMA.md` |
| Migración BD | `supabase/GUIA-MIGRACION-BD.md` |
