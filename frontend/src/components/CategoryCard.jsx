import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CategoryCard({ category, onSelect, isSelected }) {
  const { getLocalizedField } = useLanguage();
  const name = getLocalizedField(category, 'name');

  return (
    <div
      onClick={() => onSelect(category.slug)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer aspect-[16/10] sm:aspect-[4/3] transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-gold-500 shadow-lg shadow-gold-500/20'
          : 'hover:ring-1 hover:ring-white/20'
      }`}
    >
      {/* Background Image */}
      <img
        src={category.image_url}
        alt={name}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
              {name}
            </h4>
            <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
              {getLocalizedField(category, 'description')}
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:text-black transition-colors">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
