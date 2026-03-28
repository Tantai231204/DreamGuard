import { useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Layers, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  activeTab: "single" | "combo" | "certificate"
  onTabChange: (tab: "single" | "combo" | "certificate") => void
  singleCount: number
  comboCount: number
  certCount: number
  children: React.ReactNode
  actions?: React.ReactNode
}

const TAB_CONFIG = {
  single: {
    indicator: "bg-blue-600 shadow-sm border border-blue-700/50",
    icon: "text-blue-50",
    label: "text-white",
    badge: "bg-white text-blue-700 border-white/20 shadow-sm",
    content: "bg-blue-50/50 border-blue-100",
    contentTitle: "text-blue-900",
  },
  combo: {
    indicator: "bg-slate-900 shadow-sm border border-slate-950/50",
    icon: "text-slate-100",
    label: "text-white",
    badge: "bg-white text-slate-900 border-white/20 shadow-sm",
    content: "bg-slate-50/50 border-slate-200",
    contentTitle: "text-slate-900",
  },
  certificate: {
    indicator: "bg-emerald-600 shadow-sm border border-emerald-700/50",
    icon: "text-emerald-50",
    label: "text-white",
    badge: "bg-white text-emerald-700 border-white/20 shadow-sm",
    content: "bg-emerald-50/50 border-emerald-100",
    contentTitle: "text-emerald-800",
  },
}

export default function ProductTabs({
  activeTab,
  onTabChange,
  singleCount,
  comboCount,
  certCount,
  children,
  actions,
}: ProductTabsProps) {
  const tabs = useMemo(() => [
    { key: "single" as const, label: "Single Products", count: singleCount, icon: Package },
    { key: "combo" as const, label: "Combo Products", count: comboCount, icon: Layers },
    { key: "certificate" as const, label: "Certificates", count: certCount, icon: Star },
  ], [singleCount, comboCount, certCount])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as "single" | "combo" | "certificate")}
      className="flex h-full w-full flex-col"
    >
      {/* Header */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <TabsList className="relative h-auto rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-1 gap-1">
          {tabs.map(({ key, label, count, icon: Icon }) => {
            const isActive = activeTab === key
            const cfg = TAB_CONFIG[key]

            return (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "relative h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                  "data-[state=active]:text-white text-slate-500 hover:text-slate-700 hover:bg-slate-50/80 data-[state=active]:hover:bg-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={cn("absolute inset-0 rounded-lg", cfg.indicator)}
                    transition={{ type: "tween", duration: 0.25, ease: "circOut" }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isActive ? cfg.icon : "text-slate-400 group-hover:text-slate-500"
                    )}
                  />
                  <span>{label}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full border transition-all duration-200",
                      isActive ? cfg.badge : "bg-slate-100 text-slate-600 border-slate-200/60 shadow-none"
                    )}
                  >
                    {count}
                  </Badge>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {actions && (
          <div className="flex items-center gap-2.5">{actions}</div>
        )}
      </div>

      {/* Content */}
      <TabsContent value={activeTab} className="mt-0 flex-1 overflow-hidden" asChild>
        <div className="h-full">
          {children}
        </div>
      </TabsContent>
    </Tabs>
  )
}