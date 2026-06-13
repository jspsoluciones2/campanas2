# Inicio rápido — Proyecto Campañas

Guía para retomar el trabajo después de reiniciar el PC.

## 1. Abrir el proyecto

```powershell
cd "C:\Users\ACER NITRO\Downloads\Proyecto_Campañas"
```

Abre esta carpeta en **Cursor** (File → Open Folder).

---

## 2. Levantar servicios (obligatorio tras reinicio)

### Engram — servidor HTTP

Cursor usa Engram por MCP (stdio), pero `gentle-ai doctor` y algunas herramientas esperan el servidor HTTP en el puerto 7437.

**Opción A — ventana dedicada (recomendada):**

```powershell
engram serve
```

Deja esa terminal abierta. Deberías ver:

```text
[engram] HTTP server listening on 127.0.0.1:7437
```

**Opción B — segundo plano (misma sesión de PowerShell):**

```powershell
Start-Process -FilePath "engram" -ArgumentList "serve","7437" -WindowStyle Hidden
```

---

## 3. Verificar que el stack está listo

```powershell
gentle-ai doctor
```

Resultado esperado: **Status: healthy** (8 checks en verde).

Si algo falla:

```powershell
gentle-ai update
gentle-ai upgrade
```

---

## 4. Comprobar herramientas clave (opcional)

```powershell
gentle-ai version
engram --version
gga.cmd --version
claude --version
opencode --version
```

Versiones de referencia (jun 2026):

| Herramienta | Versión |
|---|---|
| gentle-ai | 1.40.2 |
| engram | 1.16.3 |
| gga | 2.8.1 |
| opencode | 1.17.4 |

---

## 5. Continuar con el proyecto

Cuando el stack esté healthy, inicia el flujo SDD en esta carpeta:

```powershell
cd "C:\Users\ACER NITRO\Downloads\Proyecto_Campañas"
```

En Cursor, pide al agente:

```text
sdd init
```

O, si prefieres OpenCode en terminal:

```powershell
opencode "C:\Users\ACER NITRO\Downloads\Proyecto_Campañas"
```

Luego usa `/sdd-init` dentro de OpenCode.

---

## Script todo-en-uno (copiar y pegar)

```powershell
# Ir al proyecto
cd "C:\Users\ACER NITRO\Downloads\Proyecto_Campañas"

# Levantar engram en segundo plano
Start-Process -FilePath "engram" -ArgumentList "serve","7437" -WindowStyle Hidden

# Esperar un momento y verificar
Start-Sleep -Seconds 2
gentle-ai doctor

Write-Host "`nListo. Abre esta carpeta en Cursor y ejecuta 'sdd init' para empezar."
```

---

## Notas

- **No hace falta** volver a instalar gentle-ai, gga ni engram tras cada reinicio; ya están en el PATH.
- **Sí hace falta** `engram serve` cada vez que reinicies el PC (si quieres `doctor` healthy).
- Los plugins de OpenCode viven en `C:\Users\ACER NITRO\.config\opencode` y persisten tras reinicio.
- Si `gga` no responde, usa `gga.cmd` en lugar de `gga`.
