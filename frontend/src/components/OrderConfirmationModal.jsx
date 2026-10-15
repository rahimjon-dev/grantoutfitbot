import React from 'react';
import { CheckCircle2, Package, ArrowRight, Sparkles, ThumbsUp } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function OrderConfirmationModal({ order, onClose, onViewOrders }) {
  const { t } = useLanguage();
  if (!order) return null;

  // Delivery estimation (24h)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deliveryDateStr = tomorrow.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-2xl relative my-auto"
      >
        {/* Celebration Illustration (Image 2 style) */}
        <div className="mx-auto w-22 h-22 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs relative">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
            <ThumbsUp size={28} />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
            🎉
          </span>
        </div>

        <div>
          {/* Green Checkmark & Title (Image 2 Style) */}
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-lg sm:text-xl">
            <CheckCircle2 size={22} className="fill-emerald-600 text-white" />
            <span>Thank you for Purchase!</span>
          </div>

          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
            Buyurtmangiz muvaffaqiyatli qabul qilindi va kuryerga tayyorlanmoqda.
          </p>
        </div>

        {/* Your Delivery Dates Card (Image 2 Style) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Your Delivery Dates:
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Taxminiy yetkazish:</span>
            <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full">
              {deliveryDateStr}, 18:00 gacha
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Buyurtma kodi:</span>
            <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Jami to‘lov:</span>
            <span className="font-bold text-slate-900">{formatUzs(order.total_amount_uzs)}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          For more details, track your delivery status under <strong>My Profile &gt; My Orders</strong>
        </p>

        {/* Action Buttons (Image 2 Style: View Order & Blue Continue Shopping) */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClose();
              if (onViewOrders) onViewOrders();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Package size={15} />
            <span>View Order</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}
