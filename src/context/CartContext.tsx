import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, options?: { color?: string; size?: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const getCompositeKey = (item: any) => `${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`;

  const addToCart = (product: Product, options?: { color?: string; size?: string }) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => 
        item.id === product.id && 
        item.selectedColor === options?.color && 
        item.selectedSize === options?.size
      );

      if (existingIdx > -1) {
        const newCart = [...prev];
        newCart[existingIdx] = { 
          ...newCart[existingIdx], 
          quantity: newCart[existingIdx].quantity + 1 
        };
        return newCart;
      }

      // Determine images for this specific variant
      const variant = product.variants?.find(v => v.color === options?.color);
      const itemImages = variant && variant.images.length > 0 ? variant.images : product.images;

      return [...prev, { 
        ...product, 
        images: itemImages,
        quantity: 1, 
        selectedColor: options?.color, 
        selectedSize: options?.size
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => getCompositeKey(item) !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (getCompositeKey(item) === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
