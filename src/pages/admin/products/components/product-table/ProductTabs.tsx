import * as React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  activeTab: "single" | "combo"
  onTabChange: (tab: "single" | "combo") => void
  singleCount: number
  comboCount: number
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function ProductTabs({
  activeTab,
  onTabChange,
  singleCount,
  comboCount,
  children,
  actions,
}: ProductTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v: string) =>
        onTabChange(v as "single" | "combo")
      }
      className="flex h-full w-full flex-col"
    >
      {/* Header */}
      <div className="px-6 py-3 border-b bg-slate-50/50 backdrop-blur-sm flex items-center justify-between">
        <TabsList className="relative h-auto rounded-xl border bg-white p-1 shadow-sm">
          {/* 🔥 Animated active background */}
          <motion.div
            layoutId="activeTab"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "absolute top-1 bottom-1 rounded-lg shadow-sm border",
              activeTab === "single"
                ? "left-1 w-[calc(50%-4px)] bg-gradient-to-br from-primary-50 to-white border-primary-200/60"
                : "left-[calc(50%+3px)] w-[calc(50%-4px)] bg-gradient-to-br from-slate-100 to-white border-slate-300/60"
            )}
          />

          {/* Single */}
          <TabsTrigger
            value="single"
            className="relative z-10 px-6 py-2 rounded-lg text-sm font-semibold transition-all bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Package
                className={cn(
                  "h-4 w-4 transition-colors",
                  activeTab === "single"
                    ? "text-primary-600"
                    : "text-slate-400"
                )}
              />

              <span
                className={cn(
                  "transition-colors",
                  activeTab === "single"
                    ? "text-primary-900"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Single Products
              </span>

              <Badge
                className={cn(
                  "ml-1.5 px-1.5 py-0 h-4.5 text-[10px] font-bold border-none transition-all",
                  activeTab === "single"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {singleCount}
              </Badge>
            </div>
          </TabsTrigger>

          {/* Combo */}
          <TabsTrigger
            value="combo"
            className="relative z-10 px-6 py-2 rounded-lg text-sm font-semibold transition-all bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Layers
                className={cn(
                  "h-4 w-4 transition-colors",
                  activeTab === "combo"
                    ? "text-slate-900"
                    : "text-slate-400"
                )}
              />

              <span
                className={cn(
                  "transition-colors",
                  activeTab === "combo"
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Combo Products
              </span>

              <Badge
                className={cn(
                  "ml-1.5 px-1.5 py-0 h-4.5 text-[10px] font-bold border-none transition-all",
                  activeTab === "combo"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {comboCount}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <TabsContent
        value={activeTab}
        className="mt-0 flex-1 overflow-hidden"
        asChild
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </TabsContent>
    </Tabs>
  )
}