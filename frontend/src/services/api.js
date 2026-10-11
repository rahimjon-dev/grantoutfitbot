const API_BASE = '/api';

export function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData;

  if (initData) {
    headers['x-telegram-init-data'] = initData;
  } else {
    // In dev / outside telegram simulation
    const mockUser = localStorage.getItem('grant_dev_user');
    if (mockUser) {
      try {
        const parsed = JSON.parse(mockUser);
        headers['x-mock-telegram-id'] = parsed.id;
        headers['x-mock-first-name'] = parsed.first_name;
        headers['x-mock-last-name'] = parsed.last_name;
        if (parsed.isAdmin) {
          headers['x-dev-admin'] = 'true';
        }
      } catch (_) {}
    }
  }

  const adminToken = localStorage.getItem('grant_admin_token') || 'grant_secret_key_2026';
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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Request failed on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Catalog
  getCategories: () => request('/products/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),

  // Cart
  getCart: () => request('/orders/cart'),
  addToCart: (productId, variantId, quantity = 1) =>
    request('/orders/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity })
    }),
  updateCartItem: (variantId, quantity) =>
    request(`/orders/cart/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),
  removeFromCart: (variantId) =>
    request(`/orders/cart/${variantId}`, {
      method: 'DELETE'
    }),

  // Orders
  createOrder: (payload) =>
    request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMyOrders: () => request('/orders/my'),
  getOrderById: (id) => request(`/orders/${id}`),

  // Profile
  getProfile: () => request('/users/profile'),
  updateProfile: (profile) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

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
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  sendBroadcast: (broadcastData) =>
    request('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    })
};
