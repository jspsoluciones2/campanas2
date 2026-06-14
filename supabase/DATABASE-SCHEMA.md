# Esquema de dominio — español

**Proyecto:** `kadhnauhghzyhfhsomif`  
**Convención:** tablas y columnas en español (snake_case).

---

## Plataforma (`001_platform_core.sql`)

| Tabla | Descripción |
|-------|-------------|
| `procesos_electorales` | Elección que agrupa campañas |
| `clientes` | Político recurrente (`nombre`, `documento`, `telefono`, `correo_contacto`) |
| `campanas` | Silo operativo (`estado`: activa, pausada, finalizada, purgada) |
| `miembros_plataforma` | Dueños SaaS (`rol`: dueno_plataforma) |
| `miembros_campana` | Usuarios app (`rol`: lector, editor, administrador_campana) |
| `caracteristicas_campana` | Módulos contratados |
| `integraciones_campana` | APIs por campaña |
| `uso_campana` | Consumo interno |
| `exportaciones_campana` | ZIP al cierre |
| `configuracion_marca_plataforma` | Branding global |
| `registro_auditoria` | Auditoría |

**Funciones RLS:** `es_dueno_plataforma()`, `ids_campanas_usuario()`, `puede_leer_campana()`, `puede_editar_campana()`, `puede_administrar_campana()`

---

## Dominio electoral (`002_domain_schema.sql`)

| Tabla | Campos principales |
|-------|-------------------|
| `roles` | `nombre`, `nivel_jerarquia` (1–3) — por `id_campana` |
| `comunas` | `nombre`, `numero` |
| `barrios` | `nombre`, `id_comuna` |
| `puestos_votacion` | `nombre`, `municipio`, `direccion`, cupos H/M, `cantidad_mesas`, `codigo_registraduria` |
| `tipos_novedad` | `novedad` |
| `votantes` | datos personales + `id_puesto_votacion`, `mesa`, `id_rol`, `id_lider_directo` |
| `datos_trabajador_votante` | trabajo, dirección, comuna/barrio |
| `novedades` | `id_tipo_novedad`, `detalle` |

**Árbol de líderes:** `votantes.id_lider_directo` → `votantes.id`  
**Consulta jerarquía:** `subarbol_votantes(id_votante_raiz)`

---

## Documentos relacionados

- **[DICCIONARIO-DATOS.md](./DICCIONARIO-DATOS.md)** — función de cada campo (documento principal de referencia)
- **[GUIA-MIGRACION-BD.md](./GUIA-MIGRACION-BD.md)** — setup completo y migración a BD definitiva
- `SETUP-DB.md` — checklist rápido
