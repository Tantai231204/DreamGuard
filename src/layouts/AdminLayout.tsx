import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/layout/AdminSidebar';
import { useNotificationHub } from '@/hooks/useNotificationHub';

export default function AdminLayout() {
  useNotificationHub();
  return (
    <div className="scrollbar-admin flex h-screen overflow-hidden overflow-x-hidden bg-gray-50 w-full max-w-full">
      <AdminSidebar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full focus:outline-none"
        tabIndex={-1}
      >
        <div className="min-h-full w-full max-w-full">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
