import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong";
}

export const GlassCard = ({ children, className, variant = "default" }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl p-6",
        variant === "default" ? "glass" : "glass-strong",
        className
      )}
    >
      {children}
    </div>
  );
};
