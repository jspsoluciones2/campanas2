# Brand Config Specification

## Purpose

Branding **de la plataforma** (dueños del SaaS): logo, colores y tipografía que ven **todos** los usuarios y canales. **No** hay branding por político ni por campaña — el producto siempre muestra la marca de ustedes.

## Requirements

### Requirement: Branding único a nivel plataforma

The system MUST almacenar un solo conjunto de design tokens y assets en configuración de plataforma (`platform_brand_config`). Solo `platform_owner` MUST poder editarlos. Campañas y políticos MUST NOT personalizar logo, colores ni tipografía.

#### Scenario: Formulario web con marca de la plataforma

- GIVEN un votante accede al formulario público de cualquier campaña
- WHEN se renderiza la UI
- THEN MUST mostrar logo, colores y tipografía de la plataforma
- AND MUST NOT aplicar tema distinto por campaña

### Requirement: Configuración de assets

The system MUST permitir a `platform_owner` subir logo y favicon a Supabase Storage (`platform-assets/`). Formatos: PNG, SVG, WebP. Tamaño máximo default 2MB.

#### Scenario: Subir logo de plataforma

- GIVEN `platform_owner` en `/platform/settings/brand`
- WHEN sube logo PNG válido
- THEN MUST actualizarse `platform_brand_config.logo_url`
- AND MUST verse en todos los canales web y dashboards

### Requirement: Design tokens

The system MUST almacenar tokens JSON: `primary_color`, `secondary_color`, `accent_color`, `background_color`, `font_family_heading`, `font_family_body`. Tokens MUST aplicarse como CSS variables globales.

#### Scenario: Cambio de color primario

- GIVEN `platform_owner` actualiza `primary_color`
- WHEN cualquier usuario accede a la app
- THEN la UI MUST reflejar el nuevo color en toda la plataforma

### Requirement: Preview y publicación

The system MUST ofrecer preview antes de publicar cambios de marca. Estados: `draft` y `published`. Publicar MUST registrar en `audit_log`.

#### Scenario: Borrador no afecta producción

- GIVEN tokens en `draft`
- WHEN usuarios usan la app
- THEN MUST ver tema `published` anterior

### Requirement: No exportar branding en cierre de campaña

El branding de plataforma MUST NOT incluirse en el paquete de exportación al político — es activo del SaaS, no entregable del cliente.

#### Scenario: Export de campaña finalizada

- GIVEN campaña en `ended` con export generado
- WHEN el político descarga el ZIP
- THEN MUST NOT contener archivos de branding ni `platform_brand_config`
