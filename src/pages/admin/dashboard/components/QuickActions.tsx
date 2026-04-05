import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { QuickAction } from "../types";

interface QuickActionsProps {
  actions: QuickAction[];
  isLoading?: boolean;
}

export default function QuickActions({ actions, isLoading }: QuickActionsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-white border border-slate-100 flex items-center gap-4">
             <Skeleton className="h-14 w-14 rounded-xl" />
             <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
             </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {actions.map((action) => {
        const Icon = action.icon;

        const cardContent = (
          <Card
            className={`p-6 hover:shadow-2xl transition-all group border-2 border-transparent ${action.hoverBorder} bg-gradient-to-br from-white to-gray-50 relative ${
              action.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-14 w-14 rounded-xl ${action.iconBg} flex items-center justify-center transition-shadow`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
              {!action.disabled && (
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-[var(--color-primary)] group-hover:translate-x-2 transition-all" />
              )}
            </div>
            {action.badge && (
              <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                {action.badge}
              </Badge>
            )}
          </Card>
        );

        if (action.disabled) {
          return (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {cardContent}
            </motion.div>
          );
        }

        return (
          <Link key={action.title} to={action.to}>
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {cardContent}
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}
