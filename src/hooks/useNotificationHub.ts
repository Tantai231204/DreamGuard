import * as signalr from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface NotificationPayload {
  notificationId?: string;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string;
}

interface AuditLogPayload {
  auditLogId?: string;
  action?: string;
  details?: string;
  createdAt?: string;
  userName?: string;
}

const getHubUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiBaseUrl && /^https?:\/\//i.test(apiBaseUrl)) {
    try {
      return new URL(path, apiBaseUrl).toString();
    } catch {
      return path;
    }
  }
  return path;
};

const NOTI_HUB_URL = getHubUrl('/notiandloghub');
const SYSTEM_HUB_URL = getHubUrl('/systemhub');

export function useNotificationHub() {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuthStore();
  const [notiConnected, setNotiConnected] = useState(false);
  const [systemConnected, setSystemConnected] = useState(false);

  const notiConnRef = useRef<signalr.HubConnection | null>(null);
  const systemConnRef = useRef<signalr.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = sessionStorage.getItem('signalr_token') || '';
    if (!token) {
      console.warn('[SignalR] No token found in sessionStorage. Notifications might not connect.');
    }

    // Connect to NotiAndLogHub
    const notiConnection = new signalr.HubConnectionBuilder()
      .withUrl(NOTI_HUB_URL, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    notiConnection.on('ReceiveNotification', (notification: NotificationPayload) => {
      console.log('[SignalR] Notification Received:', notification);
      
      const rawMessage = notification.message || '';
      let displayMessage = rawMessage || notification.title || 'New Notification';
      
      displayMessage = displayMessage.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '#ID');
      displayMessage = displayMessage
        .replace(/your trade in order: #ID/i, 'Trade-in order')
        .replace(/is completed/i, 'completed')
        .trim();

      displayMessage = displayMessage.charAt(0).toUpperCase() + displayMessage.slice(1);

      toast.info(displayMessage, {
        action: {
          label: 'View',
          onClick: () => {
            const lower = rawMessage.toLowerCase();
            if (lower.includes('trade in')) navigate('/profile?tab=trade-in-orders');
            else if (lower.includes('service')) navigate('/profile?tab=service-orders');
            else navigate('/profile?tab=recent-orders');
          }
        }
      });
    });

    notiConnection.on('ReceiveAuditLog', (audit: AuditLogPayload) => {
      console.log('[SignalR] Audit Log Received:', audit);
      if (role === 'Admin' || role === 'Manager') {
        toast.info(audit.action || 'System Action', {
          action: {
            label: 'Logs',
            onClick: () => navigate('/admin/audit-logs')
          }
        });
      }
    });

    notiConnection.start()
      .then(() => {
        console.log('[SignalR] Connected to NotiAndLogHub');
        setNotiConnected(true);
      })
      .catch(err => console.error('[SignalR] NotiAndLogHub Error:', err));

    notiConnRef.current = notiConnection;

    // Connect to SystemHub (Only for Admin/Manager/Seller)
    if (role === 'Admin' || role === 'Manager' || role === 'Seller') {
      const systemConnection = new signalr.HubConnectionBuilder()
        .withUrl(SYSTEM_HUB_URL, {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build();

      systemConnection.start()
        .then(async () => {
          console.log('[SignalR] Connected to SystemHub');
          setSystemConnected(true);

          // Call ConnectAsync to join the required groups if Admin
          if (role === 'Admin') {
            try {
              await systemConnection.invoke('ConnectAsync');
              console.log('[SignalR] SystemHub: Joined Admin group');
            } catch (err) {
              console.warn('[SignalR] SystemHub ConnectAsync failed:', err);
            }
          }
        })
        .catch(err => console.error('[SignalR] SystemHub Error:', err));

      systemConnRef.current = systemConnection;
    }

    return () => {
      notiConnection.stop();
      if (systemConnRef.current) {
        systemConnRef.current.stop();
      }
    };
  }, [isAuthenticated, role, navigate]);

  const joinConversation = async (conversationId: string) => {
    if (systemConnRef.current && systemConnected) {
      try {
        await systemConnRef.current.invoke('JoinConversation', conversationId);
        console.log(`[SignalR] Joined SystemHub conversation: ${conversationId}`);
      } catch (err) {
        console.error('[SignalR] Failed to join conversation on SystemHub:', err);
      }
    }
  };

  return { notiConnected, systemConnected, joinConversation };
}
