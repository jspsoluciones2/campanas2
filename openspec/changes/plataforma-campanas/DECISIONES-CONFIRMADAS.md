# Decisiones confirmadas — plataforma-campanas

**Fecha**: 2026-06-13  
**Fuente**: Product Owner

---

## 1. Modelo de negocio — SaaS multi-campaña

**Confirmado.** La plataforma servirá para **diversas campañas**. El producto se **venderá a diferentes políticos** para que cada uno gestione sus votantes de forma aislada.

- Una instalación, múltiples clientes
- Aislamiento por `campaign_id` + Supabase RLS
- Superadmin provisiona campañas nuevas

---

## 2. Formulario web público — Sí, en MVP

**Confirmado.** Canal adicional a WhatsApp y Telegram.

- **Sin login** — acceso solo por **enlace único** (token en URL)
- No es un directorio público; quien no tiene el enlace no accede
- Admin puede regenerar/revocar el enlace
- Canal registrado como `web_publico`; `created_by` nullable

---

## 3. Verificación registraduría — CAPTCHA Solver

**Confirmado.** La aplicación se llama **CAPTCHA Solver** (no Cacholver).

- Resuelve captchas de la registraduría
- Consulta puesto de votación y datos oficiales del votante por cédula
- Módulo renombrado: `captcha-solver-integration`
- Contrato API exacto: pendiente documentación del proveedor

---

## 4. WhatsApp — Twilio (evitar Meta directo)

**Confirmado.** Preferencia por **no integrar Meta Cloud API directamente** en la aplicación.

**Cómo funciona con Twilio:**
- Tu app solo se comunica con la **API de Twilio**
- Twilio gestiona el WhatsApp Business Account, plantillas y webhooks
- No necesitas manejar tokens Meta ni endpoints de Meta en tu código
- Webhook entrante → Supabase Edge Function → flujo conversacional

**Limitación honesta:** WhatsApp oficial siempre usa la infraestructura de Meta. Twilio no elimina WhatsApp, pero **sí elimina la integración directa** y reduce carga operativa. Si WhatsApp tiene caídas de red, Telegram y el formulario web por enlace siguen activos.

**Pasos de alto nivel (implementación):**
1. Crear cuenta Twilio
2. Registrar sender WhatsApp (vía Twilio)
3. Aprobar plantillas de mensaje
4. Configurar webhook a nuestra Edge Function
5. Validar firma Twilio en cada mensaje entrante

---

## 5. Campos del votante — Definidos por PO (2026-06-13)

**Confirmado en sesión de diseño BD.**

### Votante
Nombres, apellidos, documento, tipo de documento, sexo, fecha de nacimiento, teléfono, dirección, id puesto de votación, mesa, id rol (organizacional), id líder directo.

### Catálogos
- **Puestos de votación:** id, nombre, municipio, comuna, barrio, dirección, cupos H/M, cantidad mesas
- **Roles:** id, nombre (rol organizacional del votante en campaña)
- **Comunas:** id, nombre, número
- **Barrios:** id, nombre
- **Tipos de novedad:** id, descripción
- **Novedades:** votante, tipo, detalle
- **Trabajadores (votante):** lugar y dirección de trabajo, comuna/barrio asignados

### Cliente
Nombre, documento, teléfono (además de campos en `001_platform_core`).

### Campaña
Nombre + usuarios asignados vía `campaign_members` (permisos de app).

Ver `supabase/DATABASE-SCHEMA.md` y migración `002_domain_schema.sql`.

### Catálogos por campaña (confirmado)
Comunas, barrios, puestos de votación, roles y tipos de novedad se crean **por campaña**. Los puestos reflejan datos de **registraduría** (cupos hombres/mujeres, mesas) según el año/proceso y sus actualizaciones.

### Árbol de líderes (confirmado)
Cada votante tiene `lider_directo_id` → otro votante de la misma campaña. Roles con `nivel_jerarquia` 1, 2 o 3. Estructura en árbol para consultar votantes por jerarquía más adelante.

---

## 6. Administración en dos niveles — Dueños vs campaña

**Confirmado.** Existe **un solo módulo de administración/configuración** para **nosotros como dueños** del producto SaaS.

| Nivel | Quién | Qué hace |
|-------|-------|----------|
| **Plataforma** (`platform_owner`) | Dueños del producto | Crear campañas, **asignar usuarios a cada político/campaña**, activar módulos, configuración global |
| **Campaña** (equipo del político) | Asignados por dueños | Operar su campaña: recolectar votantes, cuarentena, stats, E14 |

Puntos clave:
- Los dueños **asignan** quién entra a la campaña de cada político (y con qué rol)
- Los equipos de campaña **no ven** otras campañas
- Las **coincidencias** (duplicados entre recolectores) son críticas — se resuelven en cuarentena **dentro de cada campaña**
- Rol técnico: `platform_owner` (reemplaza el concepto genérico de superadmin)

---

## 7. Aislamiento absoluto entre políticos — Sin cruce, sin comparación

**Confirmado (crítico).** El político 1 y el político 2 **no tienen nada que ver entre sí**. Son silos completos.

| Qué | ¿Se comparte o cruza? |
|-----|------------------------|
| Votantes | **No** — cada campaña tiene su propia base |
| Cuarentena / coincidencias | **No** — la cuarentena del político A no ve ni compara con la del político B |
| Branding, stats, E14, enlaces | **No** — todo aislado por `campaign_id` |
| Usuarios del equipo | **No** — un recolector del político A no entra al dashboard del político B |
| Misma cédula en dos campañas | **Válido** — son dos registros independientes, sin alerta cruzada |

**Qué SÍ compara la cuarentena (solo dentro de UNA campaña):**

Cuando **dos recolectores del mismo político** registran al **mismo votante** en **la misma campaña** → ahí entra cuarentena. Eso es lo único que se compara: registros **dentro del mismo silo**.

**Quién gobierna qué:**

- **Ustedes (dueños):** panel `/platform` — ven y administran **todas** las campañas (crear, asignar usuarios, activar módulos). Gobiernan el producto, no mezclan datos de votantes entre clientes en operación normal.
- **Cada político y su equipo:** solo su campaña. El político 2 **no entra** al espacio del político 1, ni al revés.

---

## 8. Arquitectura — Un código, un servidor (SaaS multi-tenant)

**Recomendación confirmada para el MVP:** **un solo código fuente**, **un despliegue**, **una base Supabase** con aislamiento por `campaign_id` + RLS.

**No** un deploy y una base de datos separada por cada político (salvo tier premium futuro con contrato dedicado).

| Enfoque | Cómo se ve | Ventaja | Problema para ustedes |
|---------|------------|---------|------------------------|
| **Multi-tenant (elegido)** | Una app, una BD, silos lógicos por campaña | Un panel `/platform` para gobernar todo; un deploy; actualizaciones una vez | Requiere RLS bien hecho (lo especificamos y testeamos) |
| **Un deploy por político** | Mismo código copiado N veces, N BDs, N URLs | Aislamiento físico total | Ustedes tendrían N consolas, N deploys, N mantenimientos — **no hay un solo lugar para gobernar todas las campañas** |

**Analogía:** Un edificio con apartamentos separados (multi-tenant), no N casas en N ciudades (un deploy por cliente). Cada político tiene su apartamento cerrado con llave; ustedes son la administración del edificio.

**Garantía para el cliente político:** En código y en base de datos, las políticas RLS impiden que un usuario de la campaña A lea o escriba datos de la campaña B. La cuarentena solo consulta tablas filtradas por `campaign_id = la suya`.

---

## 9. Cliente recurrente vs campaña — Historial de cuenta, datos que se van

**Confirmado.** Se mantiene la analogía del edificio, con un matiz importante:

| Concepto | Qué es | Qué persiste |
|----------|--------|--------------|
| **Cliente** (`clients`) | El político como **cuenta** en el edificio — quien puede volver en otra elección | Identidad, historial de campañas (nombres, fechas, estado), usuarios vinculados al cliente |
| **Campaña** (`campaigns`) | Un **apartamento por proceso electoral** | Votantes, cuarentena, stats, E14, enlaces — datos operativos del proceso |

**Cliente que vuelve:** Si el mismo político trabaja con ustedes en 2024 y otra vez en 2028, **no empieza de cero como persona**: tiene su cuenta con historial (“Alcaldía 2024 — finalizada”, “Senado 2028 — activa”). Ustedes crean una **nueva campaña** bajo el mismo `client_id`.

**Cuando termina la campaña (pierde, gana, se acaba el contrato):**

1. Ustedes marcan la campaña como **finalizada** (`ended`).
2. El sistema genera export con **solo**: votantes + historial, cuarentena, E14 y **estadísticas en PDF** (snapshot al cierre). **No** incluye: branding (es de la plataforma), canales, enlaces, config ni auditoría.
3. Los datos **permanecen en el SaaS** en estado `ended` hasta que **ustedes decidan** purgar — **no es automático**.
4. **Purga (`purged`):** solo cuando ustedes como `platform_owner` lo ejecuten (ahorro de espacio, política interna, etc.). Ahí **se va todo** lo operativo; queda solo metadato de historial en la cuenta del cliente.

**Cliente recurrente:** Si el político vuelve, nueva campaña limpia bajo el mismo `client_id`; el historial muestra campañas pasadas (finalizada / purgada) sin mezclar datos entre elecciones.

**Aislamiento que no cambia:** Político 1 ≠ Político 2; campaña 2024 ≠ campaña 2028 del mismo político (en votantes y cuarentena).

---

## 10. Branding de plataforma (no por político)

**Confirmado.** El branding es **siempre el de ustedes** (dueños del SaaS). Los políticos **no** personalizan logo, colores ni tipografía. Un solo tema en `/platform/settings/brand`, visible en toda la app y canales. **No** va en el export al político.

---

## 11. Stack tecnológico — Next.js + Python (Flask)

**Confirmado.** Estándar **híbrido y sencillo**:

| Capa | Tecnología | Para qué |
|------|------------|----------|
| **Interfaz** | Next.js 15 + Tailwind + **shadcn/ui** | UI limpia, moderna y profesional — sin complicar |
| **Datos e IA** | **Python 3.12 + Flask** | Estadísticas, ciencia de datos, E14/IA, export ZIP, PDF de cierre |
| **Backend** | Supabase | Base de datos, auth, storage, webhooks ligeros |

**Regla de oro:** Next.js = pantallas. Flask = números, IA y archivos. Sin microservicios extra en MVP.

**Nota:** Se asume **Flask** (framework Python web), no Adobe Flash.

---

## 12. Integraciones y control de gastos por campaña

**Confirmado.** Al crear una campaña, **ustedes** (`platform_owner`) configuran las APIs relevantes **por campaña** — cada una con su propia configuración:

| Integración | Por campaña | Para controlar gastos |
|-------------|-------------|------------------------|
| **WhatsApp (Twilio)** | **Sí** — número y subaccount propios | Factura WA separada por cliente |
| **CAPTCHA Solver** | **Sí** — API key propia | Consultas medidas por campaña |
| **Telegram** | **Sí** — bot token propio | Aislamiento operativo |
| **IA (E14)** | **Sí** — API key / modelo propio | Tokens IA por cliente |
| **Supabase** | **No** — **uno solo** para toda la plataforma | Un plan; datos aislados con RLS |

**¿Por qué no un Supabase por político?** Multiplicaría costos fijos, perdería el panel único de administración y complicaría el mantenimiento. El aislamiento de datos ya lo da RLS por `campaign_id`. El control de gastos por cliente se logra en **Twilio, CAPTCHA e IA** — que son los consumos variables.

**Panel de uso:** `/platform/campaigns/{id}/usage` — **solo ustedes** (`platform_owner`). El equipo del político **nunca** ve gastos.

---

## 13. Gastos — solo administradores de plataforma

**Confirmado.** Costos por uso son información **interna**. Los políticos no ven consumo por día, CAPTCHA, teléfono ni IA. Ustedes entregan paquete cerrado.

---

## 14. E14 — una vez ustedes ejecutan, el cliente solo ve

**Confirmado.**

**Qué hace el módulo (ustedes, una sola vez por elección/lote):**
1. Descarga formularios E14 desde la **página de la registraduría**
2. Revisa PDFs con IA: tachones, cuentas que no coinciden, firmas, alteraciones…
3. Genera informes de anomalías

**Quién hace qué:**

| Rol | Acción |
|-----|--------|
| **Ustedes** (`platform_owner`) | Activan módulo por campaña + **Play** (descarga + análisis) **una vez** |
| **Cliente** (abogado, admin campaña) | **Solo ver** informes en su módulo `/campaign/{id}/e14` |

**Compartido:** Todas las campañas que **contrataron** E14 (`e14_audit = true`) en la **misma elección** ven el **mismo** análisis en su módulo — sin repetir descarga ni IA.

```
Ustedes → Play (1 vez) → descarga registraduría + IA
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   Campaña A (contrató)  Campaña B (contrató)  Campaña C (no contrató)
   solo ve               solo ve                 no ve nada
```

---

## Próximo paso

```text
sdd-apply plataforma-campanas
```

Comenzar por **Phase 0** (bootstrap) y **Phase 1** (`platform-core`).
