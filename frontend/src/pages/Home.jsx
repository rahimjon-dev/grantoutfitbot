import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home({ categories, products, onSelectProduct, onSelectCategory, onNavigateToCatalog }) {
  const { t } = useLanguage();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 8);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16 pb-12">
      {/* Editorial Hero Banner */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] min-h-[290px] sm:min-h-[380px] lg:min-h-[440px] border border-white/10 flex items-end p-5 sm:p-10 lg:p-14 shadow-2xl">
        {/* Background Image with Fallback */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt="GRANT Luxury Collection"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.7] contrast-105"
        />

        {/* Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-gold-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            <Sparkles size={12} />
            <span>KUZ-QISH 2026/2027</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-zinc-300 max-w-lg font-medium leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToCatalog}
              className="py-2.5 sm:py-3.5 px-5 sm:px-7 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-gold-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>{t('hero_cta')}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 6 Fashion Categories Grid */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight uppercase">
              {t('categories_title')}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">Har bir obraz uchun mukammal bichimlar</p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
          >
            <span>{t('view_all')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Responsive Grid: 2 on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={() => onSelectCategory(category.slug)}
            />
          ))}
        </div>
      </section>

      {/* Featured Runway Products */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight uppercase">
              {t('featured_title')}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">Eng ko‘p tanlangan va ommabop premium liboslar</p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
          >
            <span>{t('view_all')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Responsive Product Grid: 2 on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Luxury Brand Trust Badges */}
      <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-950/80 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Tezkor Yetkazib Berish</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Toshkent bo‘ylab 24 soatda, viloyatlarga 2 kunda</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">100% Sifat Kafolati</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Faqat original matolar va eksklyuziv bichimlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <RefreshCw size={22} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Oson O‘lcham Tanlash</h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">O‘lcham to‘g‘ri kelmasa 3 kunda bepul almashtirish</p>
          </div>
        </div>
      </section>
    </div>
  );
}
