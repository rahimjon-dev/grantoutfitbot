import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegram } from './TelegramContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { haptic } = useTelegram();
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('grant_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('grant_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product) => {
    haptic('light');
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (productId) => {
    return favorites.some((p) => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
