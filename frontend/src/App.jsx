import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import DevToolbar from './components/DevToolbar.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import OrderConfirmationModal from './components/OrderConfirmationModal.jsx';

import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Favorites from './pages/Favorites.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import { useTelegram } from './context/TelegramContext.jsx';
import { useCart } from './context/CartContext.jsx';
import { api } from './services/api.js';

export default function App() {
  const { isReady } = useTelegram();
  const { setIsCheckoutOpen } = useCart();

  const [activeTab, setActiveTab] = useState('store'); // 'store', 'catalog', 'favorites', 'orders', 'profile', 'admin'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recentPlacedOrder, setRecentPlacedOrder] = useState(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);
      setCategories(catsRes.data || []);
      setProducts(prodsRes.data || []);
    } catch (err) {
      console.warn('Initial data load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-gold-500 selection:text-black">
      {/* Dev / Preview Banner outside Telegram */}
      <DevToolbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Top Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 mb-16 md:mb-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
              Grant Luxury Collection yuklanmoqda...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'store' && (
              <Home
                categories={categories}
                products={products}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onSelectCategory={handleSelectCategory}
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'catalog' && (
              <Catalog
                categories={categories}
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {activeTab === 'favorites' && (
              <Favorites
                onSelectProduct={(p) => setSelectedProduct(p)}
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'orders' && (
              <Orders
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'profile' && (
              <Profile />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                categories={categories}
                onProductsChanged={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        onOrderSuccess={(orderData) => {
          setRecentPlacedOrder(orderData);
        }}
      />

      {/* Order Confirmation Screen */}
      {recentPlacedOrder && (
        <OrderConfirmationModal
          order={recentPlacedOrder}
          onClose={() => setRecentPlacedOrder(null)}
          onViewOrders={() => setActiveTab('orders')}
        />
      )}

      {/* Native Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
