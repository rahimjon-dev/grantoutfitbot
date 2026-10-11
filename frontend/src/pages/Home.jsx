import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Home({ categories, products, onSelectProduct, onSelectCategory, onNavigateToCatalog }) {
  const { t } = useLanguage();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 6);

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* Editorial Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] min-h-[340px] border border-white/10 flex items-end p-6 sm:p-12 shadow-2xl">
        {/* Background Image with Parallax Vibe */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt="Luxury Fashion"
          className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.7] contrast-105"
        />

        {/* Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-gold-400 text-[11px] font-bold tracking-widest uppercase">
            <Sparkles size={12} />
            <span>KUZ-QISH 2026/2027</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md font-medium">
            {t('hero_subtitle')}
          </p>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onNavigateToCatalog}
              className="py-3 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-gold-500/20 transition-all hover:scale-[1.02]"
            >
              <span>{t('hero_cta')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 6 Fashion Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
              {t('categories_title')}
            </h2>
            <p className="text-xs text-zinc-400">Har bir obraz uchun mukammal bichimlar</p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
          >
            <span>{t('view_all')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
              {t('featured_title')}
            </h2>
            <p className="text-xs text-zinc-400">Eng ko‘p tanlangan va ommabop premium liboslar</p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
          >
            <span>{t('view_all')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Luxury Brand Trust Badges */}
      <section className="p-6 rounded-3xl bg-zinc-950/80 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Tezkor Yetkazib Berish</h4>
            <p className="text-[11px] text-zinc-400">Toshkent bo‘ylab 24 soatda, viloyatlarga 2 kunda</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">100% Sifat Kafolati</h4>
            <p className="text-[11px] text-zinc-400">Faqat original matolar va eksklyuziv bichimlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-gold-400 flex-shrink-0">
            <RefreshCw size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Oson O‘lcham Tanlash</h4>
            <p className="text-[11px] text-zinc-400">O‘lcham to‘g‘ri kelmasa 3 kunda bepul almashtirish</p>
          </div>
        </div>
      </section>
    </div>
  );
}
