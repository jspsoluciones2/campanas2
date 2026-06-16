"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { platformButtonClass } from "@/components/platform/platform-ui";

const storageKey = (campaignId: string) =>
  `campaign-${campaignId}-from-gestion`;

type CampaignGestionBackProps = {
  campaignId: string;
  isPlatformOwner: boolean;
};

export function CampaignGestionBack({
  campaignId,
  isPlatformOwner,
}: CampaignGestionBackProps) {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("from") === "gestion") {
      try {
        sessionStorage.setItem(storageKey(campaignId), "1");
      } catch {
        /* ignore */
      }
    }

    try {
      const fromGestion =
        searchParams.get("from") === "gestion" ||
        sessionStorage.getItem(storageKey(campaignId)) === "1";
      setVisible(isPlatformOwner || fromGestion);
    } catch {
      setVisible(isPlatformOwner);
    }
  }, [searchParams, campaignId, isPlatformOwner]);

  if (!visible) return null;

  return (
    <div className="absolute right-0 top-0 z-10">
      <Link href="/platform/campaigns" className={`${platformButtonClass} gap-2`}>
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Volver
      </Link>
    </div>
  );
}
