import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegram } from './TelegramContext.jsx';
import { api } from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { haptic } = useTelegram();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('grant_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('grant_cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, variant, quantity = 1) => {
    haptic('medium');
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variant.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productId: product.id,
          product,
          variant,
          quantity
        }
      ];
    });

    // Sync to backend asynchronously
    api.addToCart(product.id, variant.id, quantity).catch(() => {});
  };

  const updateQuantity = (variantId, quantity) => {
    haptic('light');
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
    api.updateCartItem(variantId, quantity).catch(() => {});
  };

  const removeItem = (variantId) => {
    haptic('warning');
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
    api.removeFromCart(variantId).catch(() => {});
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('grant_cart_items');
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = (item.product?.discount_price_uzs || item.product?.base_price_uzs || 0) + (item.variant?.additional_price_uzs || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + deliveryFee;

  const value = {
    items,
    isOpen,
    setIsOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    deliveryFee,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
