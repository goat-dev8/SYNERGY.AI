import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePools } from "@/hooks/useBlockchain";
import { motion } from "framer-motion";
import { Droplets, Loader2, Search, TrendingUp } from "lucide-react";

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

export default function Liquidity() {
  const { data: poolsResponse, isLoading } = usePools();
  const poolsList = poolsResponse?.pools || [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold mb-2">Liquidity Terminal</h1>
          <p className="text-muted-foreground">
            Visualize Katana pools and SynergyAI's footprint across unified
            liquidity.
          </p>
        </motion.div>

        <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pools by token..."
                className="pl-10 glass"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Filter by APY
            </Button>
            <Button variant="outline" className="flex-1">
              Pool Type
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Pool Table */}
          <motion.div variants={item} className="lg:col-span-8 space-y-4">
            <GlassCard>
              <h2 className="text-lg font-bold mb-4">Available Pools</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : poolsList.length > 0 ? (
                <div className="space-y-3">
                  {poolsList.map((pool: any) => (
                    <div
                      key={pool.name || pool.address}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-all hover-glitch"
                    >
                      <div className="flex items-center gap-3 mb-3 md:mb-0">
                        <Droplets className="w-5 h-5 text-secondary" />
                        <div>
                          <div className="font-bold">{pool.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Katana Pool
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            TVL
                          </div>
                          <div className="font-mono font-bold">
                            $
                            {pool.tvl
                              ? parseFloat(pool.tvl).toLocaleString()
                              : "0"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            Est. APY
                          </div>
                          <div className="font-mono font-bold text-success">
                            {pool.apy || "0"}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            Your Exposure
                          </div>
                          <div className="font-mono font-bold text-primary">
                            ${pool.exposure || "0"}
                          </div>
                        </div>
                        <Button size="sm" className="glow-cyan hover-glitch">
                          Route Liquidity
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Droplets className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Pool data will be available when connected to Katana DEXs
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Analytics Panel */}
          <motion.div variants={item} className="lg:col-span-4 space-y-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Unified Liquidity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                SynergyAI taps into Polygon's AggLayer, routing your agents
                across multiple liquidity sources for optimal execution.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Liquidity</span>
                  <span className="font-mono font-bold">
                    $
                    {poolsList.length > 0
                      ? poolsList
                          .reduce(
                            (acc: number, p: any) =>
                              acc + (parseFloat(p.tvl) || 0),
                            0
                          )
                          .toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Pools</span>
                  <span className="font-mono font-bold">
                    {poolsList.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Slippage</span>
                  <span className="font-mono font-bold text-success">N/A</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-bold mb-4">Network Diagram</h3>
              <div className="aspect-square rounded-lg bg-muted/20 border border-border/50 flex items-center justify-center">
                <div className="text-center text-muted-foreground text-sm">
                  <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div>Network visualization</div>
                  <div className="text-xs">Coming soon</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
