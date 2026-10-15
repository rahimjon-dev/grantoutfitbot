import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, ShoppingBag, Package, DollarSign,
  Plus, Edit, Trash2, Send, CheckCircle2, AlertCircle,
  Truck, Search, Clock, Check, X, Eye, FileText, ChevronRight
} from 'lucide-react';
import { formatUzs, formatDate } from '../utils/formatters.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';

export default function AdminDashboard({ categories, onProductsChanged }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products', 'users', 'broadcast'

  // Data states
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Selected Order for detail & status modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // New/Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name_en: '',
    name_uz: '',
    name_ru: '',
    category_id: categories[0]?.id || '',
    base_price_uzs: 250000,
    discount_price_uzs: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    size: 'M',
    color_name: 'Onyx Black',
    stock_quantity: 20
  });

  // Broadcast campaign state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [broadcastLang, setBroadcastLang] = useState('all');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Load initial dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminUsers()
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Failed loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update order status with tracking & dispatch notes
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdatingOrder(true);
    try {
      const updated = await api.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        trackingNumber: trackingNumber.trim() || undefined,
        dispatchNotes: dispatchNotes.trim() || undefined
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updated.data } : o))
      );
      setSelectedOrder(null);
      // Reload stats
      api.getAdminStats().then((res) => setStats(res.data));
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: productForm.id || undefined,
        category_id: productForm.category_id || categories[0]?.id,
        name_en: productForm.name_en,
        name_uz: productForm.name_uz || productForm.name_en,
        name_ru: productForm.name_ru || productForm.name_en,
        description_uz: productForm.description_uz || 'Premium sifat',
        description_ru: productForm.description_ru || 'Премиальное качество',
        description_en: productForm.description_en || 'Luxury quality',
        base_price_uzs: parseInt(productForm.base_price_uzs, 10),
        discount_price_uzs: productForm.discount_price_uzs ? parseInt(productForm.discount_price_uzs, 10) : null,
        is_featured: productForm.is_featured,
        is_active: true,
        images: [{ image_url: productForm.image_url, is_primary: true }],
        variants: [
          {
            id: `v-${Date.now()}`,
            size: productForm.size,
            color_name: productForm.color_name,
            color_hex: '#111111',
            stock_quantity: parseInt(productForm.stock_quantity, 10)
          }
        ]
      };

      await api.saveProduct(payload);
      setIsProductModalOpen(false);
      if (onProductsChanged) onProductsChanged();
      alert('Mahsulot muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert(err.message || 'Mahsulotni saqlashda xatolik');
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const res = await api.sendBroadcast({
        message: broadcastMessage.trim(),
        imageUrl: broadcastImage.trim() || null,
        targetLanguage: broadcastLang
      });
      setBroadcastResult(res.data);
      setBroadcastMessage('');
    } catch (err) {
      alert(err.message || 'Xabar yuborishda xatolik');
    } finally {
      setBroadcastSending(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchSearch =
      !orderSearch.trim() ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone_number?.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      String(u.telegram_id).includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.phone_number?.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 bg-[#0c0d12] text-zinc-100 p-4 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            GRANT FASHION DO‘KON BOSHQARUVI
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          {[
            { id: 'overview', label: 'Umumiy' },
            { id: 'orders', label: 'Buyurtmalar' },
            { id: 'products', label: 'Mahsulotlar' },
            { id: 'users', label: 'Mijozlar' },
            { id: 'broadcast', label: 'Xabarnoma' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#121216] p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Jami Daromad</span>
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                {formatUzs(stats?.totalRevenueUzs || 0)}
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium">Barcha to‘langan buyurtmalar</p>
            </div>

            <div className="bg-[#121216] p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Jami Buyurtmalar</span>
                <Package size={18} className="text-amber-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                {stats?.totalOrders || 0}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                {stats?.pendingOrders || 0} ta kutilayotgan
              </p>
            </div>

            <div className="bg-[#121216] p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Foydalanuvchilar</span>
                <Users size={18} className="text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                {stats?.totalUsers || 0}
              </h3>
              <p className="text-[11px] text-blue-400 font-medium">
                +{stats?.newUsersToday || 0} ta bugun yangi
              </p>
            </div>

            <div className="bg-[#121216] p-4 sm:p-5 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Mavjud Mahsulotlar</span>
                <ShoppingBag size={18} className="text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                {stats?.availableProducts || 0}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">6 ta kategoriya bo‘yicha</p>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-[#121216] p-5 rounded-3xl border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Eng Ko‘p Sotilgan Liboslar
            </h3>
            <div className="space-y-3">
              {(stats?.topSellingProducts || []).map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-amber-400 text-sm">
                      #{idx + 1}
                    </span>
                    {prod.image && (
                      <img src={prod.image} alt={prod.name} className="w-10 h-12 object-cover rounded-lg" />
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-white">{prod.name}</h4>
                      <p className="text-[11px] text-zinc-400">{prod.sales} dona sotilgan</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {formatUzs(prod.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buyurtma kodi, ism yoki telefon raqami..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">Barcha holatlar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="confirmed">Tasdiqlangan</option>
              <option value="processing">Tayyorlanmoqda</option>
              <option value="shipped">Yetkazilmoqda (Yo‘lda)</option>
              <option value="delivered">Yetkazilgan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>

          {/* Orders Table / List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="text-center py-12 text-zinc-500 text-xs">Buyurtmalar topilmadi</p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#121216] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {order.customer_name} • <span className="text-zinc-400 font-normal">{order.phone_number}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-md">
                      📍 {order.delivery_address} ({order.delivery_city})
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {formatUzs(order.total_amount_uzs)}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setTrackingNumber(order.tracking_number || '');
                        setDispatchNotes(order.dispatch_notes || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span>Boshqarish</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Do‘kon Mahsulotlari
            </h3>
            <button
              onClick={() => {
                setProductForm({
                  id: '',
                  name_en: '',
                  name_uz: '',
                  name_ru: '',
                  category_id: categories[0]?.id || '',
                  base_price_uzs: 250000,
                  discount_price_uzs: '',
                  description_uz: '',
                  description_ru: '',
                  description_en: '',
                  is_featured: false,
                  image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
                  size: 'M',
                  color_name: 'Onyx Black',
                  stock_quantity: 20
                });
                setIsProductModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus size={16} />
              <span>Yangi Mahsulot Qo‘shish</span>
            </button>
          </div>

          {/* Product cards list */}
          <div className="bg-[#121216] rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06]">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Bo‘lim: {cat.name_uz}
                </h4>
                <p className="text-[11px] text-zinc-400">{cat.description_uz}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Telegram ID, ism yoki username..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none"
            />
          </div>

          <div className="bg-[#121216] rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="p-3 bg-zinc-950 border-b border-white/5 grid grid-cols-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <span className="col-span-2">Mijoz</span>
              <span>Telefon</span>
              <span className="text-right">Til</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <p className="p-6 text-center text-xs text-zinc-500">Mijozlar topilmadi</p>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id || u.telegram_id} className="p-3 grid grid-cols-4 items-center text-xs text-zinc-300">
                    <div className="col-span-2">
                      <span className="font-semibold text-white block">
                        {u.first_name} {u.last_name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {u.username ? `@${u.username}` : `ID: ${u.telegram_id}`}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {u.phone_number || '—'}
                    </span>
                    <span className="text-right uppercase font-semibold text-amber-400 text-[11px]">
                      {u.language_code || 'uz'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl mx-auto bg-[#121216] p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Bot Foydalanuvchilariga Xabarnoma Yuborish
          </h3>
          <p className="text-xs text-zinc-400">
            Aksiya va e’lonlarni bot a’zolariga xavfsiz va tezkor jo‘natish
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Auditoriya tili</label>
              <select
                value={broadcastLang}
                onChange={(e) => setBroadcastLang(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">Barcha foydalanuvchilar</option>
                <option value="uz">Faqat O‘zbekcha (UZ)</option>
                <option value="ru">Faqat Ruscha (RU)</option>
                <option value="en">Faqat Inglizcha (EN)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Rasm havolasi (ixtiyoriy)</label>
              <input
                type="url"
                value={broadcastImage}
                onChange={(e) => setBroadcastImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Xabar matni *</label>
              <textarea
                required
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Bugun barcha xudilarga 20% maxsus chegirma! Do‘konga kirib ko‘ring..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            {broadcastResult && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-1">
                <p className="font-bold">Xabarnoma muvaffaqiyatli yakunlandi!</p>
                <p>Yetkazildi: {broadcastResult.delivered} ta | Xatolik: {broadcastResult.failed} ta</p>
              </div>
            )}

            <button
              type="submit"
              disabled={broadcastSending}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Send size={16} />
              <span>{broadcastSending ? 'Yuborilmoqda...' : 'Xabarni Jo‘natish'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ORDER DETAIL & STATUS DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Buyurtma tafsilotlari</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl space-y-1">
                <p className="text-zinc-400">Mijoz: <strong className="text-white">{selectedOrder.customer_name}</strong></p>
                <p className="text-zinc-400">Telefon: <strong className="text-white">{selectedOrder.phone_number}</strong></p>
                <p className="text-zinc-400">Manzil: <strong className="text-white">{selectedOrder.delivery_address}</strong></p>
                {selectedOrder.delivery_notes && (
                  <p className="text-zinc-400 italic">Izoh: "{selectedOrder.delivery_notes}"</p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedOrder.items || []).map((i, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                    <span>{i.product_name} ({i.selected_size}/{i.selected_color}) x {i.quantity}</span>
                    <span className="font-bold text-white">{formatUzs(i.total_price_uzs)}</span>
                  </div>
                ))}
              </div>

              {/* Status Updater Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-zinc-400 block mb-1">Buyurtma holatini yangilash</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="pending">Kutilmoqda</option>
                    <option value="confirmed">Tasdiqlash (Confirmed)</option>
                    <option value="processing">Tayyorlash (Processing)</option>
                    <option value="shipped">Yetkazilmoqda (Shipped)</option>
                    <option value="delivered">Yetkazildi (Delivered)</option>
                    <option value="cancelled">Bekor qilish (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Kuryer trek-kodi (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="TRK-98421"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Kuryer va yetkazish xabari</label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Kuryer soat 14:00 da yetib boradi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingOrder}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {updatingOrder ? 'Saqlanmoqda...' : 'Holatni Yangilash & Mijozga Xabar Yuborish'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Yangi Libos Qo‘shish</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-zinc-400 block mb-1">Mahsulot nomi (EN / Global) *</label>
                <input
                  type="text"
                  required
                  value={productForm.name_en}
                  onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                  placeholder="Architectural Oversized Jacket"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Bo‘lim (Category) *</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_uz} ({c.name_en})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Asosiy narx (UZS) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.base_price_uzs}
                    onChange={(e) => setProductForm({ ...productForm, base_price_uzs: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Chegirma narxi (UZS)</label>
                  <input
                    type="number"
                    value={productForm.discount_price_uzs}
                    onChange={(e) => setProductForm({ ...productForm, discount_price_uzs: e.target.value })}
                    placeholder="Ixtiyoriy"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Rasm havolasi (URL) *</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">O‘lcham</label>
                  <input
                    type="text"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Rang</label>
                  <input
                    type="text"
                    value={productForm.color_name}
                    onChange={(e) => setProductForm({ ...productForm, color_name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Soni (Stock)</label>
                  <input
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-white cursor-pointer">Bosh sahifada tavsiya etilgan qilib ko‘rsatish</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition-all"
              >
                Mahsulotni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
