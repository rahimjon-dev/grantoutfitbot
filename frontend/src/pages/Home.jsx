import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Sparkles, LayoutGrid, Shirt, Footprints, Glasses, Layers, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home({ categories, products, onSelectProduct, onSelectCategory, onNavigateToCatalog }) {
  const { t, getLocalizedField } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 8);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  // Filtered by local search or category pill if selected
  const filteredProducts = displayProducts.filter((p) => {
    if (activeCategorySlug !== 'all') {
      const cat = categories.find((c) => c.slug === activeCategorySlug);
      if (cat && p.category_id !== cat.id) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name_uz?.toLowerCase().includes(q) ||
        p.name_ru?.toLowerCase().includes(q) ||
        p.name_en?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Icon mapping for categories (Image 2 style)
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'headwear':
        return <Layers size={18} />;
      case 'upperwear':
        return <Shirt size={18} />;
      case 'bottomwear':
        return <Layers size={18} />;
      case 'footwear':
        return <Footprints size={18} />;
      case 'accessories':
        return <Glasses size={18} />;
      default:
        return <Shirt size={18} />;
    }
  };

  const handlePillClick = (slug) => {
    setActiveCategorySlug(slug);
    if (slug !== 'all') {
      onSelectCategory(slug);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Search Bar & Filter Button (Image 2 Style) */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder') || 'Search Products...'}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 shadow-xs transition-all"
          />
        </div>

        {/* Filter Button (Image 2 Style) */}
        <button
          onClick={onNavigateToCatalog}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs transition-colors"
          aria-label="Filter"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* 2. Category Circular Icon Buttons (Image 2 Style) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('categories_title') || 'Categories'}
          </h3>
        </div>

        {/* Horizontal Scrollable Circular Category List */}
        <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto pb-2 pt-1 scrollbar-none px-1">
          {/* All Products Circular Pill */}
          <button
            onClick={() => handlePillClick('all')}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
              activeCategorySlug === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                : 'bg-white border border-slate-200 text-slate-600 group-hover:border-slate-400'
            }`}>
              <LayoutGrid size={22} />
            </div>
            <span className={`text-[11px] sm:text-xs text-center font-semibold truncate max-w-[68px] ${
              activeCategorySlug === 'all' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}>
              All Products
            </span>
          </button>

          {/* Dynamic Categories with Circular Icons */}
          {categories.map((cat) => {
            const isSelected = activeCategorySlug === cat.slug;
            const name = getLocalizedField(cat, 'name');

            return (
              <button
                key={cat.id}
                onClick={() => handlePillClick(cat.slug)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
              >
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 group-hover:border-slate-400'
                }`}>
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className={`text-[11px] sm:text-xs text-center font-semibold truncate max-w-[68px] ${
                  isSelected ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Clean Modern Promotional Banner */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-[160px] sm:min-h-[190px]">
        {/* Subtle Fashion Silhouette Background */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80')` }}
        />

        <div className="relative z-10 space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles size={11} />
            <span>KUZ-QISH 2026/2027</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
            {t('hero_title') || 'Grant Luxury Collection'}
          </h2>

          <p className="text-xs text-slate-300 line-clamp-2">
            {t('hero_subtitle') || 'Premium liboslar va aksessuarlar. Tanlangan to‘plamlar uchun maxsus takliflar.'}
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <button
            onClick={onNavigateToCatalog}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>{t('hero_cta') || 'Kolleksiyani ko‘rish'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* 4. Popular Products Section (Image 2 Style) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Popular Products
            </h2>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 2-Column Product Grid (Mobile) / 3-4 Column (Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 5. Brand Trust Badges */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Tezkor Yetkazish</h4>
            <p className="text-[11px] text-slate-500">Toshkentda 24 soatda</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Sifat</h4>
            <p className="text-[11px] text-slate-500">Original luxury kiyimlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Oson Almashtirish</h4>
            <p className="text-[11px] text-slate-500">3 kunda bepul</p>
          </div>
        </div>
      </section>
    </div>
  );
}
