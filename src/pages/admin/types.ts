export interface Order {
  id: string;
  customerName: string;
  email: string;
  products: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  phone?: string;
  address?: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  timeline: Array<{
    title: string;
    description?: string;
    timestamp: string;
    icon: string;
  }>;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'customer';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'resolved' | 'pending' | 'archived';
  isOnline?: boolean;
  tags?: string[];
}
