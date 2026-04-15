import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/api/services';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Package,
  Ship,
  ShieldCheck,
  CreditCard,
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const getNotificationConfig = (message: string, actionType: string) => {
  const type = actionType.toLowerCase();
  const text = message.toLowerCase();
  
  // 1. Payment/Gateway specific
  if (type.includes('vnpay') || type.includes('gateway') || text.includes('payment')) {
    return { icon: CreditCard, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Payment' };
  }
  
  // 2. Order Status
  if (type.includes('confirm') || text.includes('confirmed')) {
    return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Success' };
  }
  
  if (type.includes('cancel') || text.includes('cancelled') || text.includes('fail')) {
    return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Declined' };
  }
  
  // 3. Entity specific
  if (type.includes('ship') || text.includes('delivered') || text.includes('delivery')) {
    return { icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Shipping' };
  }

  if (text.includes('service') || type.includes('service')) {
    return { icon: Ship, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Service' };
  }

  if (type.includes('audit')) {
    return { icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Security' };
  }
  
  return { icon: Package, color: 'text-primary-600', bg: 'bg-primary-50', label: 'System' };
};

const formatNotificationMessage = (message: string) => {
  const idRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const match = message.match(idRegex);
  
  if (match) {
    const id = match[0];
    const shortId = id.substring(0, 8).toUpperCase();
    const parts = message.split(id);
    
    return (
      <div className="text-[12px] text-slate-500 leading-snug">
        <span>{parts[0]}</span>
        <span className="font-bold text-slate-800 mx-1 cursor-help hover:text-primary-600 transition-colors">#{shortId}</span>
        <span>{parts[1]}</span>
      </div>
    );
  }
  
  return <p className="text-[12px] text-slate-500 leading-snug">{message}</p>;
};

export const NotificationDropdown: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', 'my'],
    queryFn: () => notificationService.getNotifications({ pageSize: 12 }),
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification: import('@/api/services/notificationService').NotificationResponse) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.notificationId);
    }

    // Admin/Staff navigation
    if (role === 'Admin' || role === 'Manager' || role === 'Seller') {
      const idRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
      const match = notification.message.match(idRegex);
      if (match) {
        const id = match[0];
        if (notification.message.toLowerCase().includes('tradein')) {
          navigate(`/admin/trade-in-orders/${id}`);
        } else {
          navigate(`/admin/orders/${id}`);
        }
      }
    }
  };

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.items.filter((n) => !n.isRead).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white hover:text-primary-500 hover:shadow-sm active:scale-95 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className={cn("w-5 h-5 transition-transform", unreadCount > 0 && "group-hover:rotate-12")} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white">
               <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[400px] rounded-3xl p-0 shadow-2xl border-slate-100 overflow-hidden bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-slate-900 tracking-tight">Activity</span>
            {unreadCount > 0 && (
              <span className="flex h-5 px-2 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary-600 border border-primary-100/50">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="group flex items-center gap-2 text-[11px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[460px] overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-6 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 shrink-0" />
                   <div className="flex-1 space-y-3 mt-1">
                     <div className="h-3 w-1/4 bg-slate-50 rounded" />
                     <div className="h-3 w-full bg-slate-50 rounded" />
                   </div>
                </div>
              ))}
            </div>
          ) : !notifications?.items.length ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                <Bell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Silence is golden</p>
                <p className="text-[10px] text-slate-300">No recent activity found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.items.map((notification) => {
                const config = getNotificationConfig(notification.message, notification.actionType);
                const Icon = config.icon;
                const isVeryRecent = (new Date().getTime() - new Date(notification.createdAt).getTime()) < 3600000; // 1 hour
                
                return (
                  <DropdownMenuItem
                    key={notification.notificationId}
                    className={cn(
                      "flex items-start gap-4 p-5 transition-all cursor-pointer outline-none group",
                      !notification.isRead 
                        ? "bg-primary-50/[0.12] hover:bg-primary-50/[0.22]" 
                        : "bg-white hover:bg-slate-50/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn(
                      "h-10 w-10 shrink-0 rounded-[14px] flex items-center justify-center border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                      !notification.isRead ? "bg-white border-primary-100" : "bg-slate-50 border-transparent",
                      config.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[11px] font-black uppercase tracking-[0.1em]",
                              config.color
                            )}>
                              {config.label}
                            </span>
                            {isVeryRecent && !notification.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                            )}
                         </div>
                         <span className="text-[10px] font-semibold text-slate-300 tracking-tighter shrink-0 flex items-center gap-1">
                           {format(new Date(notification.createdAt), 'HH:mm')}
                         </span>
                      </div>

                      <div className="pr-6">
                        {formatNotificationMessage(notification.message)}
                      </div>
                      
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             markReadMutation.mutate(notification.notificationId);
                          }}
                          className="absolute right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary-500 text-slate-300"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
            <button className="flex items-center justify-center gap-2 w-full text-[10px] font-black text-slate-400 hover:text-primary-600 transition-all uppercase tracking-[0.2em] group">
                Full View Activity
                <Package className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
