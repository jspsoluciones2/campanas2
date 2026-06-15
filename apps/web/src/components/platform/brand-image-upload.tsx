"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  removeBrandAssetAction,
  uploadBrandAssetAction,
} from "@/app/(platform)/platform/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandAssetKind } from "@/lib/platform/brand-assets";

type BrandImageUploadProps = {
  kind: BrandAssetKind;
  label: string;
  hint: string;
  currentUrl: string;
  onChange: (url: string) => void;
  variant?: "logo" | "favicon";
};

export function BrandImageUpload({
  kind,
  label,
  hint,
  currentUrl,
  onChange,
  variant = kind,
}: BrandImageUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [removing, startRemove] = useTransition();

  const isLogo = variant === "logo";
  const previewSize = isLogo ? "size-24" : "size-14";
  const hasImage = Boolean(currentUrl.trim());

  const processFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    startUpload(async () => {
      const formData = new FormData();
      formData.append("asset_type", kind);
      formData.append("file", file);

      const result = await uploadBrandAssetAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.url) {
        onChange(result.url);
        router.refresh();
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startRemove(async () => {
      const result = await removeBrandAssetAction(kind);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onChange("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-neutral-500 bg-neutral-50"
            : "border-neutral-200 bg-neutral-50/60 hover:border-neutral-300",
          uploading && "pointer-events-none opacity-70"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={
            kind === "logo"
              ? "image/png,image/jpeg,image/webp,image/svg+xml"
              : "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico"
          }
          className="sr-only"
          onChange={(e) => processFile(e.target.files?.[0])}
        />

        {hasImage ? (
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm",
              previewSize
            )}
          >
            <Image
              src={currentUrl}
              alt=""
              width={isLogo ? 96 : 56}
              height={isLogo ? 96 : 56}
              className="max-h-full max-w-full object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm",
              previewSize
            )}
          >
            <ImagePlus className={isLogo ? "size-10" : "size-6"} />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-neutral-700">
            Arrastra tu {kind === "logo" ? "logo" : "favicon"} aquí
          </p>
          <p className="mt-1 text-xs text-neutral-500">{hint}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
            className="h-10 gap-2 px-5"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {hasImage ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          {hasImage ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading || removing}
              className="h-10 gap-2 px-5"
            >
              <Trash2 className="size-4" />
              Quitar
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
