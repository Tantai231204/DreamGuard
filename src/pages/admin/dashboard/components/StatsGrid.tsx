import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "../types";
import { containerVariants, itemVariants } from "../data";

interface StatsGridProps {
  stats: DashboardStat[];
  isLoading?: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-white border border-slate-100 shadow-sm flex flex-col gap-4">
             <div className="flex justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
             </div>
             <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-8 w-32 ml-auto" />
             </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", stat.lightBg)}>
                  <Icon className={cn("h-6 w-6", stat.textColor)} />
                </div>
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border", stat.lightBg, stat.textColor, "border-current/10")}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              {/* Subtle accent bar */}
              <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-4", stat.textColor.replace('text-', 'bg-'))} />
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
