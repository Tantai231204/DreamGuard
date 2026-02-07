import { motion } from 'framer-motion';

interface AdminActionToolbarProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminActionToolbar({ children, title }: AdminActionToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4 border-b border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between">
        {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
        <div className="flex items-center gap-2 ml-auto">{children}</div>
      </div>
    </motion.div>
  );
}
