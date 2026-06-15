"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type PasswordRevealModalProps = {
  open: boolean;
  title: string;
  nombre: string;
  email: string;
  password: string;
  onClose: () => void;
};

export function PasswordRevealModal({
  open,
  title,
  nombre,
  email,
  password,
  onClose,
}: PasswordRevealModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const copyAccess = async () => {
    try {
      await navigator.clipboard.writeText(
        `Usuario: ${email}\nContraseña: ${password}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-[1px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 bg-neutral-50/80 px-6 py-4">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="mt-0.5 text-sm text-neutral-500">{nombre}</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Usuario
              </p>
              <p className="mt-1 break-all text-sm font-medium text-neutral-900">
                {email}
              </p>
            </div>
            <div className="border-t border-neutral-200 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Contraseña
              </p>
              <p className="mt-1 rounded-md border border-neutral-200 bg-white px-3 py-2 font-mono text-base tracking-wide text-neutral-900">
                {password}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>
              Guárdala ahora y compártela con el cliente. Por seguridad no se
              puede volver a consultar; si la olvida, usa{" "}
              <strong>Restablecer</strong> en el listado.
            </p>
            <p className="mt-2 text-xs text-amber-800/90">
              El cliente deberá cambiarla al iniciar sesión.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 px-6"
              onClick={copyAccess}
            >
              {copied ? "Copiado" : "Copiar acceso"}
            </Button>
            <Button
              type="button"
              className="h-10 shrink-0 px-6"
              onClick={onClose}
            >
              Entendido
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
