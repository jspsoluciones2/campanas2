"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, platformButtonClass } from "@/components/platform/platform-ui";
import { cn } from "@/lib/utils";

type BulkState = {
  error?: string;
  ok?: boolean;
  message?: string;
  created?: number;
  errors?: { row: number; message: string }[];
};

type Props = {
  tipo: "departamentos" | "municipios" | "comunas" | "barrios" | "puestos-votacion";
  templateHref: string;
  instructions: string;
  columnas: string;
  entityLabel: string;
};

export function MaestrasBulkUpload({
  tipo,
  templateHref,
  instructions,
  columnas,
  entityLabel,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<BulkState>({});
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    errors: number;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setState({});
    setProgress(null);
    setPending(true);

    formData.set("tipo", tipo);

    try {
      const res = await fetch("/api/maestras/bulk-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setState({ error: "Error del servidor. Intenta de nuevo." });
        setPending(false);
        return;
      }

      if (!res.body) {
        setState({ error: "Sin respuesta del servidor." });
        setPending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setProgress({
                current: data.current,
                total: data.total,
                errors: data.errors,
              });
            } else if (data.type === "complete") {
              setState({
                ok: data.errors.length === 0,
                message: data.message,
                created: data.created,
                errors: data.errors,
              });
              setProgress(null);
              formRef.current?.reset();
            } else if (data.type === "error") {
              setState({ error: data.error });
              setProgress(null);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setState({ error: "Error de conexión. Intenta de nuevo." });
    }

    setPending(false);
  }

  const pct = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <Card title="Carga masiva" description={`${instructions} Columnas: ${columnas}.`}>
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <a href={templateHref} className={`${platformButtonClass} gap-1.5 px-3`}>
          <Download className="size-4 shrink-0" />
          Plantilla
        </a>
        <input
          name="archivo"
          type="file"
          accept=".xlsx,.xls"
          required
          disabled={pending}
          aria-label="Archivo Excel"
          className="h-10 min-w-0 flex-1 text-sm text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-2.5 file:py-1.5 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
        />
        <Button type="submit" disabled={pending} className="h-10 shrink-0 px-4">
          <Upload className="size-4" />
          {pending ? `${pct}%` : "Importar"}
        </Button>
      </form>

      {progress ? (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-800 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">
            {progress.current} de {progress.total} registro(s){" "}
            {progress.errors > 0
              ? `· ${progress.errors} error(es)`
              : ""}
          </p>
        </div>
      ) : null}

      {state.message ? (
        <div
          className={cn(
            "mt-3 rounded-lg px-3 py-2 text-sm",
            state.error || (state.errors && state.errors.length > 0)
              ? "bg-amber-50 text-amber-900"
              : "bg-emerald-50 text-emerald-900"
          )}
        >
          {state.message}
        </div>
      ) : null}

      {state.errors && state.errors.length > 0 ? (
        <ul className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-amber-950">
          {state.errors.slice(0, 20).map((item) => (
            <li key={`${item.row}-${item.message}`}>
              Fila {item.row}: {item.message}
            </li>
          ))}
          {state.errors.length > 20 ? (
            <li className="text-amber-700">
              … y {state.errors.length - 20} error(es) más.
            </li>
          ) : null}
        </ul>
      ) : null}
    </Card>
  );
}
