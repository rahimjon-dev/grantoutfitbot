import React, { useState, useEffect } from 'react';
import { X, Heart, Check, Sparkles, Ruler, Droplets, Feather, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const fallbackImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  
  // Luxury curated alternate photos for gallery simulation if product only has 1 image
  const defaultGallery = [
    product?.images?.[0]?.image_url || fallbackImg,
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  ];

  const rawImages = product?.images?.length && product.images.length > 1
    ? product.images.map((i) => i.image_url)
    : defaultGallery;
  
  const [images, setImages] = useState(rawImages);

  const variants = product?.variants || [];
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color_name)));

  const standardSizes = sizes.length ? sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
    else if (!sizes.length) setSelectedSize('M');

    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
    else if (!colors.length) setSelectedColor('Beige');

    setActiveImageIndex(0);
    setQuantity(1);
    setImages(product?.images?.length && product.images.length > 1 ? product.images.map((i) => i.image_url) : defaultGallery);
  }, [product]);

  if (!product) return null;

  const activeVariant = variants.find(
    (v) => v.size === selectedSize && v.color_name === selectedColor
  ) || variants[0];

  const currentStock = activeVariant?.stock_quantity ?? 5;
  const isOutOfStock = currentStock <= 0;

  const hasDiscount = Boolean(product.discount_price_uzs && product.discount_price_uzs < product.base_price_uzs);
  const unitPrice = (hasDiscount ? product.discount_price_uzs : product.base_price_uzs) + (activeVariant?.additional_price_uzs || 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, activeVariant || { id: `synth-${product.id}`, size: selectedSize, color_name: selectedColor }, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const name = getLocalizedField(product, 'name');
  const description = getLocalizedField(product, 'description') || 'Designed with precision tailoring and pure comfort in mind, providing a casual luxury look without compromising on style.';
  const favorited = isFavorite(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative my-auto max-h-[94vh] flex flex-col md:flex-row"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-xs"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* LEFT COLUMN: Gallery with Vertical Thumbnails (Image 1 Style) */}
        <div className="w-full md:w-1/2 bg-[#f4f5f7] flex p-3 sm:p-5 gap-2.5 sm:gap-4 relative overflow-hidden">
          {/* Vertical Thumbnail Strip */}
          <div className="flex flex-col gap-2 z-10 overflow-y-auto py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-12 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all bg-white shadow-xs ${
                  activeImageIndex === idx 
                    ? 'border-slate-900 ring-2 ring-slate-900/10 scale-95' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Large Main Product Photo */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-xs">
            <img
              src={images[activeImageIndex] || fallbackImg}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() => {
                const newArr = [...images];
                newArr[activeImageIndex] = fallbackImg;
                setImages(newArr);
              }}
              className="w-full h-full object-cover object-center max-h-[380px] sm:max-h-[520px]"
            />

            {/* Mobile Prev / Next Buttons */}
            {images.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:hidden">
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-800 pointer-events-auto"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-800 pointer-events-auto"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Editorial Product Info & Controls (Image 1 Style) */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-[620px] bg-white">
          <div className="space-y-4 sm:space-y-5">
            {/* NEW Badge & Category */}
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                NEW
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {getLocalizedField(product.category, 'name') || 'GRANT Fashion'}
              </span>
            </div>

            {/* Product Title (Image 1 typography) */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                {description}
              </p>
            </div>

            {/* Price (Image 1 style) */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatUzs(unitPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  {formatUzs(product.base_price_uzs)}
                </span>
              )}
            </div>

            {/* COLOR Swatches (Image 1 Style) */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                COLOR: <span className="font-semibold text-slate-600">{selectedColor.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {(colors.length ? colors : ['Beige', 'Black', 'Olive']).map((c) => {
                  const variantObj = variants.find((v) => v.color_name === c);
                  const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                  
                  // Color hex fallbacks
                  const colorHex = variantObj?.color_hex || (
                    c.toLowerCase().includes('beige') ? '#e6decb' :
                    c.toLowerCase().includes('black') ? '#1e293b' :
                    c.toLowerCase().includes('olive') ? '#556b2f' :
                    c.toLowerCase().includes('white') ? '#f8fafc' : '#94a3b8'
                  );

                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full p-0.5 transition-all flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105'
                      }`}
                    >
                      <span 
                        className="w-full h-full rounded-full border border-slate-300 shadow-2xs block"
                        style={{ backgroundColor: colorHex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE Pills with SIZE GUIDE (Image 1 Style) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  SIZE: <span className="font-semibold text-slate-600">{selectedSize}</span>
                </span>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 uppercase tracking-wider underline transition-colors"
                >
                  <Ruler size={12} />
                  <span>SIZE GUIDE</span>
                </button>
              </div>

              {/* Size Guide Drawer / Alert */}
              {showSizeGuide && (
                <div className="p-3 mb-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1 animate-fade-in">
                  <div className="font-bold text-slate-900">O‘lchamlar bo‘yicha qo‘llanma:</div>
                  <div className="grid grid-cols-4 gap-1 pt-1 text-center font-mono">
                    <span className="bg-white p-1 rounded border">S: 46-48</span>
                    <span className="bg-white p-1 rounded border">M: 48-50</span>
                    <span className="bg-white p-1 rounded border">L: 50-52</span>
                    <span className="bg-white p-1 rounded border">XL: 52-54</span>
                  </div>
                </div>
              )}

              {/* Size Pill Buttons */}
              <div className="flex flex-wrap gap-2">
                {standardSizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-10 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Row: ADD TO CART + Wishlist (Image 1 Style) */}
            <div className="pt-2 flex items-center gap-3">
              {/* Wide Black Pill Button with Dot and Stock badge */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 rounded-full py-3.5 px-6 font-bold flex items-center justify-between text-xs sm:text-sm shadow-md transition-all active:scale-98 ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${addedAnimation ? 'bg-white' : 'bg-white/90 animate-pulse'}`} />
                  <span>{addedAnimation ? 'Qo‘shildi!' : 'ADD TO CART'}</span>
                </div>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                  {isOutOfStock ? 'OUT OF STOCK' : currentStock <= 3 ? 'LOW STOCK' : 'IN STOCK'}
                </span>
              </button>

              {/* Heart Wishlist Button */}
              <button
                onClick={() => toggleFavorite(product)}
                className="w-12 h-12 rounded-full border border-slate-300 hover:border-slate-500 flex items-center justify-center text-slate-700 transition-colors shadow-2xs"
                aria-label="Wishlist"
              >
                <Heart size={20} className={favorited ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            {/* TECHNICAL FEATURES (Image 1 Style) */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                TECHNICAL FEATURES:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                  <Droplets size={15} className="text-blue-600" />
                  <span className="text-[11px] font-semibold">GARMENT DYED</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                  <Feather size={15} className="text-blue-600" />
                  <span className="text-[11px] font-semibold">100% ORGANIC COTTON</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                  <ShieldCheck size={15} className="text-blue-600" />
                  <span className="text-[11px] font-semibold">PREMIUM TAILORING</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                  <Truck size={15} className="text-blue-600" />
                  <span className="text-[11px] font-semibold">EXPRESS DISPATCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
