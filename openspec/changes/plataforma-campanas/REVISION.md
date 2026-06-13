# Revisión de especificaciones — plataforma-campanas

**Estado**: Listo para `sdd-apply` (Phase 0)
**Fecha**: 2026-06-13  
**Change**: `plataforma-campanas`

---

## Decisiones confirmadas

Ver detalle en [DECISIONES-CONFIRMADAS.md](DECISIONES-CONFIRMADAS.md).

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Multi-campaña SaaS | **Sí** — producto vendible a distintos políticos |
| 2 | Formulario web público | **Sí** — solo por enlace único, sin login |
| 3 | Verificación registraduría | **CAPTCHA Solver** (resolución captchas + puesto) |
| 4 | WhatsApp | **Twilio** — sin integración directa Meta en la app |
| 5 | Campos del votante | **Diferido** — se definen al construir BD Supabase |
| 6 | Admin de plataforma | **Un módulo para dueños** — asignan usuarios a cada campaña |
| 7 | Coincidencias | **Crítico** — solo dentro de la misma campaña; políticos no se cruzan |
| 8 | Arquitectura | **Un código, un servidor** — multi-tenant RLS; no un deploy por político |
| 9 | Cliente recurrente | Export: voters, history, quarantine, E14, stats PDF; purga manual dueños |
| 10 | Branding | **Solo plataforma** — no por político; no va en export |
| 11 | Stack | **Next.js** (UI) + **Python/Flask** (stats, IA, export) + Supabase |
| 12 | Integraciones | **Por campaña** (WA, CAPTCHA, TG, IA); Supabase compartido |
| 13 | Gastos | **Solo dueños** — políticos no ven consumo |
| 14 | E14 | Ustedes ejecutan 1 vez (registraduría + IA); cliente **solo ve**; compartido si contrató |

---

## Checklist de revisión

- [x] Objetivo y alcance reflejan visión del producto
- [x] 8 módulos cubren MVP (renombrado: `captcha-solver-integration`)
- [x] Orden MVP aceptable
- [x] Cuarentena de duplicados definida
- [x] Canales WA (Twilio), TG y web pública por enlace
- [x] Branding de plataforma (no por político)
- [x] Cierre con export acotado + purga discrecional
- [ ] CAPTCHA Solver — contrato API (pendiente docs del proveedor)
- [x] E14 + IA — especificado
- [x] Supabase como BD
- [x] Multi-tenant SaaS confirmado
- [x] Módulo único de admin para dueños (`platform_owner`)
- [x] Asignación de usuarios a campañas por dueños
- [x] Coincidencias/cuarentena priorizadas y aisladas por campaña
- [x] Gastos solo visibles para `platform_owner`
- [x] E14 compartible entre campañas (mismo proceso electoral)

---

## Documentos

| Documento | Ruta |
|-----------|------|
| Decisiones PO | [DECISIONES-CONFIRMADAS.md](DECISIONES-CONFIRMADAS.md) |
| Exploración | [exploration.md](exploration.md) |
| Propuesta | [proposal.md](proposal.md) |
| Diseño técnico | [design.md](design.md) |
| Specs (8 módulos) | [specs/](specs/) |

---

## Próximo paso

```text
sdd-apply plataforma-campanas
```

Comenzar por **Phase 0** y **Phase 1** (`platform-core` + esquema Supabase).
