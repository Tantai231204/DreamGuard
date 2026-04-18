import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { QuickAction } from "../types";

interface QuickActionsProps {
  actions: QuickAction[];
  isLoading?: boolean;
}

export default function QuickActions({ actions, isLoading }: QuickActionsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
             <Skeleton className="h-10 w-10 rounded-xl" />
             <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
             </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {actions.map((action) => {
        const Icon = action.icon;

        const cardContent = (
          <div
            className={cn(
              "p-4 rounded-2xl transition-all group border border-slate-100 bg-white hover:shadow-md hover:border-[#4988c4]/20 relative",
              action.disabled && "cursor-not-allowed opacity-40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 group-hover:bg-[#4988c4] flex items-center justify-center transition-colors duration-300">
                <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                  {action.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">{action.description}</p>
              </div>
              {!action.disabled && (
                <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              )}
            </div>
            {action.badge && (
              <span className="absolute top-3 right-3 h-5 min-w-[20px] px-1 flex items-center justify-center text-[9px] font-black bg-red-500 text-white rounded-full">
                {action.badge}
              </span>
            )}
          </div>
        );

        if (action.disabled) return <div key={action.title}>{cardContent}</div>;

        return (
          <Link key={action.title} to={action.to}>
            {cardContent}
          </Link>
        );
      })}
    </motion.div>
  );
}
