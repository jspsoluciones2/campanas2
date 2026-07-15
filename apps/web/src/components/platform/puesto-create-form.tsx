"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPuestoMaestraAction } from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import {
  FormField,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

type Depto = { id: string; nombre: string };
type Municipio = { id: string; nombre: string; id_departamento: string };
type Comuna = { id: number; nombre: string; id_municipio: number };
type Barrio = { id: number; nombre: string; id_comuna: number };

type Props = {
  departamentos: Depto[];
  municipios: Municipio[];
  comunas: Comuna[];
  barrios: Barrio[];
};

export function PuestoCreateForm({
  departamentos,
  municipios,
  comunas,
  barrios,
}: Props) {
  const router = useRouter();
  const [idDepto, setIdDepto] = useState("");
  const [idMunicipio, setIdMunicipio] = useState("");
  const [idComuna, setIdComuna] = useState("");
  const [pending, setPending] = useState(false);

  const municipiosFiltrados = useMemo(
    () => municipios.filter((m) => m.id_departamento === idDepto),
    [municipios, idDepto]
  );

  const comunasFiltradas = useMemo(
    () => comunas.filter((c) => String(c.id_municipio) === idMunicipio),
    [comunas, idMunicipio]
  );

  const barriosFiltrados = useMemo(
    () => barrios.filter((b) => String(b.id_comuna) === idComuna),
    [barrios, idComuna]
  );

  const handleDeptoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIdDepto(val);
    setIdMunicipio("");
    setIdComuna("");
  };

  const handleMunicipioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIdMunicipio(val);
    setIdComuna("");
  };

  const handleComunaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIdComuna(e.target.value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createPuestoMaestraAction(formData);
    if (result?.error) {
      window.alert(result.error);
      setPending(false);
      return;
    }
    router.refresh();
    setIdDepto("");
    setIdMunicipio("");
    setIdComuna("");
    form.reset();
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} id="create-puesto-form">
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
            <option value="">
              {idDepto ? "Seleccionar municipio" : "Primero elige departamento"}
            </option>
            {municipiosFiltrados.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Comuna">
          <select
            value={idComuna}
            onChange={handleComunaChange}
            disabled={!idMunicipio}
            className={platformSelectClass}
          >
            <option value="">
              {idMunicipio ? "Seleccionar comuna" : "Primero elige municipio"}
            </option>
            {comunasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Barrio">
          <select
            name="id_barrio"
            required
            disabled={!idComuna}
            className={platformSelectClass}
          >
            <option value="">
              {idComuna ? "Seleccionar barrio" : "Primero elige comuna"}
            </option>
            {barriosFiltrados.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Nombre del puesto">
          <input
            name="nombre"
            placeholder="Ej. Colegio San José"
            required
            className={platformInputClass}
          />
        </FormField>

        <FormField label="Dirección">
          <input
            name="direccion"
            placeholder="Ej. Cra 10 # 20-30"
            className={platformInputClass}
          />
        </FormField>

        <input type="hidden" name="id_comuna" value={idComuna} />

        <FormField label="Cupos H">
          <input
            name="votantes_hombres_admite"
            type="number"
            defaultValue="0"
            className={platformInputClass}
          />
        </FormField>

        <FormField label="Cupos M">
          <input
            name="votantes_mujeres_admite"
            type="number"
            defaultValue="0"
            className={platformInputClass}
          />
        </FormField>

        <FormField label="Mesas">
          <input
            name="cantidad_mesas"
            type="number"
            defaultValue="0"
            className={platformInputClass}
          />
        </FormField>

        <Button type="submit" disabled={pending} className="h-10 shrink-0 px-6">
          {pending ? "Creando…" : "Crear puesto"}
        </Button>
      </div>
    </form>
  );
}
