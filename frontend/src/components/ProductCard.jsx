import React, { useState } from 'react';
import { Heart, Star, Plus, Eye, Sparkles } from 'lucide-react';
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

  // Rating generation (deterministic from product id for luxury UI)
  const rating = 4.8 + ((product.id ? String(product.id).charCodeAt(0) : 5) % 3) * 0.1;
  const reviewCount = 85 + ((product.id ? String(product.id).charCodeAt(1) || 20 : 20) % 50);

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Media / Image Container (Image 2 style with soft grey background) */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f4f5f7] flex items-center justify-center">
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
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-60 blur-xs'
          }`}
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles size={9} />
              <span>HOT</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all active:scale-90 z-10"
          aria-label="Wishlist"
        >
          <Heart size={14} className={favorited ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Info & Pricing Container (Image 2 style) */}
      <div className="pt-2 sm:pt-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* Star Rating (Image 2 style) */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star size={11} className="fill-amber-400" />
            </div>
            <span className="font-bold text-slate-800 text-[11px]">{rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">({reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Quick Action */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                {formatUzs(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  {formatUzs(product.base_price_uzs)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs"
            aria-label="Details"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
