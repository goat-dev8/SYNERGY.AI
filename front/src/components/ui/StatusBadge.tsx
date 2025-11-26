import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "idle" | "active" | "hunting" | "paused" | "error";
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  idle: "bg-muted/50 text-muted-foreground border-border",
  active: "bg-success/20 text-success border-success/50",
  hunting: "bg-primary/20 text-primary border-primary/50 animate-pulse",
  paused: "bg-warning/20 text-warning border-warning/50",
  error: "bg-destructive/20 text-destructive border-destructive/50",
};

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], "uppercase text-[10px] font-mono tracking-wider", className)}>
      {children}
    </Badge>
  );
};
