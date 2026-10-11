import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Compass } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Catalog({ categories, products, selectedCategory, onSelectCategory, onSelectProduct }) {
  const { t, getLocalizedField } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((p) => p.category_id === cat.id);
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name_en?.toLowerCase().includes(q) ||
          p.name_ru?.toLowerCase().includes(q) ||
          p.name_uz?.toLowerCase().includes(q) ||
          p.description_uz?.toLowerCase().includes(q) ||
          p.description_ru?.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.discount_price_uzs || a.base_price_uzs) - (b.discount_price_uzs || b.base_price_uzs));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.discount_price_uzs || b.base_price_uzs) - (a.discount_price_uzs || a.base_price_uzs));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, categories]);

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-gold-500 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="relative flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-2xl px-4 py-3 pr-10 text-xs sm:text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="newest">{t('sort_newest')}</option>
            <option value="popular">{t('sort_popular')}</option>
            <option value="price_asc">{t('sort_price_asc')}</option>
            <option value="price_desc">{t('sort_price_desc')}</option>
          </select>
          <SlidersHorizontal
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedCategory || selectedCategory === 'all'
              ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
          }`}
        >
          {t('filter_all')}
        </button>

        {categories.map((c) => {
          const isSelected = selectedCategory === c.slug;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.slug)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {getLocalizedField(c, 'name')}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Topildi: <strong className="text-white">{filteredProducts.length}</strong> ta libos</span>
        {selectedCategory && selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-gold-400 hover:underline"
          >
            Filtrni tozalash
          </button>
        )}
      </div>

      {/* Products Grid: 2 on mobile, 3 on tablet, 4 on desktop */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Compass size={32} />
          </div>
          <h3 className="text-base font-bold text-white">Mos keladigan mahsulot topilmadi</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Qidiruv so‘zini o‘zgartirib ko‘ring yoki barcha bo‘limlarni ko‘zdan kechiring
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
          >
            Filtrni bekor qilish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
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
