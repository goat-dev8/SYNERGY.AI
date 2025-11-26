import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Bot,
  Droplets,
  Fingerprint,
  Activity,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agents", icon: Bot, label: "Agents" },
  { to: "/liquidity", icon: Droplets, label: "Liquidity" },
  { to: "/identity", icon: Fingerprint, label: "Identity" },
  { to: "/activity", icon: Activity, label: "Activity" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Logo */}
      <NavLink to="/" className="mb-12 flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
        <div>
          <div className="text-xl font-bold tracking-wider">SYNERGY</div>
          <div className="text-xs text-secondary tracking-widest">.AI</div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-white/5 hover-glitch"
            )}
            activeClassName="bg-white/10 text-foreground border border-primary/30 glow-purple"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-border/50">
        <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest space-y-1">
          <div>Powered by</div>
          <div className="flex flex-wrap gap-2">
            <span className="text-primary">Polygon</span>
            <span>•</span>
            <span className="text-secondary">Katana</span>
            <span>•</span>
            <span className="text-success">Privado ID</span>
            <span>•</span>
            <span className="text-warning">GOAT SDK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
