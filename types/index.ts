export type UserRole = 'user' | 'owner';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'READY' | 'DONE' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  status: OrderStatus;
  createdAt: string;
}