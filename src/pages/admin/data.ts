import type { Order, OrderDetail, Conversation } from './types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    products: 'Baby Bedding Set, Organic Pillow',
    total: 129.98,
    status: 'delivered',
    date: '2026-01-28',
    phone: '+1 234-567-8901',
    address: '123 Main St, New York, NY 10001'
  },
  {
    id: 'ORD-002',
    customerName: 'Michael Chen',
    email: 'michael.c@example.com',
    products: 'Premium Mattress',
    total: 299.99,
    status: 'processing',
    date: '2026-01-29',
    phone: '+1 234-567-8902',
    address: '456 Oak Ave, Los Angeles, CA 90001'
  },
  {
    id: 'ORD-003',
    customerName: 'Emily Davis',
    email: 'emily.d@example.com',
    products: 'Baby Blanket, Pillow Set',
    total: 89.99,
    status: 'shipped',
    date: '2026-01-30',
    phone: '+1 234-567-8903',
    address: '789 Pine Rd, Chicago, IL 60601'
  },
  {
    id: 'ORD-004',
    customerName: 'James Wilson',
    email: 'james.w@example.com',
    products: 'Organic Cotton Sheet',
    total: 59.99,
    status: 'pending',
    date: '2026-01-31',
    phone: '+1 234-567-8904',
    address: '321 Elm St, Houston, TX 77001'
  },
  {
    id: 'ORD-005',
    customerName: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    products: 'Baby Care Kit, Towel Set',
    total: 149.99,
    status: 'processing',
    date: '2026-02-01',
    phone: '+1 234-567-8905',
    address: '654 Maple Dr, Phoenix, AZ 85001'
  },
  {
    id: 'ORD-006',
    customerName: 'David Brown',
    email: 'david.b@example.com',
    products: 'Crib Mattress, Waterproof Cover',
    total: 189.99,
    status: 'delivered',
    date: '2026-01-25',
    phone: '+1 234-567-8906',
    address: '987 Cedar Ln, Miami, FL 33101'
  },
  {
    id: 'ORD-007',
    customerName: 'Amanda Taylor',
    email: 'amanda.t@example.com',
    products: 'Swaddle Blankets Pack',
    total: 45.99,
    status: 'cancelled',
    date: '2026-01-27',
    phone: '+1 234-567-8907',
    address: '147 Birch Ave, Seattle, WA 98101'
  },
  {
    id: 'ORD-008',
    customerName: 'Robert Martinez',
    email: 'robert.m@example.com',
    products: 'Baby Lounger, Support Pillow',
    total: 95.50,
    status: 'shipped',
    date: '2026-02-02',
    phone: '+1 234-567-8908',
    address: '258 Willow St, Boston, MA 02101'
  },
  {
    id: 'ORD-009',
    customerName: 'Jessica Garcia',
    email: 'jessica.g@example.com',
    products: 'Changing Pad, Cover Set',
    total: 67.99,
    status: 'pending',
    date: '2026-01-26',
    phone: '+1 234-567-8909',
    address: '369 Spruce Dr, Denver, CO 80201'
  },
  {
    id: 'ORD-010',
    customerName: 'Christopher Lee',
    email: 'chris.l@example.com',
    products: 'Nursery Bedding Collection',
    total: 249.99,
    status: 'processing',
    date: '2026-02-03',
    phone: '+1 234-567-8910',
    address: '741 Aspen Way, Austin, TX 78701'
  },
  {
    id: 'ORD-011',
    customerName: 'Nicole White',
    email: 'nicole.w@example.com',
    products: 'Organic Crib Sheets Set',
    total: 79.99,
    status: 'delivered',
    date: '2026-01-24',
    phone: '+1 234-567-8911',
    address: '852 Oak Hill Rd, Portland, OR 97201'
  },
  {
    id: 'ORD-012',
    customerName: 'Daniel Harris',
    email: 'daniel.h@example.com',
    products: 'Baby Sleep Sack, Wearable Blanket',
    total: 42.99,
    status: 'shipped',
    date: '2026-01-23',
    phone: '+1 234-567-8912',
    address: '963 Pine Valley, Nashville, TN 37201'
  },
  {
    id: 'ORD-013',
    customerName: 'Sophia Clark',
    email: 'sophia.c@example.com',
    products: 'Toddler Pillow, Pillowcase',
    total: 35.99,
    status: 'cancelled',
    date: '2026-01-22',
    phone: '+1 234-567-8913',
    address: '159 Maple Grove, San Diego, CA 92101'
  },
  {
    id: 'ORD-014',
    customerName: 'Matthew Lewis',
    email: 'matthew.l@example.com',
    products: 'Bassinet Sheet, Fitted Cover',
    total: 28.99,
    status: 'pending',
    date: '2026-02-04',
    phone: '+1 234-567-8914',
    address: '753 Cherry Blossom, Las Vegas, NV 89101'
  },
  {
    id: 'ORD-015',
    customerName: 'Olivia Walker',
    email: 'olivia.w@example.com',
    products: 'Deluxe Baby Gift Set',
    total: 175.00,
    status: 'processing',
    date: '2026-01-21',
    phone: '+1 234-567-8915',
    address: '426 Sunset Blvd, San Francisco, CA 94101'
  },
];

export const mockOrderDetails: OrderDetail = {
    ...mockOrders[0],
    items: [
      {
        id: '1',
        name: 'Baby Bedding Set - Bunny Design',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200',
        quantity: 1,
        price: 79.99
      },
      {
        id: '2',
        name: 'Organic Cotton Pillow',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200',
        quantity: 1,
        price: 49.99
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      phone: '+1 234-567-8901',
      street: '123 Main St',
      ward: 'Ward 1',
      district: 'Manhattan',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Credit Card (****1234)',
    notes: 'Please deliver between 9 AM - 5 PM',
    subtotal: 129.98,
    shipping: 10.00,
    tax: 14.00,
    timeline: [
      {
        title: 'Đơn hàng đã được đặt',
        description: 'Đơn hàng của bạn đã được xác nhận',
        timestamp: '2026-01-28T10:30:00',
        icon: 'check',
      },
      {
        title: 'Đang xử lý',
        description: 'Đơn hàng đang được chuẩn bị',
        timestamp: '2026-01-28T14:00:00',
        icon: 'package',
      },
    ],
};

export const mockConversations: Conversation[] = [
  {
    id: 'CONV-001',
    customerId: 'CUST-001',
    customerName: 'Sarah Johnson',
    lastMessage: 'Khi nào đơn hàng của tôi được giao?',
    lastMessageTime: '2026-02-01T10:30:00',
    unreadCount: 2,
    status: 'active'
  },
  {
    id: 'CONV-002',
    customerId: 'CUST-002',
    customerName: 'Michael Chen',
    lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
    lastMessageTime: '2026-02-01T09:15:00',
    unreadCount: 0,
    status: 'active'
  },
  {
    id: 'CONV-003',
    customerId: 'CUST-003',
    customerName: 'Emily Davis',
    lastMessage: 'Tôi muốn đổi sản phẩm',
    lastMessageTime: '2026-01-31T16:45:00',
    unreadCount: 1,
    status: 'active'
  }
];

export const mockMessages: Record<string, Array<{
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
}>> = {
  'CONV-001': [
    {
      id: 'MSG-001',
      conversationId: 'CONV-001',
      senderId: 'CUST-001',
      senderName: 'Sarah Johnson',
      senderRole: 'customer' as const,
      content: 'Xin chào, tôi đã đặt hàng từ 3 ngày trước nhưng chưa nhận được thông báo gì.',
      timestamp: '2026-02-01T10:00:00',
      isRead: true
    },
    {
      id: 'MSG-002',
      conversationId: 'CONV-001',
      senderId: 'ADMIN-001',
      senderName: 'Admin Support',
      senderRole: 'admin' as const,
      content: 'Xin chào! Cho tôi kiểm tra đơn hàng của bạn. Vui lòng cung cấp mã đơn hàng.',
      timestamp: '2026-02-01T10:15:00',
      isRead: true
    },
    {
      id: 'MSG-003',
      conversationId: 'CONV-001',
      senderId: 'CUST-001',
      senderName: 'Sarah Johnson',
      senderRole: 'customer' as const,
      content: 'Mã đơn hàng của tôi là ORD-001',
      timestamp: '2026-02-01T10:20:00',
      isRead: true
    },
    {
      id: 'MSG-004',
      conversationId: 'CONV-001',
      senderId: 'ADMIN-001',
      senderName: 'Admin Support',
      senderRole: 'admin' as const,
      content: 'Cảm ơn bạn! Đơn hàng của bạn đã được giao thành công hôm qua. Bạn có nhận được không?',
      timestamp: '2026-02-01T10:25:00',
      isRead: false
    },
    {
      id: 'MSG-005',
      conversationId: 'CONV-001',
      senderId: 'CUST-001',
      senderName: 'Sarah Johnson',
      senderRole: 'customer' as const,
      content: 'Khi nào đơn hàng của tôi được giao?',
      timestamp: '2026-02-01T10:30:00',
      isRead: false
    }
  ]
};
