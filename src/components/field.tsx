import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="rounded-xl border-2 border-brick bg-brick/10 px-3 py-2 text-sm font-medium text-brick">
      {msg}
    </p>
  );
}
