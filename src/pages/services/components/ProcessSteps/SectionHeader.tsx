import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
}

export default function SectionHeader({
  badge,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14"
    >
      {badge && (
        <Badge variant="default" className="mb-4 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
        {title}
      </h2>
      {description && (
        <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-base lg:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
