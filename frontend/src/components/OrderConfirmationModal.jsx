import React from 'react';
import { CheckCircle, Package, ArrowRight, Sparkles } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function OrderConfirmationModal({ order, onClose, onViewOrders }) {
  const { t } = useLanguage();
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#121216] border border-white/10 rounded-3xl p-6 text-center space-y-5 shadow-2xl relative"
      >
        {/* Animated Celebration Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle size={44} className="animate-bounce" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-semibold mb-2">
            <Sparkles size={13} />
            <span>Xarid uchun rahmat!</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('order_success_title')}
          </h2>
          <p className="text-xs text-zinc-300 mt-2 max-w-xs mx-auto">
            {t('order_success_msg', { orderNumber: order.order_number })}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-300">Buyurtma kodi:</span>
            <span className="font-mono font-bold text-white">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Qabul qiluvchi:</span>
            <span className="font-semibold text-white">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Yetkazish manzili:</span>
            <span className="font-semibold text-white truncate max-w-[180px]">{order.delivery_address}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
            <span className="text-zinc-200">Jami to‘lov:</span>
            <span className="text-gold-400 font-extrabold">{formatUzs(order.total_amount_uzs)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              if (onViewOrders) onViewOrders();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
          >
            <Package size={16} />
            <span>{t('view_my_orders')}</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}
