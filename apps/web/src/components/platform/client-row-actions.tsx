"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";
import {
  deleteClientAction,
  resetClientPasswordAction,
  updateClientFormAction,
} from "@/app/(platform)/platform/actions";
import { PasswordRevealModal } from "@/components/platform/password-reveal-modal";
import {
  FormField,
  FormRow,
  platformInputClass,
} from "@/components/platform/platform-ui";

export type ClienteRow = {
  id: number;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  correo_contacto: string | null;
  id_usuario: string | null;
};

export function ClientRowActions({ cliente }: { cliente: ClienteRow }) {
  const [editing, setEditing] = useState(false);
  const mounted = useIsClient();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [reveal, setReveal] = useState<{
    nombre: string;
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [editing]);

  const closeEdit = () => setEditing(false);

  const handleDelete = () => {
    const ok = window.confirm(
      `¿Eliminar al cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteClientAction(cliente.id);
      if (result?.error) {
        window.alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleResetPassword = () => {
    const ok = window.confirm(
      `¿Generar una contraseña temporal nueva para "${cliente.nombre}"? El cliente deberá cambiarla al entrar.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await resetClientPasswordAction(cliente.id);
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      if (
        result?.ok &&
        result.tempPassword &&
        result.email &&
        result.nombre
      ) {
        setReveal({
          nombre: result.nombre,
          email: result.email,
          password: result.tempPassword,
        });
      }
    });
  };

  const editModal =
    editing && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEdit();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`edit-client-${cliente.id}`}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                action={async (formData) => {
                  await updateClientFormAction(formData);
                  closeEdit();
                  router.refresh();
                }}
                className="p-6"
              >
                <input type="hidden" name="id" value={cliente.id} />
                <h3
                  id={`edit-client-${cliente.id}`}
                  className="text-base font-semibold text-neutral-900"
                >
                  Editar cliente
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{cliente.nombre}</p>

                <div className="mt-5 space-y-3">
                  <FormField label="Nombre">
                    <input
                      name="nombre"
                      defaultValue={cliente.nombre}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  <FormRow>
                    <FormField label="Documento">
                      <input
                        name="documento"
                        defaultValue={cliente.documento ?? ""}
                        className={platformInputClass}
                      />
                    </FormField>
                    <FormField label="Teléfono">
                      <input
                        name="telefono"
                        defaultValue={cliente.telefono ?? ""}
                        className={platformInputClass}
                      />
                    </FormField>
                  </FormRow>
                  <FormField label="Correo de contacto">
                    <input
                      name="correo_contacto"
                      type="email"
                      defaultValue={cliente.correo_contacto ?? ""}
                      required
                      className={platformInputClass}
                    />
                  </FormField>
                  {!cliente.id_usuario ? (
                    <FormField label="Contraseña inicial">
                      <input
                        name="contrasena_inicial"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                        autoComplete="new-password"
                        required
                        className={platformInputClass}
                      />
                    </FormField>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Para una contraseña nueva usa el botón{" "}
                      <strong>Restablecer</strong> en el listado.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 px-6"
                    onClick={closeEdit}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="h-10 shrink-0 px-6">
                    Guardar
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className="h-10 shrink-0 px-6"
        >
          Editar
        </Button>
        {cliente.id_usuario ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleResetPassword}
            disabled={pending}
            className="h-10 shrink-0 px-6"
          >
            Restablecer
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          disabled={pending}
          className="h-10 shrink-0 px-6"
        >
          Eliminar
        </Button>
      </div>
      {editModal}
      <PasswordRevealModal
        open={Boolean(reveal)}
        title="Contraseña temporal — guárdala ahora"
        nombre={reveal?.nombre ?? ""}
        email={reveal?.email ?? ""}
        password={reveal?.password ?? ""}
        onClose={() => setReveal(null)}
      />
    </>
  );
}
