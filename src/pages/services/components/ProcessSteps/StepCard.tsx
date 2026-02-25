import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StepCircle from "./StepCircle";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  variant?: "vertical" | "horizontal";
}

export default function StepCard({
  step,
  title,
  description,
  icon,
  index,
  variant = "vertical",
}: StepCardProps) {
  // Mobile horizontal variant
  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300 border-gray-100">
          <CardContent className="flex gap-4 items-center p-4">
            <StepCircle icon={icon} step={step} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Desktop vertical variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="flex flex-col items-center text-center group"
    >
      <div className="mb-6 group-hover:scale-105 transition-transform duration-300">
        <StepCircle icon={icon} step={step} size="lg" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
        {description}
      </p>
    </motion.div>
  );
}
