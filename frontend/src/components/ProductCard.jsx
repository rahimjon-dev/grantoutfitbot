import React from 'react';
import { Heart, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function ProductCard({ product, onSelect }) {
  const { getLocalizedField, t } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();

  const name = getLocalizedField(product, 'name');
  const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const hasDiscount = Boolean(product.discount_price_uzs && product.discount_price_uzs < product.base_price_uzs);
  const currentPrice = hasDiscount ? product.discount_price_uzs : product.base_price_uzs;
  const favorited = isFavorite(product.id);

  const discountPercent = hasDiscount
    ? Math.round(((product.base_price_uzs - product.discount_price_uzs) / product.base_price_uzs) * 100)
    : 0;

  return (
    <div className="group relative bg-[#121216] rounded-2xl overflow-hidden luxury-border flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/60">
      {/* Media Container */}
      <div 
        onClick={() => onSelect(product)}
        className="relative aspect-[4/5] overflow-hidden bg-zinc-900 cursor-pointer"
      >
        <img
          src={primaryImg}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gold-500/90 backdrop-blur-md text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              Exclusive
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
          aria-label="Favorite"
        >
          <Heart size={16} className={favorited ? 'fill-rose-500 text-rose-500' : 'text-zinc-200'} />
        </button>

        {/* Quick View Hover Pill */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
            <Eye size={14} />
            {t('view_details')}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Tag */}
          <p className="text-[10px] font-medium tracking-wider text-zinc-300 uppercase mb-1">
            {getLocalizedField(product.category, 'name') || 'Apparel'}
          </p>

          {/* Product Name */}
          <h3 
            onClick={() => onSelect(product)}
            className="text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-gold-400 transition-colors cursor-pointer"
          >
            {name}
          </h3>
        </div>

        {/* Price & Stock Row */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">
              {formatUzs(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-zinc-300 line-through">
                {formatUzs(product.base_price_uzs)}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect(product)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            {t('view_details')}
          </button>
        </div>
      </div>
    </div>
  );
}
