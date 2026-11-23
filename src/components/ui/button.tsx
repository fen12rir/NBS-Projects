import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
    
    const variants = {
      primary: "bg-[#E4002B] hover:bg-[#C10024] text-white shadow-xs hover:shadow-sm focus:ring-[#E4002B]/40",
      secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-xs focus:ring-slate-700",
      outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-2xs focus:ring-slate-300",
      danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500",
      ghost: "hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
