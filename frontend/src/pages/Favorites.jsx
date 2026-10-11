import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Favorites({ onSelectProduct, onNavigateToCatalog }) {
  const { favorites } = useFavorites();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            {t('nav_favorites')} ({favorites.length})
          </h1>
          <p className="text-xs text-zinc-400">Sizga yoqqan eksklyuziv liboslar to‘plami</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Heart size={32} />
          </div>
          <h3 className="text-base font-bold text-white">Sevimlilar ro‘yxati bo‘sh</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            O‘zingizga yoqqan kiyimlardagi yurakcha belgisini bosib, ularni bu yerga saqlab qo‘yishingiz mumkin.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold transition-all shadow-lg shadow-gold-500/20"
          >
            Katalogga o‘tish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
