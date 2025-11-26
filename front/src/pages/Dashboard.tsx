import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAgentWallet,
  usePortfolio,
  useWave3Metrics,
} from "@/hooks/useBlockchain";
import { useIdentityStatus } from "@/hooks/useIdentity";
import { motion } from "framer-motion";
import { Activity, Fingerprint, Loader2, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useAccount } from "wagmi";

const mockData = Array.from({ length: 20 }, (_, i) => ({
  value: Math.random() * 100 + 50,
}));

const logs = [
  {
    time: "14:23:45",
    level: "INFO",
    msg: "Scanning Katana pools for vbUSDC → WETH",
  },
  {
    time: "14:23:47",
    level: "ACTION",
    msg: "APY spike detected on Pool #7 (12.3% est.)",
  },
  {
    time: "14:23:49",
    level: "ACTION",
    msg: "Swap executed: 1,200 vbUSDC → 0.43 WETH",
  },
  {
    time: "14:23:52",
    level: "INFO",
    msg: "Position updated: +$18.42 PnL (24h)",
  },
  {
    time: "14:24:01",
    level: "ALERT",
    msg: "Slippage threshold exceeded on Pool #3, skipping",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { address } = useAccount();
  const { verified, trustScore } = useIdentityStatus();
  const { data: agentAddress } = useAgentWallet(address);
  const { data: portfolio, isLoading: portfolioLoading } =
    usePortfolio(agentAddress);
  const { data: wave3Metrics } = useWave3Metrics();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.h1 variants={item} className="text-3xl font-bold mb-8">
          Command Center
        </motion.h1>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Identity & Session */}
          <motion.div variants={item} className="lg:col-span-3 space-y-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-destructive" />
                <h2 className="text-lg font-bold">Sovereign Identity</h2>
              </div>

              <StatusBadge
                status={verified ? "success" : "error"}
                className="mb-4"
              >
                {verified ? "Verified Human" : "Unverified Human"}
              </StatusBadge>

              <p className="text-sm text-muted-foreground mb-6">
                {verified
                  ? "Your agent is linked to your verified identity."
                  : "Your agent needs proof you're real. Link your Privado ID to unlock high-trust vaults."}
              </p>

              {!verified && (
                <Button
                  asChild
                  className="w-full gap-2 glow-cyan"
                  variant="outline"
                >
                  <Link to="/identity">
                    <Fingerprint className="w-4 h-4" />
                    Verify with Privado ID
                  </Link>
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trust Score</span>
                  <span
                    className={`font-mono font-medium ${
                      verified ? "text-success" : "text-destructive"
                    }`}
                  >
                    {trustScore ? (trustScore / 10).toFixed(1) : "0.0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sybil Risk</span>
                  <span
                    className={`font-mono font-medium ${
                      verified ? "text-success" : "text-warning"
                    }`}
                  >
                    {verified ? "LOW" : "HIGH"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agent Wallet</span>
                  <span className="font-mono font-medium text-xs">
                    {agentAddress
                      ? `${agentAddress.slice(0, 6)}...${agentAddress.slice(
                          -4
                        )}`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Center Column - Live Agent Feed */}
          <motion.div variants={item} className="lg:col-span-6 space-y-6">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Agent Live Feed</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    Execution Log
                  </Badge>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 font-mono text-xs space-y-2 h-[400px] overflow-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {log.time}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        log.level === "INFO"
                          ? "border-muted text-muted-foreground"
                          : log.level === "ACTION"
                          ? "border-success text-success"
                          : "border-warning text-warning"
                      }`}
                    >
                      {log.level}
                    </Badge>
                    <span className="text-foreground/90">{log.msg}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Strategy Decisions
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Security & Identity
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right Column - Portfolio & Metrics */}
          <motion.div variants={item} className="lg:col-span-3 space-y-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Agentic Vault</h2>
              </div>

              {portfolioLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : portfolio?.tokens && portfolio.tokens.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.tokens.map((token: any) => {
                    const balance = parseFloat(token.balance || "0");
                    const hasBalance = balance > 0;
                    return (
                      <div
                        key={token.symbol}
                        className="flex items-center justify-between pb-4 border-b border-border/30 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-bold text-sm">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {hasBalance
                              ? parseFloat(token.balance).toFixed(6)
                              : "0.00"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-medium text-muted-foreground">
                            ${token.valueUsd?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                        <div className="w-16 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {agentAddress
                    ? "No tokens in vault"
                    : "Connect wallet to view portfolio"}
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider">
                Wave 3 Metrics
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Verified Agents Deployed
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {wave3Metrics?.verifiedAgents ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Volume Routed
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    $
                    {wave3Metrics?.totalVolume
                      ? parseFloat(wave3Metrics.totalVolume).toLocaleString()
                      : "0.00"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Average Trust Score
                  </div>
                  <div className="text-2xl font-bold font-mono text-muted">
                    {wave3Metrics?.averageTrustScore
                      ? (wave3Metrics.averageTrustScore / 10).toFixed(1)
                      : "N/A"}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
