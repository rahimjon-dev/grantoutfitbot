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
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav_favorites')} ({favorites.length})
          </h1>
          <p className="text-xs text-slate-500">Sizga yoqqan eksklyuziv liboslar to‘plami</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-slate-100 p-8">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Heart size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Sevimlilar ro‘yxati bo‘sh</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            O‘zingizga yoqqan kiyimlardagi yurakcha belgisini bosib, ularni bu yerga saqlab qo‘yishingiz mumkin.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            Katalogga o‘tish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
