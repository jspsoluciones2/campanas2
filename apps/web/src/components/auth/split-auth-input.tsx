import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SplitAuthInputProps = {
  id: string;
  name: string;
  type?: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  trailing?: React.ReactNode;
};

export function SplitAuthInput({
  id,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled,
  className,
  inputClassName,
  trailing,
}: SplitAuthInputProps) {
  return (
    <div
      className={cn(
        "login-split-input flex overflow-hidden rounded-md shadow-md shadow-black/15",
        className
      )}
    >
      <div className="login-icon-box flex w-12 shrink-0 items-center justify-center">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="relative min-w-0 flex-1">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "login-field h-11 w-full px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60",
            trailing && "pr-10",
            inputClassName
          )}
        />
        {trailing}
      </div>
    </div>
  );
}
