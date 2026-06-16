const DEFAULT_USERNAME_DOMAIN = "usuarios.campanas.local";

export function authUsernameDomain(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_USERNAME_DOMAIN?.trim().toLowerCase() ||
    DEFAULT_USERNAME_DOMAIN
  );
}

/** Convierte usuario o correo al identificador que usa Supabase Auth. */
export function resolveAuthEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed}@${authUsernameDomain()}`;
}

export function isEmailIdentifier(identifier: string): boolean {
  return identifier.trim().includes("@");
}

export function validateAuthIdentifier(identifier: string): string | null {
  const trimmed = identifier.trim();
  if (!trimmed) return "El usuario es obligatorio.";

  if (isEmailIdentifier(trimmed)) {
    const normalized = trimmed.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return "Correo no válido.";
    }
    return null;
  }

  const username = trimmed.toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
    return "Usuario: 3–32 caracteres; letras, números, punto, guion o guion bajo.";
  }
  return null;
}

export function authLoginFromMetadata(
  metadata: Record<string, unknown> | undefined
): string | null {
  if (typeof metadata?.nombre_usuario === "string" && metadata.nombre_usuario) {
    return metadata.nombre_usuario;
  }
  return null;
}

/** Texto legible para listados y modal de acceso (usuario corto o correo real). */
export function formatAuthLoginDisplay(
  email: string | null | undefined,
  metadata?: Record<string, unknown>
): string | null {
  const fromMeta = authLoginFromMetadata(metadata);
  if (fromMeta) return fromMeta;
  if (!email) return null;

  const suffix = `@${authUsernameDomain()}`;
  if (email.toLowerCase().endsWith(suffix)) {
    return email.slice(0, -suffix.length);
  }
  return email;
}

export function authIdentifierLabel(identifier: string): string {
  return isEmailIdentifier(identifier) ? "Correo" : "Usuario";
}
