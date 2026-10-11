import React, { useState } from 'react';
import { Heart, Eye, Sparkles } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function ProductCard({ product, onSelect }) {
  const { getLocalizedField, t } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();

  const name = getLocalizedField(product, 'name');
  
  // Safe image fallback
  const fallbackImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const rawImg = product.images?.[0]?.image_url || fallbackImg;
  const [imgSrc, setImgSrc] = useState(rawImg);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasDiscount = Boolean(product.discount_price_uzs && product.discount_price_uzs < product.base_price_uzs);
  const currentPrice = hasDiscount ? product.discount_price_uzs : product.base_price_uzs;
  const favorited = isFavorite(product.id);

  const discountPercent = hasDiscount
    ? Math.round(((product.base_price_uzs - product.discount_price_uzs) / product.base_price_uzs) * 100)
    : 0;

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group relative bg-[#121216] rounded-2xl overflow-hidden luxury-border flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Media / Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== fallbackImg) {
              setImgSrc(fallbackImg);
            }
          }}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-70 blur-xs'
          }`}
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-rose-600/95 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gold-500/95 backdrop-blur-md text-black text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles size={9} />
              <span>Exclusive</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-transform active:scale-90 z-10"
          aria-label="Wishlist"
        >
          <Heart size={14} className={favorited ? 'fill-rose-500 text-rose-500' : 'text-zinc-200'} />
        </button>

        {/* Desktop Quick View Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-white/10">
            <Eye size={13} />
            <span>{t('view_details')}</span>
          </span>
        </div>
      </div>

      {/* Info & Pricing Container */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Category Tag */}
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-gold-400 uppercase truncate mb-0.5">
            {getLocalizedField(product.category, 'name') || 'GRANT'}
          </p>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-gold-300 transition-colors">
            {name}
          </h3>
        </div>

        {/* Pricing & Detail Action Button */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate leading-tight">
              {formatUzs(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-zinc-400 line-through truncate leading-tight mt-0.5">
                {formatUzs(product.base_price_uzs)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex-shrink-0 transition-colors flex items-center gap-1"
            aria-label="Tafsilotlar"
          >
            <Eye size={13} className="sm:hidden text-zinc-300" />
            <span className="hidden sm:inline">{t('view_details')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
