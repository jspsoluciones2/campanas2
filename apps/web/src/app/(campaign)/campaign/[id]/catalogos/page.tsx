import { requireCampaignAccess } from "@/lib/campaign/access";
import {
  createBarrioFormAction,
  createComunaFormAction,
  createPuestoFormAction,
  createRolFormAction,
  createTipoNovedadFormAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  DataTable,
  FormField,
  FormRow,
  PageHeader,
  platformInputClass,
  platformSelectClass,
} from "@/components/platform/platform-ui";

export default async function CampaignCatalogosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireCampaignAccess(id);

  const [
    { data: comunas },
    { data: roles },
    { data: puestos },
    { data: tipos },
    { data: barrios },
  ] = await Promise.all([
    supabase
      .from("comunas")
      .select("id, nombre, numero, creado_en")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("roles")
      .select("id, nombre, nivel_jerarquia")
      .eq("id_campana", id)
      .order("nivel_jerarquia"),
    supabase
      .from("puestos_votacion")
      .select(
        "id, nombre, municipio, votantes_hombres_admite, votantes_mujeres_admite, cantidad_mesas"
      )
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("tipos_novedad")
      .select("id, novedad")
      .eq("id_campana", id)
      .order("novedad"),
    supabase
      .from("barrios")
      .select("id, nombre, comunas!inner(id, nombre, id_campana)")
      .eq("comunas.id_campana", id)
      .order("nombre"),
  ]);

  const comunasList = comunas ?? [];
  const rolesList = roles ?? [];
  const puestosList = puestos ?? [];
  const tiposList = tipos ?? [];
  const barriosList = barrios ?? [];

  return (
    <>
      <PageHeader
        title="Catálogos"
        description="Territorio, roles organizacionales y tipos de novedad — por campaña."
        backHref={`/campaign/${id}`}
        backLabel="Inicio campaña"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Comunas">
          <form action={createComunaFormAction.bind(null, id)} className="mb-4">
            <FormRow>
              <FormField label="Nombre">
                <input name="nombre" required className={platformInputClass} />
              </FormField>
              <FormField label="Número">
                <input name="numero" className={platformInputClass} />
              </FormField>
              <Button type="submit" variant="outline" className="h-10 shrink-0">
                Agregar
              </Button>
            </FormRow>
          </form>
          <DataTable
            data={comunasList}
            rowKey={(c) => c.id}
            emptyMessage="Sin comunas."
            columns={[
              { key: "n", header: "Nombre", cell: (c) => c.nombre },
              {
                key: "num",
                header: "Nº",
                cell: (c) => c.numero ?? "—",
              },
            ]}
          />
        </Card>

        <Card title="Barrios">
          <form action={createBarrioFormAction.bind(null, id)} className="mb-4">
            <FormRow className="flex-col items-stretch sm:flex-row sm:flex-wrap">
              <FormField label="Comuna">
                <select
                  name="id_comuna"
                  required
                  className={platformSelectClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  {comunasList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Nombre barrio">
                <input name="nombre" required className={platformInputClass} />
              </FormField>
              <Button type="submit" variant="outline" className="h-10 shrink-0 self-end">
                Agregar
              </Button>
            </FormRow>
          </form>
          <DataTable
            data={barriosList}
            rowKey={(b) => b.id}
            emptyMessage="Sin barrios. Crea comunas primero."
            columns={[
              { key: "n", header: "Barrio", cell: (b) => b.nombre },
              {
                key: "c",
                header: "Comuna",
                cell: (b) => {
                  const comuna = Array.isArray(b.comunas)
                    ? b.comunas[0]
                    : b.comunas;
                  return (comuna as { nombre: string } | null)?.nombre ?? "—";
                },
              },
            ]}
          />
        </Card>

        <Card title="Roles organizacionales" description="Jerarquía 1 (alto) a 3 (base).">
          <form action={createRolFormAction.bind(null, id)} className="mb-4">
            <FormRow>
              <FormField label="Nombre">
                <input name="nombre" required className={platformInputClass} />
              </FormField>
              <FormField label="Nivel">
                <select
                  name="nivel_jerarquia"
                  className={platformSelectClass}
                  defaultValue="1"
                >
                  <option value="1">1 — Líder principal</option>
                  <option value="2">2 — Coordinador</option>
                  <option value="3">3 — Base</option>
                </select>
              </FormField>
              <Button type="submit" variant="outline" className="h-10 shrink-0">
                Agregar
              </Button>
            </FormRow>
          </form>
          <DataTable
            data={rolesList}
            rowKey={(r) => r.id}
            emptyMessage="Sin roles."
            columns={[
              { key: "n", header: "Rol", cell: (r) => r.nombre },
              { key: "nv", header: "Nivel", cell: (r) => r.nivel_jerarquia },
            ]}
          />
        </Card>

        <Card title="Tipos de novedad">
          <form action={createTipoNovedadFormAction.bind(null, id)} className="mb-4">
            <FormRow>
              <FormField label="Descripción" className="flex-[2]">
                <input name="novedad" required className={platformInputClass} />
              </FormField>
              <Button type="submit" variant="outline" className="h-10 shrink-0">
                Agregar
              </Button>
            </FormRow>
          </form>
          <DataTable
            data={tiposList}
            rowKey={(t) => t.id}
            emptyMessage="Sin tipos de novedad."
            columns={[
              { key: "n", header: "Novedad", cell: (t) => t.novedad },
            ]}
          />
        </Card>
      </div>

      <Card title="Puestos de votación" description="Cupos H/M según registraduría.">
        <form action={createPuestoFormAction.bind(null, id)} className="mb-6">
          <FormRow className="flex-col items-stretch lg:flex-row lg:flex-wrap">
            <FormField label="Nombre">
              <input name="nombre" required className={platformInputClass} />
            </FormField>
            <FormField label="Municipio">
              <input name="municipio" className={platformInputClass} />
            </FormField>
            <FormField label="Dirección">
              <input name="direccion" className={platformInputClass} />
            </FormField>
            <FormField label="Código registraduría">
              <input name="codigo_registraduria" className={platformInputClass} />
            </FormField>
            <FormField label="Comuna">
              <select name="id_comuna" className={platformSelectClass} defaultValue="">
                <option value="">—</option>
                {comunasList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Cupos H">
              <input
                name="votantes_hombres_admite"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Cupos M">
              <input
                name="votantes_mujeres_admite"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <FormField label="Mesas">
              <input
                name="cantidad_mesas"
                type="number"
                min={0}
                defaultValue={0}
                className={platformInputClass}
              />
            </FormField>
            <Button type="submit" className="h-10 shrink-0 self-end">
              Agregar puesto
            </Button>
          </FormRow>
        </form>
        <DataTable
          data={puestosList}
          rowKey={(p) => p.id}
          emptyMessage="Sin puestos de votación."
          columns={[
            {
              key: "n",
              header: "Puesto",
              cell: (p) => (
                <span className="font-medium text-neutral-900">{p.nombre}</span>
              ),
            },
            {
              key: "mun",
              header: "Municipio",
              cell: (p) => p.municipio ?? "—",
            },
            {
              key: "h",
              header: "Cupos H",
              cell: (p) => p.votantes_hombres_admite,
            },
            {
              key: "m",
              header: "Cupos M",
              cell: (p) => p.votantes_mujeres_admite,
            },
            {
              key: "mesas",
              header: "Mesas",
              cell: (p) => p.cantidad_mesas,
            },
          ]}
        />
      </Card>
    </>
  );
}
