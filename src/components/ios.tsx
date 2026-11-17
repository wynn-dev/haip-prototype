import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export { NavBar, Switch, Segmented, Stepper, Chips, CheckList } from "./ios-controls";

export function LargeTitle({ children, trailing, sub }: { children: React.ReactNode; trailing?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[-0.03em]">{children}</h1>
        {trailing && <div className="pb-1.5">{trailing}</div>}
      </div>
      {sub && <p className="mt-0.5 text-[15px] text-label-2">{sub}</p>}
    </div>
  );
}

/* ───────────── grouped lists ───────────── */

export function Section({
  header,
  footer,
  children,
  className,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-4", className)}>
      {header && <h2 className="section-header">{header}</h2>}
      <div className="group-list">{children}</div>
      {footer && <p className="section-footer">{footer}</p>}
    </section>
  );
}

type RowProps = {
  icon?: React.ElementType;
  iconBg?: string;
  label: React.ReactNode;
  detail?: React.ReactNode;
  value?: React.ReactNode;
  href?: string;
  download?: boolean;
  onClick?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  tint?: boolean;
  className?: string;
};

export function Row({ icon: Icon, iconBg, label, detail, value, href, download, onClick, chevron, destructive, tint, className }: RowProps) {
  const body = (
    <>
      {Icon && (
        <span className={cn("grid size-[29px] shrink-0 place-items-center rounded-[7px] text-white", iconBg ?? "bg-label-2")}>
          <Icon className="size-[17px]" strokeWidth={2.2} />
        </span>
      )}
      <span className={cn("min-w-0", value != null ? "shrink-0" : "flex-1")}>
        <span className={cn("block truncate", destructive && "text-red", tint && "text-tint")}>{label}</span>
        {detail && <span className="block truncate text-[13px] text-label-2">{detail}</span>}
      </span>
      {value != null && <span className="min-w-0 flex-1 truncate text-right text-label-2">{value}</span>}
      {(chevron ?? !!href) && <ChevronRight className="size-[18px] shrink-0 text-label-3" strokeWidth={2.5} />}
    </>
  );
  const cls = cn("flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left active:bg-fill", className);
  if (href && download) return <a href={href} download className={cls}>{body}</a>;
  if (href) return <Link href={href} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
  return <div className={cn(cls, "active:bg-transparent")}>{body}</div>;
}

/** A row that hosts a control (input, switch, stepper…). */
export function FieldRow({ label, children, className, stacked }: { label?: React.ReactNode; children: React.ReactNode; className?: string; stacked?: boolean }) {
  if (stacked)
    return (
      <div className={cn("flex flex-col gap-2.5 px-4 py-3", className)}>
        {label && <span className="text-[15px] text-label-2">{label}</span>}
        {children}
      </div>
    );
  return (
    <label className={cn("flex min-h-11 items-center gap-3 px-4 py-1.5", className)}>
      {label && <span className="shrink-0">{label}</span>}
      <span className="flex min-w-0 flex-1 justify-end">{children}</span>
    </label>
  );
}

export const inputCls =
  "h-11 w-full min-w-0 bg-transparent px-4 text-[17px] outline-none placeholder:text-label-3 [&::-webkit-date-and-time-value]:text-left";

export function BottomBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("sticky bottom-0 z-10 mt-auto bg-bg/85 px-4 pt-3 pb-safe backdrop-blur-xl", className)}>
      <div className="pb-2">{children}</div>
    </div>
  );
}
