import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-none";
    
    const variants = {
      primary: "bg-[#E4002B] hover:bg-[#C10024] text-white focus:ring-[#E4002B]",
      secondary: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-800",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-400",
      danger: "bg-red-700 hover:bg-red-800 text-white focus:ring-red-600",
      ghost: "hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5",
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
