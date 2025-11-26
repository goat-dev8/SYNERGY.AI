import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  FileJson,
  Loader2,
  Play,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// TODO: Wire real data
const pnlData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  pnl: Math.random() * 1000 - 200,
}));

const transactions = [
  {
    hash: "0x7a3f...92bc",
    action: "Swap",
    pair: "USDC → WETH",
    status: "Success",
  },
  {
    hash: "0x9c1e...45df",
    action: "Add LP",
    pair: "WETH-USDC",
    status: "Success",
  },
  {
    hash: "0x2b8a...78ee",
    action: "Remove LP",
    pair: "WETH-KAT",
    status: "Pending",
  },
  {
    hash: "0x5d4c...31ab",
    action: "Swap",
    pair: "KAT → USDC",
    status: "Success",
  },
];

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [executing, setExecuting] = useState(false);
  const [amountIn, setAmountIn] = useState("");
  const [maxEthPrice, setMaxEthPrice] = useState("");

  const executeStrategy = async () => {
    if (!amountIn || !maxEthPrice) {
      toast({
        title: "Missing Parameters",
        description: "Please enter both amount and max ETH price",
        variant: "destructive",
      });
      return;
    }

    try {
      setExecuting(true);
      const response = await apiClient.post(
        `/agents/${id}/strategies/simple-eth-dip-buyer/run`,
        {
          amountIn: parseFloat(amountIn),
          maxEthPriceUsd: parseFloat(maxEthPrice),
        }
      );

      if (response.data.executed) {
        toast({
          title: "Strategy Executed",
          description: `Transaction: ${response.data.txHash?.slice(0, 10)}...`,
        });
      } else {
        toast({
          title: "Strategy Skipped",
          description: response.data.reason,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/agents")}
            className="hover-glitch"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤖</span>
              <div>
                <h1 className="text-3xl font-bold">Alpha Sentinel</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    Agent ID: {id}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    Trust: 0.85
                  </Badge>
                  <StatusBadge status="hunting">Hunting Yield</StatusBadge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 hover-glitch">
              <Settings className="w-4 h-4" />
              Adjust Strategy
            </Button>
            <Button variant="outline" className="gap-2 hover-glitch">
              <FileJson className="w-4 h-4" />
              Download Profile
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="brain">Brain</TabsTrigger>
            <TabsTrigger value="footprint">On-Chain Footprint</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <GlassCard>
                <div className="text-sm text-muted-foreground mb-1">
                  Deployed Capital
                </div>
                <div className="text-3xl font-bold font-mono">$24,582.14</div>
              </GlassCard>
              <GlassCard>
                <div className="text-sm text-muted-foreground mb-1">
                  Lifetime Volume
                </div>
                <div className="text-3xl font-bold font-mono">$1.2M</div>
              </GlassCard>
              <GlassCard>
                <div className="text-sm text-muted-foreground mb-1">
                  Sharpe-ish Score
                </div>
                <div className="text-3xl font-bold font-mono text-success">
                  2.34
                </div>
              </GlassCard>
            </div>

            {/* Strategy Execution Card */}
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">
                  Execute Strategy: ETH Dip Buyer
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Buy ETH when price drops below threshold. Uses vbUSDC from agent
                wallet and swaps on Sushi.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label
                    htmlFor="amountIn"
                    className="text-sm font-medium mb-2 block"
                  >
                    Amount In (vbUSDC)
                  </Label>
                  <Input
                    id="amountIn"
                    type="number"
                    placeholder="1000"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="glass"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="maxEthPrice"
                    className="text-sm font-medium mb-2 block"
                  >
                    Max ETH Price (USD)
                  </Label>
                  <Input
                    id="maxEthPrice"
                    type="number"
                    placeholder="3500"
                    value={maxEthPrice}
                    onChange={(e) => setMaxEthPrice(e.target.value)}
                    className="glass"
                  />
                </div>
              </div>

              <Button
                onClick={executeStrategy}
                disabled={executing || !amountIn || !maxEthPrice}
                className="w-full glow-purple"
                size="lg"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing Strategy...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Strategy
                  </>
                )}
              </Button>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-bold mb-4">PnL Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="brain" className="space-y-6 mt-6">
            <GlassCard>
              <h3 className="text-lg font-bold mb-6">
                Current Strategy Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Target Tokens
                  </Label>
                  <div className="flex gap-2">
                    <Badge variant="outline">USDC</Badge>
                    <Badge variant="outline">WETH</Badge>
                    <Badge variant="outline">KAT</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Min APY Threshold:{" "}
                    <span className="text-primary">8.5%</span>
                  </Label>
                  <Slider
                    defaultValue={[8.5]}
                    max={20}
                    min={1}
                    step={0.5}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Max Slippage Tolerance:{" "}
                    <span className="text-warning">2.0%</span>
                  </Label>
                  <Slider
                    defaultValue={[2.0]}
                    max={5}
                    min={0.1}
                    step={0.1}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Stop Loss: <span className="text-destructive">-15%</span>
                  </Label>
                  <Slider
                    defaultValue={[15]}
                    max={50}
                    min={5}
                    step={5}
                    className="py-4"
                  />
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="footprint" className="space-y-6 mt-6">
            <GlassCard>
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-sm font-mono">{tx.hash}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.action} • {tx.pair}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        tx.status === "Success"
                          ? "border-success text-success"
                          : "border-warning text-warning"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
