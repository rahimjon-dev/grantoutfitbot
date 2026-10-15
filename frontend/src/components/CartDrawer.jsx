import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, MapPin, CreditCard, Sparkles, ChevronRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        onClick={() => setIsOpen(false)}
        className="absolute inset-0"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-100 flex flex-col shadow-2xl">
          {/* Header (Image 2 My Cart style) */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  My Cart
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">{items.length} items</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Sparkles size={13} className="text-blue-600" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-600 font-bold">Yetkazib berish bepul!</span>
                ) : (
                  <span>
                    Yana <strong className="text-slate-900">{formatUzs(remainingForFree)}</strong> bepul yetkazish uchun
                  </span>
                )}
              </span>
              <span className="font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List (Image 2 Style) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={30} />
                </div>
                <h3 className="text-base font-bold text-slate-800">{t('cart_empty')}</h3>
                <p className="text-xs text-slate-400 max-w-xs">{t('cart_empty_sub')}</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
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
                    className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs relative"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-22 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between pr-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{name}</h4>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                            {item.variant?.size || 'Standard'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {item.variant?.color_name || 'Original'}
                          </span>
                        </div>
                      </div>

                      {/* Price and Counter Row */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{formatUzs(itemTotal)}</span>

                        {/* Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shadow-2xs"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors p-1"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}

            {/* Image 2 Address & Payment Summary Cards */}
            {items.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {/* Shipping Address Card (Image 2 style) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Shipping Address</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">Tashkent, Uzbekistan</div>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedCheckout}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 bg-white"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Method Card (Image 2 style) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Payment Method</div>
                      <div className="text-[10px] text-slate-500">Naqd / Karta / Click</div>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedCheckout}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 bg-white"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary & Big Blue Confirm Button (Image 2 Style) */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Total Price ({items.length} items):</span>
                  <span className="text-slate-800 font-semibold">{formatUzs(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('cart_delivery')}</span>
                  <span className="text-slate-800 font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">{t('cart_delivery_free')}</span>
                    ) : (
                      formatUzs(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100 text-slate-900">
                  <span>{t('cart_total')}</span>
                  <span className="text-blue-600 font-extrabold">{formatUzs(total)}</span>
                </div>
              </div>

              {/* Big Blue CTA (Image 2 Style) */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-98 transition-all"
              >
                <span>Confirm your purchase</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
