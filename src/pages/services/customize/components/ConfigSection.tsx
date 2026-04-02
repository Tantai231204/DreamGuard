import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigSectionProps {
  title: React.ReactNode;
  step: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const ConfigSection = React.memo(({ title, step, icon, children, defaultOpen = false }: ConfigSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-slate-100/50 last:border-0 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-7 hover:bg-slate-50/50 transition-all duration-500 text-left group",
          isOpen ? "bg-white" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "h-9 w-9 rounded-2xl flex items-center justify-center transition-all duration-500 border",
            isOpen ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200"
          )}>
            {icon || <span className="text-[11px] font-black">{step}</span>}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 font-mono">Bespoke Matrix Step {step}</p>
            <h3 className={cn(
              "text-[13px] font-black tracking-tight transition-colors duration-500",
              isOpen ? "text-slate-900" : "text-slate-500"
            )}>{title}</h3>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center border border-slate-100 text-slate-300",
          isOpen && "bg-slate-900 border-slate-900 text-white shadow-sm"
        )}>
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white"
          >
            <div className="px-7 pb-10 space-y-10 border-t border-slate-50/50 pt-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
