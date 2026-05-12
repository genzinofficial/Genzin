export interface ProductVariant {
  color: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'ELECTRONICS' | 'FASHION' | 'WATCHES' | 'JEWELRY' | 'ACCESSORIES' | 'HOME';
  images: string[];
  description: string;
  isNew?: boolean;
  sizes: string[];
  colors: string[];
  variants?: ProductVariant[];
  groupId?: string;
  supplierUrl?: string;
  originalPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  selectedColor?: string;
  selectedSize?: string;
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface UserAddress {
  id?: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  updatedAt?: any;
}

export interface User {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  accessRevoked?: boolean;
  createdAt: any;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  billingInfo: BillingInfo;
  createdAt: any; // Using any for Firestore Timestamp
}
