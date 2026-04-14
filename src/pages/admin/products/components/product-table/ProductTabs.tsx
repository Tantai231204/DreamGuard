import { useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Layers, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type ProductTabKey = "single" | "combo" | "certificate" | "customize"

interface ProductTabItem {
  key: ProductTabKey
  label: string
  count: number
  icon: typeof Package
}

interface ProductTabsProps {
  activeTab: ProductTabKey
  onTabChange: (tab: ProductTabKey) => void
  singleCount: number
  comboCount: number
  certCount: number
  customizeCount: number
  showCertificateTab?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}

const TAB_CONFIG = {
  single: {
    indicator: "bg-[#4988c4] shadow-sm",
    icon: "text-white",
    label: "text-white",
    badge: "bg-white/20 text-white border-white/10",
  },
  customize: {
    indicator: "bg-sky-500 shadow-sm",
    icon: "text-white",
    label: "text-white",
    badge: "bg-white/20 text-white border-white/10",
  },
  combo: {
    indicator: "bg-slate-900 shadow-sm",
    icon: "text-white",
    label: "text-white",
    badge: "bg-white/20 text-white border-white/10",
  },
  certificate: {
    indicator: "bg-emerald-600 shadow-sm",
    icon: "text-white",
    label: "text-white",
    badge: "bg-white/20 text-white border-white/10",
  },
}

export default function ProductTabs({
  activeTab,
  onTabChange,
  singleCount,
  comboCount,
  certCount,
  customizeCount,
  showCertificateTab = true,
  children,
  actions,
}: ProductTabsProps) {
  const tabs = useMemo(() => {
    const baseTabs: ProductTabItem[] = [
      { key: "single" as const, label: "Regular Products", count: singleCount, icon: Package },
      { key: "customize" as const, label: "Product Templates", count: customizeCount, icon: Star },
      { key: "combo" as const, label: "Combo Packs", count: comboCount, icon: Layers },
    ];

    if (showCertificateTab) {
      baseTabs.push({ key: "certificate" as const, label: "Certificates", count: certCount, icon: Star });
    }

    return baseTabs;
  }, [singleCount, customizeCount, comboCount, certCount, showCertificateTab])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as ProductTabKey)}
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
                      isActive ? cfg.badge : "bg-slate-200/50 text-slate-600 border-transparent shadow-none"
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