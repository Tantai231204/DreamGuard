import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '../components/layout/AdminSidebar';
import { useNotificationHub } from '@/hooks/useNotificationHub';

const AdminPageLoader = () => (
  <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-[#4988c4]" />
    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading workspace...</p>
  </div>
);

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
          <Suspense fallback={<AdminPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </motion.main>
    </div>
  );
}
