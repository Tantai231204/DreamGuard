import apiClient from "@/lib/api";

export interface NotificationResponse {
  notificationId: string;
  actionType: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

const notificationService = {
  getNotifications: async (params?: { pageNumber?: number; pageSize?: number; key?: string }): Promise<NotificationListResponse> => {
    const res = await apiClient.get("/Notifications", { params });
    return res.data?.data ?? res.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    // Assuming PATCH /Notifications?id=... or similar
    await apiClient.patch("/Notifications", null, { params: { id: notificationId } });
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/Notifications");
  }
};

export default notificationService;
