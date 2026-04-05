import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
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
            <Card
              className={`relative overflow-hidden border-l-4 ${stat.borderColor} bg-gradient-to-br ${stat.gradientBg} p-6 hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.lightBg}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.lightBg} ${stat.textColor}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
              />
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
