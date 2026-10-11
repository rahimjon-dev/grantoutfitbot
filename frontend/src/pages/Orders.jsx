import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, Truck, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { formatUzs, formatDate } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';

export default function Orders({ onNavigateToCatalog }) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Buyurtmalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            {t('orders_title')}
          </h1>
          <p className="text-xs text-zinc-400">Buyurtmalaringiz holati va yetkazilish tafsilotlari</p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Buyurtmalar yuklanmoqda...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Package size={32} />
          </div>
          <h3 className="text-base font-bold text-white">{t('orders_empty')}</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Hozircha sizda faol buyurtmalar yo‘q. Do‘konimizdagi yangi kiyimlarni ko‘zdan kechiring!
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold transition-all shadow-lg shadow-gold-500/20"
          >
            Katalogga o‘tish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items || [];
            return (
              <div
                key={order.id}
                className="bg-[#121216] rounded-2xl border border-white/[0.08] overflow-hidden p-4 sm:p-5 space-y-4 transition-all hover:border-white/20"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                      {t('order_no')}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {order.order_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 hidden sm:inline">
                      {formatDate(order.created_at)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-white/5">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-12 h-14 object-cover rounded-lg bg-zinc-900 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {item.selected_size} • {item.selected_color} • {item.quantity} dona
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white">
                          {formatUzs(item.total_price_uzs)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Dispatch Notes (If Provided by Admin) */}
                {(order.tracking_number || order.dispatch_notes) && (
                  <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs space-y-1">
                    {order.tracking_number && (
                      <div className="flex items-center gap-1.5 text-gold-300">
                        <Truck size={14} />
                        <span>Kuryer trek-kodi: <strong className="font-mono text-white">{order.tracking_number}</strong></span>
                      </div>
                    )}
                    {order.dispatch_notes && (
                      <p className="text-zinc-300 italic">
                        "{order.dispatch_notes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Footer Details */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <MapPin size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="truncate max-w-xs">{order.delivery_address} ({order.delivery_city})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-400 mr-2">Jami to‘lov:</span>
                    <span className="text-sm font-extrabold text-gold-400">
                      {formatUzs(order.total_amount_uzs)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
