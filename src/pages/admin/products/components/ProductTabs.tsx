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
}

export default function ProductTabs({
  activeTab,
  onTabChange,
  singleCount,
  comboCount,
  children,
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
      <div className="px-6 py-3 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
        <TabsList className="relative h-auto rounded-xl border bg-background p-1 shadow-sm">

          {/* 🔥 Animated active background */}
          <motion.div
            layoutId="activeTab"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "absolute top-1 bottom-1 rounded-lg",
              activeTab === "single"
                ? "left-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300"
                : "left-[calc(50%+3px)] w-[calc(50%-4px)] bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300"
            )}
          />

          {/* Single */}
          <TabsTrigger
            value="single"
            className="relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Package
                className={cn(
                  "h-4 w-4 transition-colors",
                  activeTab === "single"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />

              <span
                className={cn(
                  "transition-colors",
                  activeTab === "single"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Single Products
              </span>

              <Badge
                className={cn(
                  "ml-1.5",
                  activeTab === "single"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {singleCount}
              </Badge>
            </div>
          </TabsTrigger>

          {/* Combo */}
          <TabsTrigger
            value="combo"
            className="relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Layers
                className={cn(
                  "h-4 w-4 transition-colors",
                  activeTab === "combo"
                    ? "text-purple-600"
                    : "text-muted-foreground"
                )}
              />

              <span
                className={cn(
                  "transition-colors",
                  activeTab === "combo"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Combo Products
              </span>

              <Badge
                className={cn(
                  "ml-1.5",
                  activeTab === "combo"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {comboCount}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>
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