import { Product, Order } from '../types';
import { PRODUCTS } from '../constants';

// Simulator for async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'genzin_products';
const ORDERS_KEY = 'genzin_orders';

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

export const getOrders = async (): Promise<Order[]> => {
  await delay(400);
  const saved = localStorage.getItem(ORDERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
  await delay(600);
  const orders = await getOrders();
  const newOrder = {
    ...orderData,
    id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    createdAt: new Date().toISOString()
  } as Order;
  localStorage.setItem(ORDERS_KEY, JSON.stringify([newOrder, ...orders]));
  return newOrder;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
  await delay(400);
  const orders = await getOrders();
  const updated = orders.map((o: Order) => o.id === id ? { ...o, status } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};
