import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/hooks/useBlockchain";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Droplets,
  Loader2,
  Pause,
  Play,
  Shield,
  TrendingUp,
} from "lucide-react";

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

const statusColors = {
  success: "border-success text-success",
  warning: "border-warning text-warning",
  pending: "border-secondary text-secondary",
  info: "border-primary text-primary",
};

const iconMap: Record<string, any> = {
  identity: Shield,
  agent: Bot,
  transaction: TrendingUp,
  liquidity: Droplets,
  pause: Pause,
  play: Play,
  warning: AlertTriangle,
};

export default function Activity() {
  const { data: activityResponse, isLoading } = useActivity();
  const activitiesList = activityResponse?.activities || [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={item}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Stream</h1>
            <p className="text-muted-foreground">
              Complete timeline of identity, agent, and transaction events.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter by Type
            </Button>
            <Button variant="outline" size="sm">
              Filter by Agent
            </Button>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : activitiesList.length > 0 ? (
              <div className="space-y-4">
                {activitiesList.map((activity: any, i: number) => {
                  const Icon = iconMap[activity.type] || Bot;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-${
                          activity.status || "info"
                        }/10 border border-${
                          activity.status || "info"
                        }/30 flex items-center justify-center`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            statusColors[
                              (activity.status ||
                                "info") as keyof typeof statusColors
                            ]?.split(" ")[1] || "text-primary"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold">{activity.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs uppercase ${
                              statusColors[
                                (activity.status ||
                                  "info") as keyof typeof statusColors
                              ] || "border-primary text-primary"
                            }`}
                          >
                            {activity.status || "info"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {activity.description}
                        </p>
                        <div className="text-xs text-muted-foreground/60 font-mono">
                          {activity.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No activity yet. Start by verifying your identity and
                  deploying an agent.
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
