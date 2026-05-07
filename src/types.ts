export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'ELECTRONICS' | 'FASHION' | 'WATCHES' | 'JEWELRY' | 'ACCESSORIES' | 'HOME';
  image: string;
  description: string;
  isNew?: boolean;
  sizes: string[];
  colors: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
