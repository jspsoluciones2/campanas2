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

# Servicios
python services/python/run.py   # http://localhost:5000
npm run dev:web                 # http://localhost:3000
```

## Estructura

```
apps/web/              Next.js — UI
services/python/       Flask — stats, export, E14, jobs
supabase/              Migraciones y Edge Functions
openspec/              Especificaciones SDD
```

## Primer usuario (platform_owner)

1. Crear usuario en Supabase Auth (Dashboard → Authentication).
2. Insertar en `platform_members`:

```sql
INSERT INTO platform_members (user_id, role)
VALUES ('<uuid-del-usuario>', 'platform_owner');
```

## Documentación

Especificaciones y decisiones de producto en `openspec/changes/plataforma-campanas/`.
