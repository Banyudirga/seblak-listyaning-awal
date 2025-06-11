import { useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Add an item to the cart
  const addToCart = useCallback((item: { id: string, name: string, price: number }) => {
    setCart(prevCart => {
      // Check if item already in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  }, []);

  // Remove an item (or reduce quantity)
  const removeFromCart = useCallback((id: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === id);
      
      if (existingItemIndex === -1) return prevCart;
      
      const item = prevCart[existingItemIndex];
      
      // If quantity is 1, remove the item
      if (item.quantity === 1) {
        return prevCart.filter(item => item.id !== id);
      }
      
      // Otherwise reduce quantity
      const updatedCart = [...prevCart];
      updatedCart[existingItemIndex] = {
        ...item,
        quantity: item.quantity - 1
      };
      
      return updatedCart;
    });
  }, []);

  // Clear the cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calculate total (without tax)
  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    calculateTotal
  };
};
