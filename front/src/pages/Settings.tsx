import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Network, Shield, Code, Info } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Settings() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold mb-2">Control Room</h1>
          <p className="text-muted-foreground">
            Configure network, risk parameters, and developer settings.
          </p>
        </motion.div>

        {/* Network & RPC */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Network className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Network & RPC</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rpc-url" className="text-sm font-medium mb-2 block">
                  Current Katana RPC URL
                </Label>
                <Input
                  id="rpc-url"
                  value="https://rpc.katana.so"
                  className="font-mono glass"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="chain-id" className="text-sm font-medium mb-2 block">
                  Chain ID
                </Label>
                <Input
                  id="chain-id"
                  value="747474"
                  className="font-mono glass"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">Network Status</span>
                </div>
                <span className="text-sm font-mono text-success">Connected</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Risk & Safeguards */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-bold">Risk & Safeguards</h2>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Global Max Drawdown Limit: <span className="text-destructive">-25%</span>
                </Label>
                <Slider
                  defaultValue={[25]}
                  max={50}
                  min={5}
                  step={5}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  All agents will pause if total portfolio drops below this threshold
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div>
                  <Label htmlFor="manual-approval" className="text-sm font-medium">
                    Require manual approval above $5,000 trade size
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Large trades will wait for your confirmation
                  </p>
                </div>
                <Switch id="manual-approval" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div>
                  <Label htmlFor="auto-pause" className="text-sm font-medium">
                    Auto-pause agents during high volatility
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Protect capital when market conditions are unstable
                  </p>
                </div>
                <Switch id="auto-pause" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Developer Settings */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-bold">Developer Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backend-url" className="text-sm font-medium mb-2 block">
                  Agent Backend URL
                </Label>
                <Input
                  id="backend-url"
                  placeholder="https://api.synergyai.xyz"
                  className="font-mono glass"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Custom backend endpoint for agent execution (leave empty for default)
                </p>
              </div>

              <div>
                <Label htmlFor="webhook" className="text-sm font-medium mb-2 block">
                  Webhook Endpoint
                </Label>
                <Input
                  id="webhook"
                  placeholder="https://yourdomain.com/webhook"
                  className="font-mono glass"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Receive real-time notifications about agent activity
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                <div>
                  <Label htmlFor="debug-mode" className="text-sm font-medium">
                    Enable Debug Mode
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show detailed logs and agent decision reasoning
                  </p>
                </div>
                <Switch id="debug-mode" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* About */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-xl font-bold">About SynergyAI</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              SynergyAI is a sovereign agentic liquidity protocol that unifies Privado ID zero-knowledge identity, 
              GOAT SDK autonomous agents, and Katana's deep liquidity infrastructure. Our mission is to enable 
              verified humans to deploy trustless AI agents that execute DeFi strategies with institutional-grade 
              execution and full transparency.
            </p>
            <Button variant="outline" className="gap-2">
              Read Documentation
            </Button>
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="glow-purple">Save Changes</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
