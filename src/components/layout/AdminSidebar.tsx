import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  BarChart3,
  LogOut,
  Sparkles,
  FolderTree,
  RefreshCw,
  Ticket,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useProfile } from '@/hooks/queries';
import { useLogout } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: Wallet,
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Sparkles,
    badge: 2,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Vouchers',
    href: '/admin/vouchers',
    icon: Ticket,
  },
  {
    title: 'Trade-ins',
    href: '/admin/resell',
    icon: RefreshCw,
    badge: 2,
  },
  {
    title: 'Customers',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Chat',
    href: '/admin/chat',
    icon: MessageSquare,
    badge: 3,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: profile } = useProfile();
  const { mutate: logout } = useLogout();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        type: 'tween'
      }}
      className="relative flex flex-col bg-white border-r border-gray-200 shadow-lg h-screen flex-shrink-0 overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3 overflow-hidden">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">DreamGuard</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 transition-all duration-300',
            collapsed && 'justify-center'
          )}
        >
          <Avatar className="h-10 w-10 border-2 border-[var(--color-primary)] flex-shrink-0">
            <AvatarImage src={profile?.avatarUrl} alt={profile ? `${profile.firstName} ${profile.lastName}` : "Admin"} />
            <AvatarFallback className="bg-[var(--color-primary)] text-white">
              {profile ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase() : 'AD'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.email || 'admin@dreamguard.com'}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link to={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group',
                      collapsed && 'justify-center px-2',
                      active
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-transform duration-300',
                        active ? 'text-white' : 'text-gray-600'
                      )}
                    />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {item.title}
                      </motion.span>
                    )}
                    {!collapsed && item.badge && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0',
                          active
                            ? 'bg-white text-[var(--color-primary)]'
                            : 'bg-[var(--color-primary)] text-white'
                        )}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={() => logout()}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-300',
            collapsed && 'justify-center px-2',
            'text-red-600 hover:bg-red-50 hover:translate-x-1 relative group'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
