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
      className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:ml-auto">{children}</div>
      </div>
    </motion.div>
  );
}
