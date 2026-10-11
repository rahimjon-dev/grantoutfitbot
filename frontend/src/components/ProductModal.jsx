import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function ProductModal({ product, onClose, onBuyNow }) {
  const { getLocalizedField, t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const fallbackImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const rawImages = product?.images?.length
    ? product.images.map((i) => i.image_url)
    : [fallbackImg];
  
  const [images, setImages] = useState(rawImages);

  const variants = product?.variants || [];
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color_name)));

  useEffect(() => {
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
    setActiveImageIndex(0);
    setQuantity(1);
    setImages(product?.images?.length ? product.images.map((i) => i.image_url) : [fallbackImg]);
  }, [product]);

  if (!product) return null;

  const activeVariant = variants.find(
    (v) => v.size === selectedSize && v.color_name === selectedColor
  ) || variants[0];

  const currentStock = activeVariant?.stock_quantity ?? 0;
  const isOutOfStock = currentStock <= 0;

  const hasDiscount = Boolean(product.discount_price_uzs && product.discount_price_uzs < product.base_price_uzs);
  const unitPrice = (hasDiscount ? product.discount_price_uzs : product.base_price_uzs) + (activeVariant?.additional_price_uzs || 0);

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;
    addToCart(product, activeVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    if (!activeVariant || isOutOfStock) return;
    addToCart(product, activeVariant, quantity);
    onClose();
    if (onBuyNow) onBuyNow();
  };

  const name = getLocalizedField(product, 'name');
  const description = getLocalizedField(product, 'description');
  const favorited = isFavorite(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#121216] border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-gold-400">
            {getLocalizedField(product.category, 'name') || 'GRANT Fashion'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(product)}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={18} className={favorited ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Responsive Content Body: 1 col on mobile, 2 col on tablet/desktop */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                <img
                  src={images[activeImageIndex] || fallbackImg}
                  alt={name}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    const newArr = [...images];
                    newArr[activeImageIndex] = fallbackImg;
                    setImages(newArr);
                  }}
                  className="w-full h-full object-cover object-center"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-gold-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Selection Column */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {name}
                </h2>
                <div className="mt-2.5 flex items-baseline gap-3">
                  <span className="text-xl sm:text-2xl font-black text-white">{formatUzs(unitPrice)}</span>
                  {hasDiscount && (
                    <span className="text-xs sm:text-sm text-zinc-400 line-through">
                      {formatUzs(product.base_price_uzs)}
                    </span>
                  )}
                </div>
              </div>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    {t('size')}: <span className="text-white font-bold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                          selectedSize === s
                            ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    {t('color')}: <span className="text-white font-bold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const variantObj = variants.find((v) => v.color_name === c);
                      const isSelected = selectedColor === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-gold-500 bg-gold-500/10 text-white'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: variantObj?.color_hex || '#333' }}
                          />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock & Quantity */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div>
                  <span className="text-xs text-zinc-400 block mb-0.5">Mavjudlik:</span>
                  {isOutOfStock ? (
                    <span className="text-xs font-semibold text-rose-400">{t('out_of_stock')}</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400">
                      {t('in_stock')} ({currentStock} dona)
                    </span>
                  )}
                </div>

                {!isOutOfStock && (
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-white/[0.06]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t('description')}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-zinc-950/90 flex gap-2.5 sm:gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {addedAnimation ? <Check size={18} /> : <ShoppingBag size={18} />}
            <span>{addedAnimation ? 'Qo‘shildi!' : t('add_to_cart')}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-500/20 active:scale-95'
            }`}
          >
            <Zap size={18} />
            <span>{t('buy_now')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
