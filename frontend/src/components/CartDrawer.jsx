import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, deliveryFee, total, setIsCheckoutOpen } = useCart();
  const { t, getLocalizedField } = useLanguage();

  if (!isOpen) return null;

  const freeDeliveryThreshold = 500000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleProceedCheckout = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        onClick={() => setIsOpen(false)}
        className="absolute inset-0"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121216] border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-gold-400" />
              <h2 className="text-base font-bold text-white tracking-wide uppercase">
                {t('cart_title')} ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-4 py-3 bg-zinc-900/60 border-b border-white/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles size={13} className="text-gold-400" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-400 font-semibold">Yetkazib berish bepul!</span>
                ) : (
                  <span>
                    Yana <strong className="text-white">{formatUzs(remainingForFree)}</strong> bepul yetkazish uchun
                  </span>
                )}
              </span>
              <span className="font-bold text-gold-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gold-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-base font-semibold text-white">{t('cart_empty')}</h3>
                <p className="text-xs text-zinc-400 max-w-xs">{t('cart_empty_sub')}</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Xarid qilishni boshlash
                </button>
              </div>
            ) : (
              items.map((item) => {
                const name = getLocalizedField(item.product, 'name');
                const price = (item.product?.discount_price_uzs || item.product?.base_price_uzs || 0) + (item.variant?.additional_price_uzs || 0);
                const itemTotal = price * item.quantity;
                const img = item.product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80';

                return (
                  <div
                    key={item.variantId}
                    className="flex gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-white/[0.06] relative"
                  >
                    {/* Thumbnail */}
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover rounded-xl bg-zinc-950 flex-shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{name}</h4>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                            {item.variant?.size}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                            {item.variant?.color_name}
                          </span>
                        </div>
                      </div>

                      {/* Price and Counter Row */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{formatUzs(itemTotal)}</span>

                        {/* Stepper */}
                        <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-white/[0.08] bg-zinc-950/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>{t('cart_subtotal')}</span>
                  <span className="text-white font-medium">{formatUzs(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t('cart_delivery')}</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">{t('cart_delivery_free')}</span>
                    ) : (
                      formatUzs(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/[0.08] text-white">
                  <span>{t('cart_total')}</span>
                  <span className="text-base text-gold-400">{formatUzs(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
              >
                <span>{t('checkout_btn')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
