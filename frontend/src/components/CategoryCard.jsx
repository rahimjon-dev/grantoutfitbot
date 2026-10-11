import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CategoryCard({ category, onSelect, isSelected }) {
  const { getLocalizedField } = useLanguage();
  const name = getLocalizedField(category, 'name');
  
  const fallbackImg = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80';
  const [imgSrc, setImgSrc] = useState(category.image_url || fallbackImg);

  return (
    <div
      onClick={() => onSelect(category.slug)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer aspect-[16/10] sm:aspect-[4/3] lg:aspect-[3/4] transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-gold-500 shadow-lg shadow-gold-500/20'
          : 'hover:ring-1 hover:ring-white/20'
      }`}
    >
      {/* Background Image */}
      <img
        src={imgSrc}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
        }}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-3 sm:p-4">
        <div className="flex items-end justify-between gap-1">
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm lg:text-base font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors truncate">
              {name}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
              {getLocalizedField(category, 'description')}
            </p>
          </div>

          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:text-black transition-colors flex-shrink-0">
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
