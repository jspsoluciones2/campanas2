import Image from "next/image";
import { Megaphone } from "lucide-react";
import type { LoginBrandConfig } from "@/lib/config/login-brand";

type LoginBrandLogoProps = {
  config: LoginBrandConfig;
};

export function LoginBrandLogo({ config }: LoginBrandLogoProps) {
  return (
    <div className="login-logo-ring mx-auto flex size-[88px] items-center justify-center rounded-full bg-white shadow-lg shadow-black/20">
      {config.logoUrl ? (
        <Image
          src={config.logoUrl}
          alt={config.logoAlt}
          width={72}
          height={72}
          className="size-[4.5rem] object-contain p-1"
          priority
        />
      ) : (
        <div
          className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
          title="Logo configurable — NEXT_PUBLIC_LOGIN_LOGO_URL"
        >
          <Megaphone className="size-8" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
