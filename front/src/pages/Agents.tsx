import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAgents } from "@/hooks/useBlockchain";
import { useIdentityStatus } from "@/hooks/useIdentity";
import apiClient from "@/lib/api";
import { motion } from "framer-motion";
import { Bot, Check, Eye, Loader2, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";

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

const strategies = [
  {
    id: "stable",
    name: "Stable Sentinel",
    risk: "Low Risk",
    description: "Conservative approach focusing on stable pairs",
  },
  {
    id: "volatility",
    name: "Volatility Arbiter",
    risk: "Medium Risk",
    description: "Capitalize on price volatility opportunities",
  },
  {
    id: "liquidity",
    name: "Liquidity Smith",
    risk: "High Risk",
    description: "Aggressive liquidity provision strategies",
  },
];

export default function Agents() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const {
    verified,
    trustScore,
    agentAddress: userAgentAddress,
  } = useIdentityStatus();
  const { data: agentsData, isLoading, refetch } = useAgents();

  // Form state
  const [agentName, setAgentName] = useState("");
  const [strategy, setStrategy] = useState("volatility");
  const [riskLevel, setRiskLevel] = useState([3]);
  const [allowLeverage, setAllowLeverage] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRunningStrategy, setIsRunningStrategy] = useState(false);

  const getRiskLabel = (level: number) => {
    const labels = ["Very Low", "Low", "Balanced", "High", "Very High"];
    return labels[level - 1] || "Balanced";
  };

  const handleDeploy = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    setIsDeploying(true);
    try {
      const timestamp = Date.now();
      const message = `SynergyAI Agent Deployment\n\nI authorize the deployment of my autonomous agent.\n\nAgent Name: ${agentName}\nStrategy: ${strategy}\nRisk Level: ${riskLevel[0]}\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

      toast.info("Please sign the message in your wallet...");
      const signature = await signMessageAsync({ message });

      const response = await apiClient.post("/identity/complete", {
        walletAddress: address,
        signature,
        message,
      });

      if (response.data.verified) {
        toast.success(`Agent "${agentName}" deployed successfully!`);
        refetch();
        setAgentName("");
      }
    } catch (error: any) {
      if (error.message?.includes("rejected")) {
        toast.error("Signature rejected - deployment cancelled");
      } else if (error.response?.data?.error?.includes("already")) {
        toast.info("You already have an agent registered!");
      } else {
        toast.error(
          error.response?.data?.error || error.message || "Deployment failed"
        );
      }
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRunStrategy = async (agentAddr: string) => {
    setIsRunningStrategy(true);
    try {
      toast.info("Executing strategy...");
      const response = await apiClient.post(
        `/agents/${agentAddr}/strategies/eth-dip-buyer/run`,
        {
          params: {
            targetToken: "WETH",
            dipThreshold: 5,
            maxBuyAmount: "0.01",
          },
        }
      );
      toast.success(response.data.message || "Strategy executed!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Strategy execution failed");
    } finally {
      setIsRunningStrategy(false);
    }
  };

  const agents = agentsData?.agents || [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold mb-2">Agent Foundry</h1>
          <p className="text-muted-foreground">
            Forge, configure, and supervise your autonomous liquidity agents.
          </p>
        </motion.div>

        {/* Create Agent Card */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Create Agent</h2>
            </div>

            {userAgentAddress ? (
              <div className="text-center py-6">
                <Check className="w-12 h-12 mx-auto mb-4 text-success" />
                <p className="text-lg font-medium text-success mb-2">
                  Agent Already Deployed
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your agent is active at {userAgentAddress.slice(0, 10)}...
                  {userAgentAddress.slice(-8)}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/agents/${userAgentAddress}`)}
                  className="glow-cyan"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Agent Details
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="agent-name"
                        className="text-sm font-medium mb-2 block"
                      >
                        Agent Name
                      </Label>
                      <Input
                        id="agent-name"
                        placeholder="Enter agent name..."
                        className="glass"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="strategy"
                        className="text-sm font-medium mb-2 block"
                      >
                        Strategy Preset
                      </Label>
                      <Select value={strategy} onValueChange={setStrategy}>
                        <SelectTrigger id="strategy" className="glass">
                          <SelectValue placeholder="Select strategy..." />
                        </SelectTrigger>
                        <SelectContent>
                          {strategies.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.risk})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {strategies.find((s) => s.id === strategy)?.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Risk Level:{" "}
                        <span className="text-primary">{riskLevel[0]}</span> -{" "}
                        <span className="text-muted-foreground">
                          {getRiskLabel(riskLevel[0])}
                        </span>
                      </Label>
                      <Slider
                        value={riskLevel}
                        onValueChange={setRiskLevel}
                        max={5}
                        min={1}
                        step={1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Capital Preservation</span>
                        <span>Max Aggression</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                      <Label htmlFor="leverage" className="text-sm">
                        Allow leveraged strategies (advanced)
                      </Label>
                      <Switch
                        id="leverage"
                        checked={allowLeverage}
                        onCheckedChange={setAllowLeverage}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 glow-purple"
                  size="lg"
                  onClick={handleDeploy}
                  disabled={!isConnected || isDeploying || !agentName.trim()}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying Agent...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Connect Wallet to Deploy
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Deploy Agent
                    </>
                  )}
                </Button>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Agent List */}
        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Active Agents</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent: any) => {
                const isUserAgent =
                  agent.humanAddress?.toLowerCase() === address?.toLowerCase();
                return (
                  <GlassCard key={agent.agentAddress} className="hover-glitch">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">
                          {isUserAgent ? "🤖" : "🔮"}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {isUserAgent ? "Your Agent" : `Agent`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">
                              {agent.agentAddress.slice(0, 8)}...
                              {agent.agentAddress.slice(-6)}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              Trust: {agent.trustScore?.toFixed(1) || "0.0"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 border-success text-success"
                            >
                              <Check className="w-3 h-3" />
                              Verified
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Registered:{" "}
                            {new Date(agent.registeredAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            Status
                          </div>
                          <StatusBadge status="success">Active</StatusBadge>
                        </div>
                        <div className="flex gap-2">
                          {isUserAgent && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="glow-cyan"
                              onClick={() =>
                                handleRunStrategy(agent.agentAddress)
                              }
                              disabled={isRunningStrategy}
                            >
                              {isRunningStrategy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-1" />
                                  Run Strategy
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="outline"
                            className="hover-glitch"
                            onClick={() =>
                              navigate(`/agents/${agent.agentAddress}`)
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : userAgentAddress ? (
            <GlassCard className="hover-glitch">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{verified ? "🤖" : "⚠️"}</div>
                  <div>
                    <h3 className="font-bold text-lg">Your Agent</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {userAgentAddress.slice(0, 8)}...
                        {userAgentAddress.slice(-6)}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        Trust:{" "}
                        {trustScore ? (trustScore / 10).toFixed(1) : "0.0"}
                      </Badge>
                      {verified && (
                        <Badge
                          variant="outline"
                          className="text-xs gap-1 border-success text-success"
                        >
                          <Check className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Status
                    </div>
                    <StatusBadge status={verified ? "success" : "warning"}>
                      {verified ? "Active" : "Setup Required"}
                    </StatusBadge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="glow-cyan"
                      onClick={() => handleRunStrategy(userAgentAddress)}
                      disabled={isRunningStrategy}
                    >
                      {isRunningStrategy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" />
                          Run Strategy
                        </>
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover-glitch"
                      onClick={() => navigate(`/agents/${userAgentAddress}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {address
                    ? "Deploy your first agent above"
                    : "Connect wallet to get started"}
                </p>
                {address && !verified && (
                  <Button
                    onClick={() => navigate("/identity")}
                    variant="outline"
                    className="glow-cyan"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Identity First
                  </Button>
                )}
              </div>
            </GlassCard>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
