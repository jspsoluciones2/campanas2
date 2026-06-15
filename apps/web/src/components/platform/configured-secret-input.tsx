import { platformInputClass } from "@/components/platform/platform-ui";

export function ConfiguredSecretInput({
  name,
  configured,
  placeholder = "",
  className = platformInputClass,
}: {
  name: string;
  configured: boolean;
  placeholder?: string;
  className?: string;
}) {
  if (configured) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-neutral-700">
          <span className="font-medium text-neutral-900">Guardado</span>
          <span className="ml-2 font-mono tracking-widest text-neutral-500">
            ••••••••
          </span>
        </p>
        <input
          name={name}
          type="password"
          placeholder="Pega el token aquí solo para cambiarlo"
          autoComplete="off"
          className={className}
        />
      </div>
    );
  }

  return (
    <input
      name={name}
      type="password"
      required
      placeholder={placeholder}
      autoComplete="off"
      className={className}
    />
  );
}
