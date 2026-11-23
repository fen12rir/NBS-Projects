import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "secondary";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#E4002B]/10 text-[#E4002B] border border-[#E4002B]/20",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/80",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200/80",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
