import { Product, Order, UserAddress } from '../types';
import { PRODUCTS } from '../constants';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreUtils';

// Simulator for async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'genzin_products';

const initializeProducts = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS));
    return PRODUCTS;
  }
  return JSON.parse(saved);
};

export const getProducts = async (): Promise<Product[]> => {
  await delay(300);
  return initializeProducts();
};

export const getProductById = async (id: string): Promise<Product | null> => {
  await delay(200);
  const products = initializeProducts();
  const product = products.find((p: Product) => p.id === id);
  return product || null;
};

export const getFeaturedProducts = async (count: number): Promise<Product[]> => {
  await delay(300);
  const products = initializeProducts();
  return products.slice(0, count);
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  await delay(500);
  const products = initializeProducts();
  const newProduct = {
    ...productData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  } as Product;
  const updated = [newProduct, ...products];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newProduct;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  await delay(500);
  const products = initializeProducts();
  const updated = products.map((p: Product) => p.id === id ? { ...p, ...productData } : p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.find((p: Product) => p.id === id);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await delay(500);
  const products = initializeProducts();
  const updated = products.filter((p: Product) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
  const path = 'orders';
  try {
    const ordersCol = collection(db, path);
    const q = userId 
      ? query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
      : query(ordersCol, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Order[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
  const path = 'orders';
  const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  try {
    const orderDoc = doc(db, path, orderId);
    const finalOrder = {
      ...orderData,
      orderId,
      createdAt: serverTimestamp()
    };
    await setDoc(orderDoc, finalOrder);
    return { ...finalOrder, id: orderId } as unknown as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${orderId}`);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
  const path = `orders/${id}`;
  try {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Address Services
export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  const path = `users/${userId}/addresses`;
  try {
    const addrCol = collection(db, 'users', userId, 'addresses');
    const q = query(addrCol, orderBy('isDefault', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as UserAddress[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const saveUserAddress = async (userId: string, addressData: Omit<UserAddress, 'id'>, id?: string): Promise<UserAddress> => {
  const addressId = id || Math.random().toString(36).substr(2, 9).toUpperCase();
  const path = `users/${userId}/addresses/${addressId}`;
  try {
    const addrDoc = doc(db, 'users', userId, 'addresses', addressId);
    const finalData = {
      ...addressData,
      updatedAt: serverTimestamp()
    };
    await setDoc(addrDoc, finalData);
    return { ...finalData, id: addressId } as unknown as UserAddress;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const deleteUserAddress = async (userId: string, addressId: string): Promise<void> => {
  const path = `users/${userId}/addresses/${addressId}`;
  try {
    const addrDoc = doc(db, 'users', userId, 'addresses', addressId);
    await deleteDoc(addrDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};
