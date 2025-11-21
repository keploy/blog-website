"use client";

import * as React from "react";
import { cn } from "../../lib/utils/utils";

type CollapsibleContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(
  null
);

export function Collapsible({
  open,
  onOpenChange,
  className,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(!!open);

  React.useEffect(() => {
    if (open === undefined) return;
    setInternalOpen(open);
  }, [open]);

  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (open === undefined) setInternalOpen(v);
  };

  return (
    <CollapsibleContext.Provider value={{ open: internalOpen, setOpen }}>
      <div className={cn(className)}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      aria-expanded={ctx.open}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return null;
  return (
    <div 
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        ctx.open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        className
      )} 
      {...props}
    >
      <div className={cn(ctx.open ? "opacity-100" : "opacity-0")}>
        {children}
      </div>
    </div>
  );
}


