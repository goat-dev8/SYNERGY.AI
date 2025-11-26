import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIdentityStatus } from "@/hooks/useIdentity";
import { Menu, Shield } from "lucide-react";
import { useAccount } from "wagmi";

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { chain } = useAccount();
  const { verified, trustScore } = useIdentityStatus();

  return (
    <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 glass">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Network Indicator */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono">{chain?.name || "Katana"}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs font-mono text-muted-foreground">
            {chain?.id || 747474}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Identity Status */}
        <Badge
          variant="outline"
          className={`hidden sm:flex gap-2 px-3 py-1.5 ${
            verified
              ? "border-success/50 text-success hover:bg-success/10"
              : "border-destructive/50 text-destructive hover:bg-destructive/10"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">
            {verified
              ? `Verified (${(trustScore / 10).toFixed(1)})`
              : "Unverified Human"}
          </span>
        </Badge>

        {/* Wallet Connect */}
        <ConnectWalletButton />
      </div>
    </header>
  );
};
