import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../data/fallbackData.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData;

  if (initData) {
    headers['x-telegram-init-data'] = initData;
  } else if (import.meta.env.DEV) {
    // Only in local development mode outside Telegram
    const mockUser = localStorage.getItem('grant_dev_user');
    if (mockUser) {
      try {
        const parsed = JSON.parse(mockUser);
        if (parsed.id) headers['x-mock-telegram-id'] = String(parsed.id);
        if (parsed.first_name) headers['x-mock-first-name'] = parsed.first_name;
        if (parsed.last_name) headers['x-mock-last-name'] = parsed.last_name;
        if (parsed.isAdmin) {
          headers['x-dev-admin'] = 'true';
        }
      } catch (_) {}
    }
  }

  // Only send x-admin-key if explicitly stored by an authenticated admin
  const adminToken = localStorage.getItem('grant_admin_token') || sessionStorage.getItem('grant_admin_token');
  if (adminToken) {
    headers['x-admin-key'] = adminToken;
  }

  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = typeof data === 'object' ? (data.message || data.error) : data;
      throw new Error(msg || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API Request notice on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Catalog
  getCategories: async () => {
    try {
      return await request('/products/categories');
    } catch (_) {
      return { success: true, data: FALLBACK_CATEGORIES };
    }
  },
  getProducts: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await request(`/products${query ? `?${query}` : ''}`);
    } catch (_) {
      let list = [...FALLBACK_PRODUCTS];
      if (params.category) {
        list = list.filter(p => p.category_slug === params.category || p.category_id === params.category);
      }
      return { success: true, data: list };
    }
  },
  getProductById: async (id) => {
    try {
      return await request(`/products/${id}`);
    } catch (_) {
      const found = FALLBACK_PRODUCTS.find(p => p.id === id || p.slug === id);
      if (found) return { success: true, data: found };
      throw new Error('Product not found');
    }
  },

  // Cart
  getCart: async () => {
    try {
      return await request('/orders/cart');
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('grant_cart_items') || '[]');
      return { success: true, data: local };
    }
  },
  addToCart: (productId, variantId, quantity = 1) =>
    request('/orders/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity })
    }).catch(() => ({ success: true })),
  updateCartItem: (variantId, quantity) =>
    request(`/orders/cart/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }).catch(() => ({ success: true })),
  removeFromCart: (variantId) =>
    request(`/orders/cart/${variantId}`, {
      method: 'DELETE'
    }).catch(() => ({ success: true })),

  // Orders
  createOrder: async (payload) => {
    try {
      return await request('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const fallbackOrder = {
        id: `local-${Date.now()}`,
        order_number: orderNumber,
        customer_name: payload.customerName,
        phone_number: payload.phoneNumber,
        delivery_address: payload.deliveryAddress,
        delivery_city: payload.deliveryCity || 'Tashkent',
        payment_method: payload.paymentMethod,
        total_amount_uzs: payload.items?.reduce((sum, i) => sum + (i.unit_price_uzs * i.quantity || 0), 0) || 450000,
        status: 'pending',
        created_at: new Date().toISOString(),
        items: payload.items || []
      };
      const existing = JSON.parse(localStorage.getItem('grant_my_orders') || '[]');
      localStorage.setItem('grant_my_orders', JSON.stringify([fallbackOrder, ...existing]));
      return { success: true, data: fallbackOrder };
    }
  },
  getMyOrders: async () => {
    try {
      return await request('/orders/my');
    } catch (_) {
      const local = JSON.parse(localStorage.getItem('grant_my_orders') || '[]');
      return { success: true, data: local };
    }
  },
  getOrderById: (id) => request(`/orders/${id}`),

  // Profile
  getProfile: async () => {
    try {
      return await request('/users/profile');
    } catch (_) {
      return { success: false, data: null };
    }
  },
  updateProfile: (profile) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }).catch(() => ({ success: true })),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderId, payload) =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  saveProduct: (productData) =>
    request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),
  deleteProduct: (id) =>
    request(`/admin/products/${id}`, {
      method: 'DELETE'
    }),
  saveCategory: (categoryData) =>
    request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    }),
  deleteCategory: (id) =>
    request(`/admin/categories/${id}`, {
      method: 'DELETE'
    }),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  sendBroadcast: (broadcastData) =>
    request('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    }),
  setAdminToken: (token) => {
    if (token) {
      localStorage.setItem('grant_admin_token', token);
    } else {
      localStorage.removeItem('grant_admin_token');
    }
  },
  getAdminToken: () => localStorage.getItem('grant_admin_token')
};
