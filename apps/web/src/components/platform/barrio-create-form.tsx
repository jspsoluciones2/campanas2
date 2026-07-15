"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBarrioMaestraAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

type Depto = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type Comuna = { id: number; nombre: string; id_municipio: number };

type Props = {
  departamentos: Depto[];
  municipios: Municipio[];
  comunas: Comuna[];
};

export function BarrioCreateForm({ departamentos, municipios, comunas }: Props) {
  const router = useRouter();
  const [idDepto, setIdDepto] = useState("");
  const [idMunicipio, setIdMunicipio] = useState("");
  const [pending, setPending] = useState(false);

  const municipiosFiltrados = useMemo(
    () => municipios.filter((m) => m.id_departamento === idDepto),
    [municipios, idDepto]
  );

  const comunasFiltradas = useMemo(
    () => comunas.filter((c) => String(c.id_municipio) === idMunicipio),
    [comunas, idMunicipio]
  );

  const handleDeptoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIdDepto(val);
    setIdMunicipio("");
  };

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIdMunicipio(e.target.value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createBarrioMaestraAction(formData);
    if (result?.error) {
      window.alert(result.error);
      setPending(false);
      return;
    }
    router.refresh();
    setIdDepto("");
    setIdMunicipio("");
    form.reset();
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} id="create-barrio-form">
      <div className="flex flex-wrap items-end gap-3">
        <FormField label="Departamento">
          <select
            value={idDepto}
            onChange={handleDeptoChange}
            className={platformSelectClass}
          >
            <option value="">Seleccionar departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Municipio">
          <select
            value={idMunicipio}
            onChange={handleMunicipioChange}
            disabled={!idDepto}
            className={platformSelectClass}
          >
            <option value="">{idDepto ? "Seleccionar municipio" : "Primero elige departamento"}</option>
            {municipiosFiltrados.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Comuna">
          <select
            name="id_comuna"
            required
            disabled={!idMunicipio}
            className={platformSelectClass}
          >
            <option value="">{idMunicipio ? "Seleccionar comuna" : "Primero elige municipio"}</option>
            {comunasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Nombre del barrio">
          <input
            name="nombre"
            placeholder="Ej. Barrio Centro"
            required
            className={platformInputClass}
          />
        </FormField>

        <Button type="submit" disabled={pending} className="h-10 shrink-0 px-6">
          {pending ? "Creando…" : "Crear barrio"}
        </Button>
      </div>
    </form>
  );
}
