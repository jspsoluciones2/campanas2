# Desarrollo local — localhost

## Un solo comando (UI + API)

Desde la raíz del repo:

```powershell
npm run dev
```

Levanta en paralelo:

| Servicio | URL |
|----------|-----|
| Next.js (UI) | http://localhost:3000 |
| Flask (API) | http://localhost:5000 |

## Por separado

```powershell
npm run dev:web    # solo UI — puerto 3000
npm run dev:api    # solo API — puerto 5000
```

## Antes de arrancar (una vez)

### 1. Dependencias

```powershell
npm install
pip install -r services/python/requirements.txt
```

### 2. Supabase en `.env.local`

Copia y completa con keys **reales** del dashboard:

```powershell
copy apps\web\.env.local.example apps\web\.env.local
```

Dashboard → [API Settings (proyecto prueba)](https://supabase.com/dashboard/project/kadhnauhghzyhfhsomif/settings/api):

```env
NEXT_PUBLIC_SUPABASE_URL=https://kadhnauhghzyhfhsomif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon public key — NO dejar PEGA_AQUI
FLASK_API_URL=http://localhost:5000
```

Opcional en raíz `.env` (Flask):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Reinicia `npm run dev` después de guardar `.env.local`.

### 3. Usuario dueño en la BD

Debe existir fila en `miembros_plataforma` para tu usuario Auth. Ver [SETUP-DB.md](./SETUP-DB.md).

## Probar que todo funciona

1. http://localhost:3000 — inicio (no debe decir “Supabase no configurado”)
2. http://localhost:3000/login — login con `anamariagarcia093@gmail.com`
3. http://localhost:3000/platform — panel dueño
4. http://localhost:5000/api/health — API Flask OK

## Guías relacionadas

- [GUIA-MIGRACION-BD.md](./GUIA-MIGRACION-BD.md) — BD y migración a prod
- [SETUP-DB.md](./SETUP-DB.md) — checklist BD
