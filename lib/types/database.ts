"use client";

// Database Types for AgriLink

export type UserRole = "consumer" | "producer" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "orange_money" | "wave" | "free_money" | "cash";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProducerProfile {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  region_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_certified_bio: boolean;
  rating: number;
  total_reviews: number;
  total_sales: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_wolof: string | null;
  icon: string | null;
  description: string | null;
  sort_order: number;
}

export interface Region {
  id: string;
  name: string;
  code: string;
}

export interface Product {
  id: string;
  producer_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock_quantity: number;
  min_order_quantity: number;
  is_bio: boolean;
  is_available: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  producer?: ProducerProfile & { profile?: Profile };
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  producer_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  producer?: ProducerProfile;
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_id: string | null;
  phone_number: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  producer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Conversation {
  id: string;
  consumer_id: string;
  producer_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  consumer?: Profile;
  producer?: ProducerProfile & { profile?: Profile };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  price: number;
  unit: string;
  stock_quantity: number;
  min_order_quantity: number;
  is_bio: boolean;
  images: File[];
}

export interface OrderFormData {
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  notes?: string;
  payment_method: PaymentMethod;
  phone_number: string;
}
