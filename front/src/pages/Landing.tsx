import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Bot,
  Coins,
  Fingerprint,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Code,
  BarChart3,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Animated Nebula Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 nebula-bg opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 nebula-bg opacity-20" style={{ animationDelay: "2s" }} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          {/* 3D Orb Placeholder */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mx-auto mb-12 w-64 h-64 rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-primary/30 blur-2xl pulse-glow"
          >
            {/* TODO: Replace with Three.js 3D orb scene */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-xs text-secondary uppercase tracking-[0.2em] font-medium">
              Sovereign Agentic Liquidity Protocol
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              SynergyAI: Verified Humans.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
                Autonomous Agents.
              </span>
              <br />
              Deep Liquidity.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              SynergyAI binds Privado ID, GOAT-powered agents, and Katana's unified liquidity into one sovereign trading brain.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                size="lg"
                className="text-lg px-8 py-6 glow-purple hover-glitch"
                onClick={() => navigate("/dashboard")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch Command Center
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 glow-cyan hover-glitch border-secondary text-secondary hover:bg-secondary/10"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                Verify Humanity
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Key Pillars Section */}
      <section className="py-24 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-center mb-16">
            Built on Three Pillars
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={item}>
              <GlassCard className="h-full hover-glitch">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Sovereign Identity</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ZK-verified humans via Privado ID – no doxxing, no centralized KYC databases.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="h-full hover-glitch">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-secondary/20 border border-secondary/30">
                    <Bot className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold">Agentic Liquidity</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  GOAT SDK agents executing DeFi strategies directly on Katana's deep liquidity rails.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="h-full hover-glitch">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-success/20 border border-success/30">
                    <Coins className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Actual Steel Infra</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Built for VCs and institutions: low slippage, transparent risk, on-chain reputation.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-muted/10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-center mb-16">
            How SynergyAI Works
          </motion.h2>

          <div className="space-y-8">
            {[
              { step: 1, title: "Verify Humanity", icon: Fingerprint, desc: "Prove you're a unique human with Privado ID zero-knowledge proofs" },
              { step: 2, title: "Forge an Agent", icon: Bot, desc: "Create autonomous agents with custom DeFi strategies powered by GOAT SDK" },
              { step: 3, title: "Connect to Katana Liquidity", icon: TrendingUp, desc: "Access deep unified liquidity pools via Polygon AggLayer infrastructure" },
              { step: 4, title: "Watch Autonomous Yield", icon: Zap, desc: "Your agents execute trades 24/7, optimizing for risk-adjusted returns" },
            ].map(({ step, title, icon: Icon, desc }) => (
              <motion.div key={step} variants={item}>
                <GlassCard className="hover-glitch">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg">
                      {step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold">{title}</h3>
                      </div>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* For Builders & VCs Section */}
      <section className="py-24 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-center mb-16">
            For Builders & VCs
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={item}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold">For Builders</h3>
                </div>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Deploy custom agent strategies with full control over risk parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Composable infrastructure - integrate with any DeFi protocol on Polygon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Open-source SDKs and APIs for rapid development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Real-time analytics and monitoring dashboards</span>
                  </li>
                </ul>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">For VCs</h3>
                </div>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Revenue model: Performance fees on agent-generated yield</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>TAM: $2T+ DeFi market with institutional demand for automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Compliance-ready: ZK identity prevents sybil attacks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Network effects: More agents = deeper liquidity = better execution</span>
                  </li>
                </ul>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
