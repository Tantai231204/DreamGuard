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
  Ticket,
  Wallet,
  Boxes,
  CircleDot,
  UserCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useProfile } from '@/hooks/queries';
import { useLogout } from '@/hooks/useAuth';
import { ProductAssetIcons } from '@/components/common/icons';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | string;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { title: 'Chat', href: '/admin/chat', icon: MessageSquare, badge: 3 },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { title: 'Payments', href: '/admin/payments', icon: Wallet },
      { title: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { title: 'Products', href: '/admin/products', icon: Boxes },
      { title: 'Categories', href: '/admin/categories', icon: FolderTree },
      { title: 'Product Types', href: '/admin/product-types', icon: ProductAssetIcons.PRODUCT_CATEGORIES },
    ],
  },
  {
    label: 'Services',
    items: [
      { title: 'Services', href: '/admin/services', icon: Sparkles, badge: 2 },
      { title: 'Service Packages', href: '/admin/service-packages', icon: Package },
      { title: 'Customize Types', href: '/admin/customize-types', icon: CircleDot },
    ],
  },
  {
    label: 'User Management',
    items: [
      { title: 'Customers', href: '/admin/users', icon: Users },
      { title: 'Staff', href: '/admin/staff', icon: UserCheck },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ],
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
        duration: 0.5,
        ease: [0.32, 0, 0.67, 0],
        type: 'spring',
        stiffness: 260,
        damping: 30
      }}
      className="relative flex flex-col bg-white border-r border-gray-100 h-screen flex-shrink-0 z-50 transition-colors"
    >
      {/* Dynamic Toggle Button (Middle Floating) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-1/2 -translate-y-1/2 z-[100] w-6 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center transition-all duration-300 group hover:scale-110 hover:border-[var(--color-primary)]/50",
          collapsed ? "px-0.5" : ""
        )}
      >
        <div className="flex flex-col gap-0.5 items-center">
          <div className={cn("w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[var(--color-primary)] transition-colors", !collapsed && "rotate-45")} />
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-[var(--color-primary)]" /> : <ChevronLeft className="w-3 h-3 text-gray-500 group-hover:text-[var(--color-primary)]" />}
          <div className={cn("w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[var(--color-primary)] transition-colors", !collapsed && "-rotate-45")} />
        </div>
      </button>

      {/* Header */}
      <div className={cn(
        "flex flex-col border-b border-gray-50 transition-all duration-500",
        collapsed ? "py-8 px-4" : "py-10 px-8"
      )}>
        <Link to="/admin" className="flex items-center gap-4 group/logo">
          <div className={cn(
            "rounded-2xl bg-[#4988c4] flex items-center justify-center transition-all duration-700",
            collapsed ? "w-12 h-12 p-2.5" : "w-11 h-11 p-2"
          )}>
            <img src="/images/logo_no_name.svg" alt="DG" className="w-full h-full brightness-0 invert" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">DreamGuard</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] leading-none">Management</p>
              </div>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto no-scrollbar scroll-smooth">
        <div className={cn("transition-all duration-500", collapsed ? "space-y-4" : "space-y-10")}>
          {navSections.map((section, idx) => (
            <div key={section.label} className={cn("transition-all duration-300", collapsed ? "space-y-1" : "space-y-2")}>
              {!collapsed && (
                <h3 className="px-5 text-[10px] font-black uppercase tracking-[3px] text-gray-300 mb-4 transition-colors hover:text-[var(--color-primary)]/50 cursor-default">
                  {section.label}
                </h3>
              )}
              {collapsed && idx > 0 && <div className="mx-4 border-t border-gray-100 my-4 opacity-40" />}
              
              <ul className={cn("transition-all duration-300", collapsed ? "space-y-2" : "space-y-1.5")}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href} className="w-full relative px-1">
                      <Link to={item.href}>
                        <motion.div
                          whileHover={{ x: collapsed ? 0 : 6 }}
                          whileTap={{ scale: 0.96 }}
                          className={cn(
                            'group relative flex items-center transition-all duration-300 z-[60]',
                            collapsed 
                              ? 'justify-center w-12 h-12 mx-auto rounded-2xl' 
                              : 'gap-3 px-4 py-3 mx-2 rounded-xl',
                            active
                              ? 'text-[var(--color-primary)] font-bold'
                              : 'text-gray-500 hover:text-gray-900 font-semibold'
                          )}
                        >
                          {/* Premium Active Back Pill */}
                          {active && (
                            <motion.div
                              layoutId="active-highlight"
                              className={cn(
                                "absolute inset-0 -z-10",
                                collapsed 
                                  ? "bg-[var(--color-primary)] rounded-2xl" 
                                  : "bg-gray-100 rounded-xl"
                              )}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}

                          {/* Left Indicator Ribbon */}
                          {active && !collapsed && (
                            <motion.div
                              layoutId="indicator"
                              className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-[var(--color-primary)] rounded-full"
                            />
                          )}

                          <div className={cn(
                            "relative flex items-center justify-center transition-all duration-500",
                            active && !collapsed && "scale-110"
                          )}>
                            {typeof Icon === 'string' ? (
                              <img
                                src={Icon}
                                alt={item.title}
                                className={cn(
                                  'w-5 h-5 flex-shrink-0 object-contain transition-all duration-500',
                                  active ? (collapsed ? 'brightness-0 invert' : 'brightness-100') : 'opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100'
                                )}
                              />
                            ) : (
                              <Icon
                                className={cn(
                                  'w-5 h-5 flex-shrink-0 transition-all duration-500',
                                  active ? (collapsed ? 'text-white' : 'text-[var(--color-primary)]') : 'text-inherit group-hover:text-gray-800'
                                )}
                              />
                            )}

                            {item.badge && collapsed && (
                              <div className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 border-2 border-white px-1 text-[9px] font-black text-white">
                                {item.badge}
                              </div>
                            )}
                          </div>

                          {!collapsed && (
                            <span className="text-[13px] transition-colors relative z-10 truncate tracking-wide">
                              {item.title}
                            </span>
                          )}

                          {item.badge && !collapsed && (
                            <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-black text-white">
                              {item.badge}
                            </div>
                          )}
                          
                          {/* Tooltip Enhanced (Visible only in collapsed state) */}
                          {collapsed && (
                            <div className="absolute left-[calc(100%+0.5rem)] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-500 px-3 py-2 bg-gray-900 border border-white/10 text-white text-[11px] font-bold rounded-xl whitespace-nowrap z-[100] translate-x-[-10px] group-hover:translate-x-0">
                              <span className="relative z-10">{item.title}</span>
                              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900 shadow-sm" />
                              {/* Glowing Backdrop for Tooltip */}
                              <div className="absolute inset-0 bg-white/10 opacity-50 rounded-xl" />
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* User Actions & Profile */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-50">
         <div className={cn(
           "mb-4 flex items-center transition-all duration-300",
           collapsed ? "justify-center" : "bg-white p-2.5 rounded-2xl border border-gray-100 gap-3"
         )}>
           <div className="relative group/avatar">
             <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-[var(--color-primary-light)] ring-offset-2 flex-shrink-0 transition-transform hover:scale-105">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.fullName || "Admin"} />
                <AvatarFallback className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-black text-xs">
                  {profile?.fullName ? profile.fullName[0].toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
              
              {collapsed && (
                <div className="absolute left-full invisible group-hover/avatar:visible opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 ml-5 px-4 py-3 bg-white border border-gray-100 text-gray-900 text-xs rounded-2xl whitespace-nowrap z-[100] translate-x-[-10px] group-hover/avatar:translate-x-0 min-w-[150px]">
                  <p className="font-black text-sm">{profile?.fullName || 'Administrator'}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{profile?.email || 'admin@dreamguard.com'}</p>
                </div>
              )}
           </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate tracking-tight">
                  {profile?.fullName || 'Administrator'}
                </p>
                <p className="text-[10px] text-gray-400 font-bold truncate tracking-wide mt-0.5">{profile?.email || 'admin@dreamguard.com'}</p>
              </div>
            )}
         </div>

         <button
          onClick={() => logout()}
          className={cn(
            "flex items-center transition-all duration-300 group rounded-xl",
            collapsed ? "justify-center w-12 h-12 mx-auto hover:bg-red-50" : "w-full gap-3 px-5 py-3 text-red-500 hover:bg-red-50"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          {!collapsed && <span className="text-sm font-black tracking-tight">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
