import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCircleProps {
  icon: LucideIcon;
  step: number;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    outer: "h-14 w-14",
    inner: "h-10 w-10",
    icon: "h-5 w-5",
    badge: "h-6 w-6 text-xs -top-1 -right-1",
  },
  md: {
    outer: "h-20 w-20",
    inner: "h-14 w-14",
    icon: "h-6 w-6",
    badge: "h-7 w-7 text-sm -top-1.5 -right-1.5",
  },
  lg: {
    outer: "h-28 w-28",
    inner: "h-20 w-20",
    icon: "h-8 w-8",
    badge: "h-8 w-8 text-sm -top-2 -right-2",
  },
};

export default function StepCircle({ icon: Icon, step, size = "md" }: StepCircleProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full",
        "bg-white shadow-lg border-4 border-[#bde8f5]",
        "transition-transform duration-300",
        config.outer
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white",
          config.inner
        )}
      >
        <Icon className={config.icon} />
      </div>
      <span
        className={cn(
          "absolute rounded-full bg-[#4988c4] text-white font-bold",
          "flex items-center justify-center shadow-md",
          config.badge
        )}
      >
        {step}
      </span>
    </div>
  );
}
