import { cn } from "@/lib/utils";

export function FdsMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-black text-[10px] font-black text-primary electric-glow",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-1 rounded-full border border-white/10" />
      <span className="absolute inset-2 rounded-full bg-primary/10 blur-sm" />
      <span className="relative">FDS</span>
    </span>
  );
}

export function FdsLogo({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-display font-extrabold", className)}>
      <FdsMark />
      {showName ? <span>FDS Academy</span> : null}
    </span>
  );
}
