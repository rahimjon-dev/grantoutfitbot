import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DATA_DIR = path.resolve(__dirname, '../../data');
const BOT_DATA_CACHE = path.resolve(__dirname, '../../../bot/data/users_cache.json');
const BACKEND_DATA_CACHE = path.join(BACKEND_DATA_DIR, 'users_cache.json');

try {
  if (!fs.existsSync(BACKEND_DATA_DIR)) {
    fs.mkdirSync(BACKEND_DATA_DIR, { recursive: true });
  }
} catch (_) {}

async function withTimeout(promise, ms = 2500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('SUPABASE_TIMEOUT')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

let supabaseClient = null;
let isConnected = false;

// Initialize Supabase Client
if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase client initialized with Service Role Key');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Running in local offline development mode (Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect)');
}

// Helper to test if a string is a valid UUID
function isUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// ==========================================
// SEED FALLBACK DATA FOR OFFLINE DEV ONLY
// ==========================================
let localCategories = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    slug: 'headwear',
    name_uz: 'Bosh kiyimlar',
    name_ru: 'Головные уборы',
    name_en: 'Headwear',
    description_uz: 'Kepkalar, panamalar, bini va zamonaviy shapkalar to‘plami',
    description_ru: 'Кепки, панамы, бини и стильные шапки для любого сезона',
    description_en: 'Premium caps, beanies, and hats crafted for modern silhouettes',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    slug: 'upperwear',
    name_uz: 'Ustki kiyimlar',
    name_ru: 'Верхняя одежда',
    name_en: 'Upperwear',
    description_uz: 'Futbolkalar, ko‘ylaklar, xudi, svitshotlar va kurtkalar',
    description_ru: 'Футболки, рубашки, худи, свитшоты, куртки и пальто',
    description_en: 'Minimalist t-shirts, oversized hoodies, tailored jackets and overcoats',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    slug: 'bottomwear',
    name_uz: 'Pastki kiyimlar',
    name_ru: 'Брюки и джинсы',
    name_en: 'Bottomwear',
    description_uz: 'Klassik shimlar, jinsilar, joggerlar va shortilar',
    description_ru: 'Брюки классического кроя, премиальный деним, джоггеры и шорты',
    description_en: 'Tailored trousers, raw denim jeans, relaxed cargo pants and joggers',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    slug: 'footwear',
    name_uz: 'Oyoq kiyimlar',
    name_ru: 'Обувь',
    name_en: 'Footwear',
    description_uz: 'Krossovkalar, klassik tufli, etiklar va qulay poyabzallar',
    description_ru: 'Кроссовки, кожаные ботинки, лоферы и минималистичная обувь',
    description_en: 'Handcrafted leather boots, architectural sneakers, and luxury loafers',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    slug: 'accessories',
    name_uz: 'Aksessuarlar',
    name_ru: 'Аксессуары',
    name_en: 'Accessories',
    description_uz: 'Soatlar, charm kamarlar, sumkalar, hamyonlar va quyosh ko‘zoynaklari',
    description_ru: 'Часы, кожаные ремни, сумки через плечо, портмоне и солнцезащитные очки',
    description_en: 'Luxury leather bags, stainless steel timepieces, eyewear and wallets',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    slug: 'seasonal-collection',
    name_uz: 'Mavsumiy to‘plam',
    name_ru: 'Сезонная коллекция',
    name_en: 'Seasonal Collection',
    description_uz: 'Cheklangan tirajdagi kuz-qish va bahor-yoz eksklyuziv liboslar',
    description_ru: 'Лимитированная капсула: шерстяные пальто, тренчи и демисезонные образы',
    description_en: 'Curated capsule collection with seasonal knitwear, trench coats, and outerwear',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    sort_order: 6,
    is_active: true
  }
];

let localProducts = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    slug: 'heavyweight-boxy-tee',
    name_uz: 'Og‘ir Paxtali Boxy Futbolka',
    name_ru: 'Футболка Heavyweight Boxy Fit',
    name_en: 'Heavyweight Boxy Tee (280 GSM)',
    description_uz: '100% organik paxtadan tayyorlangan 280 GSM zichlikdagi premium futbolka.',
    description_ru: 'Плотная футболка из 100% органического хлопка плотностью 280 г/м².',
    description_en: 'Crafted from 280 GSM heavyweight organic combed cotton.',
    base_price_uzs: 280000,
    discount_price_uzs: 240000,
    is_featured: true,
    is_active: true,
    is_in_stock: true,
    sales_count: 84,
    images: [
      { id: 'img-1', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v101', size: 'S', color_name: 'Onyx Black', color_hex: '#111111', stock_quantity: 25 },
      { id: 'v102', size: 'M', color_name: 'Onyx Black', color_hex: '#111111', stock_quantity: 30 },
      { id: 'v103', size: 'L', color_name: 'Onyx Black', color_hex: '#111111', stock_quantity: 20 }
    ]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    slug: 'minimalist-french-terry-hoodie',
    name_uz: 'Premium French Terry Xudi',
    name_ru: 'Худи оверсайз French Terry (450 GSM)',
    name_en: 'Minimal French Terry Hoodie (450 GSM)',
    description_uz: '450 GSM zichlikdagi og‘ir paxtali lyuks xudi.',
    description_ru: 'Ультра-плотный худи 450 GSM без шнурков.',
    description_en: 'Luxury 450 GSM loopback cotton hoodie.',
    base_price_uzs: 590000,
    discount_price_uzs: 520000,
    is_featured: true,
    is_active: true,
    is_in_stock: true,
    sales_count: 52,
    images: [
      { id: 'img-3', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v201', size: 'M', color_name: 'Slate Grey', color_hex: '#474B4E', stock_quantity: 25 },
      { id: 'v202', size: 'L', color_name: 'Jet Black', color_hex: '#0A0A0A', stock_quantity: 20 }
    ]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    slug: 'structured-twill-cap',
    name_uz: 'Strukturali Paxtali Kepka',
    name_ru: 'Кепка из плотного твила с латунной застежкой',
    name_en: 'Structured Washed Twill Cap',
    description_uz: 'Metall jez qisqichli, vintage ishlov berilgan 100% paxtali tvil kepka.',
    description_ru: 'Кепка из плотного стираного хлопка-твил с металлической винтажной пряжкой.',
    description_en: 'Premium 6-panel silhouette cut from durable washed cotton twill.',
    base_price_uzs: 195000,
    discount_price_uzs: null,
    is_featured: false,
    is_active: true,
    is_in_stock: true,
    sales_count: 67,
    images: [
      { id: 'img-5', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v301', size: 'One Size', color_name: 'Washed Olive', color_hex: '#556B2F', stock_quantity: 40 },
      { id: 'v302', size: 'One Size', color_name: 'Matte Black', color_hex: '#151515', stock_quantity: 50 }
    ]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000004',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    slug: 'ribbed-cashmere-wool-beanie',
    name_uz: 'Kashmir Junli Qalin Bini',
    name_ru: 'Шапка-бини из смеси кашемира и мериносовой шерсти',
    name_en: 'Ribbed Cashmere-Wool Blend Beanie',
    description_uz: 'Merinos juni va kashmir qorishmasidan to‘qilgan mayin, issiq bini shapka.',
    description_ru: 'Ультра-мягкая шапка крупной вязки с отворотом из шерсти мериноса.',
    description_en: 'Spun from an insulating merino-cashmere blend.',
    base_price_uzs: 220000,
    discount_price_uzs: 185000,
    is_featured: true,
    is_active: true,
    is_in_stock: true,
    sales_count: 39,
    images: [
      { id: 'img-6', image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v401', size: 'One Size', color_name: 'Heather Charcoal', color_hex: '#333333', stock_quantity: 25 },
      { id: 'v402', size: 'One Size', color_name: 'Camel Beige', color_hex: '#C19A6B', stock_quantity: 30 }
    ]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000005',
    category_id: 'c1000000-0000-0000-0000-000000000003',
    slug: 'relaxed-pleated-wide-trousers',
    name_uz: 'Keng Bichimli Bukmali Shim',
    name_ru: 'Брюки свободного кроя с защипами Wide-Leg',
    name_en: 'Relaxed Pleated Wide Trousers',
    description_uz: 'Zamonaviy erkin siluetli, bukmali va qulay klassik shim.',
    description_ru: 'Элегантные брюки широкого кроя с двойными защипами.',
    description_en: 'Tailored from premium fluid drape suiting fabric.',
    base_price_uzs: 490000,
    discount_price_uzs: 420000,
    is_featured: true,
    is_active: true,
    is_in_stock: true,
    sales_count: 45,
    images: [
      { id: 'img-7', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v501', size: '32 (M)', color_name: 'Midnight Navy', color_hex: '#1C2833', stock_quantity: 20 },
      { id: 'v502', size: '34 (L)', color_name: 'Charcoal Grey', color_hex: '#2C3E50', stock_quantity: 14 }
    ]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000006',
    category_id: 'c1000000-0000-0000-0000-000000000004',
    slug: 'minimalist-leather-sneakers',
    name_uz: 'Tabiiy Charm Minimal Krossovka',
    name_ru: 'Кроссовки из натуральной итальянской кожи',
    name_en: 'Minimalist Calf Leather Low Sneakers',
    description_uz: 'Haqiqiy silliq buzoq charmidan qo‘lda tikilgan krossovkalar.',
    description_ru: 'Классические кеды из гладкой итальянской кожи.',
    description_en: 'Handcrafted in full-grain calfskin leather.',
    base_price_uzs: 890000,
    discount_price_uzs: 790000,
    is_featured: true,
    is_active: true,
    is_in_stock: true,
    sales_count: 28,
    images: [
      { id: 'img-8', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80', is_primary: true }
    ],
    variants: [
      { id: 'v601', size: 'EU 42', color_name: 'Pure White', color_hex: '#FFFFFF', stock_quantity: 18 },
      { id: 'v602', size: 'EU 43', color_name: 'Pure White', color_hex: '#FFFFFF', stock_quantity: 12 }
    ]
  }
];

let localUsers = new Map();
let localOrders = [];
let localCart = new Map(); // telegramId -> array of { variantId, productId, quantity }
let localActivity = [];
let localNotifications = [];

function loadUsersFromDisk() {
  const tryFiles = [BOT_DATA_CACHE, BACKEND_DATA_CACHE];
  for (const f of tryFiles) {
    try {
      if (fs.existsSync(f)) {
        const raw = fs.readFileSync(f, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const u of parsed) {
            if (u && u.telegram_id) {
              localUsers.set(Number(u.telegram_id), u);
            }
          }
        }
      }
    } catch (_) {}
  }
}
loadUsersFromDisk();

let backendSaveTimeout = null;
function flushUsersToDisk() {
  if (backendSaveTimeout) clearTimeout(backendSaveTimeout);
  backendSaveTimeout = setTimeout(() => {
    try {
      const list = Array.from(localUsers.values());
      fs.writeFileSync(BACKEND_DATA_CACHE, JSON.stringify(list, null, 2), 'utf-8');
      if (fs.existsSync(path.dirname(BOT_DATA_CACHE))) {
        fs.writeFileSync(BOT_DATA_CACHE, JSON.stringify(list, null, 2), 'utf-8');
      }
    } catch (_) {}
  }, 300);
}

// ==========================================
// DB SERVICE METHODS
// ==========================================
export const db = {
  isSupabaseLive: () => Boolean(supabaseClient),

  async checkHealth() {
    if (!supabaseClient) {
      return { status: 'offline', error: 'SUPABASE_CLIENT_NOT_INITIALIZED' };
    }
    try {
      const { error } = await supabaseClient.from('categories').select('id').limit(1);
      if (error) {
        return { status: 'error', error: error.message };
      }
      return { status: 'connected' };
    } catch (err) {
      return { status: 'error', error: err.message };
    }
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[Supabase Error in getCategories]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      } else if (data) {
        return data;
      }
    }
    return localCategories;
  },

  async saveCategory(catData) {
    if (supabaseClient) {
      if (catData.id) {
        const { data, error } = await supabaseClient
          .from('categories')
          .update({
            name_uz: catData.name_uz,
            name_ru: catData.name_ru,
            name_en: catData.name_en,
            slug: catData.slug,
            description_uz: catData.description_uz,
            description_ru: catData.description_ru,
            description_en: catData.description_en,
            image_url: catData.image_url,
            is_active: catData.is_active !== undefined ? catData.is_active : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', catData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const slug = catData.slug || catData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await supabaseClient
          .from('categories')
          .insert({
            name_uz: catData.name_uz,
            name_ru: catData.name_ru,
            name_en: catData.name_en,
            slug,
            description_uz: catData.description_uz,
            description_ru: catData.description_ru,
            description_en: catData.description_en,
            image_url: catData.image_url,
            is_active: true
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }

    if (catData.id) {
      const idx = localCategories.findIndex(c => c.id === catData.id);
      if (idx > -1) {
        localCategories[idx] = { ...localCategories[idx], ...catData };
        return localCategories[idx];
      }
    }
    const newCat = {
      id: `c-${Date.now()}`,
      slug: catData.slug || `cat-${Date.now()}`,
      ...catData,
      is_active: true
    };
    localCategories.push(newCat);
    return newCat;
  },

  async deleteCategory(categoryId) {
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', categoryId);
      if (error) throw error;
      return { success: true };
    }
    localCategories = localCategories.filter(c => c.id !== categoryId);
    return { success: true };
  },

  // --- PRODUCTS ---
  async getProducts({ categorySlug, search, sort = 'newest', isFeatured, limit = 50, offset = 0 } = {}) {
    if (supabaseClient) {
      let query = supabaseClient
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('is_active', true);

      if (categorySlug && categorySlug !== 'all') {
        // Match category by slug or id
        if (isUUID(categorySlug)) {
          query = query.eq('category_id', categorySlug);
        } else {
          const { data: cat } = await supabaseClient.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
          if (cat?.id) {
            query = query.eq('category_id', cat.id);
          }
        }
      }
      if (isFeatured !== undefined) {
        query = query.eq('is_featured', isFeatured);
      }
      if (search) {
        query = query.or(`name_en.ilike.%${search}%,name_ru.ilike.%${search}%,name_uz.ilike.%${search}%`);
      }

      if (sort === 'price_asc') query = query.order('base_price_uzs', { ascending: true });
      else if (sort === 'price_desc') query = query.order('base_price_uzs', { ascending: false });
      else if (sort === 'popular') query = query.order('sales_count', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (error) {
        console.error('[Supabase Error in getProducts]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      } else if (data) {
        return data;
      }
    }

    // Local Fallback Filter
    let filtered = [...localProducts].filter(p => p.is_active);

    if (categorySlug && categorySlug !== 'all') {
      const cat = localCategories.find(c => c.slug === categorySlug || c.id === categorySlug);
      if (cat) filtered = filtered.filter(p => p.category_id === cat.id);
    }
    if (isFeatured !== undefined) {
      filtered = filtered.filter(p => p.is_featured === isFeatured);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name_en?.toLowerCase().includes(s) ||
        p.name_ru?.toLowerCase().includes(s) ||
        p.name_uz?.toLowerCase().includes(s)
      );
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => (a.discount_price_uzs || a.base_price_uzs) - (b.discount_price_uzs || b.base_price_uzs));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => (b.discount_price_uzs || b.base_price_uzs) - (a.discount_price_uzs || a.base_price_uzs));
    } else if (sort === 'popular') {
      filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    return filtered.slice(offset, offset + limit).map(p => {
      const cat = localCategories.find(c => c.id === p.category_id);
      return { ...p, category: cat };
    });
  },

  async getProductById(id) {
    if (supabaseClient) {
      const isIdUUID = isUUID(id);
      let query = supabaseClient
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `);

      if (isIdUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.error('[Supabase Error in getProductById]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      } else if (data) {
        return data;
      }
    }

    const prod = localProducts.find(p => p.id === id || p.slug === id);
    if (!prod) return null;
    const cat = localCategories.find(c => c.id === prod.category_id);
    return { ...prod, category: cat };
  },

  // --- USERS ---
  async getUserByTelegramId(telegramId) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      try {
        const { data, error } = await withTimeout(
          supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', tid)
            .maybeSingle()
        );
        if (!error && data) {
          localUsers.set(tid, data);
          flushUsersToDisk();
          return data;
        }
      } catch (_) {}
    }
    return localUsers.get(tid) || null;
  },

  async upsertUser({ telegramId, firstName, lastName, username, languageCode, phoneNumber, phoneVerified, registrationStatus, deliveryAddress, deliveryCity }) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      const payload = {
        telegram_id: tid,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (firstName) payload.first_name = firstName;
      if (lastName !== undefined) payload.last_name = lastName;
      if (username !== undefined) payload.username = username;
      if (languageCode) payload.language_code = languageCode;
      if (phoneNumber) payload.phone_number = phoneNumber;
      if (phoneVerified !== undefined) payload.phone_verified = phoneVerified;
      if (registrationStatus) payload.registration_status = registrationStatus;
      if (deliveryAddress) payload.delivery_address = deliveryAddress;
      if (deliveryCity) payload.delivery_city = deliveryCity;

      try {
        const { data, error } = await withTimeout(
          supabaseClient
            .from('users')
            .upsert(payload, { onConflict: 'telegram_id' })
            .select()
            .single()
        );

        if (!error && data) {
          localUsers.set(tid, data);
          flushUsersToDisk();
          return data;
        }
      } catch (err) {
        console.warn('[Supabase upsertUser warning]:', err.message);
      }
    }

    const existing = localUsers.get(tid) || {
      id: `u-${tid}`,
      telegram_id: tid,
      registration_status: 'unregistered',
      phone_verified: false,
      created_at: new Date().toISOString()
    };

    const updated = {
      ...existing,
      first_name: firstName || existing.first_name,
      last_name: lastName !== undefined ? lastName : existing.last_name,
      username: username !== undefined ? username : existing.username,
      language_code: languageCode || existing.language_code || 'uz',
      phone_number: phoneNumber || existing.phone_number,
      phone_verified: phoneVerified !== undefined ? phoneVerified : existing.phone_verified,
      registration_status: registrationStatus || existing.registration_status || 'unregistered',
      delivery_address: deliveryAddress || existing.delivery_address,
      delivery_city: deliveryCity || existing.delivery_city || 'Tashkent',
      last_active_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localUsers.set(tid, updated);
    flushUsersToDisk();
    return updated;
  },

  async logUserActivity(telegramId, action, metadata = {}) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      try {
        await supabaseClient.from('user_activity').insert({
          telegram_id: tid,
          action,
          metadata
        });
      } catch (_) {}
    }
    localActivity.unshift({
      id: `act-${Date.now()}`,
      telegram_id: tid,
      action,
      metadata,
      created_at: new Date().toISOString()
    });
  },

  // --- SHOPPING CART (PERSISTENT VIA SUPABASE public.cart_items) ---
  async getUserCart(telegramId) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      const user = await this.getUserByTelegramId(tid);
      if (user?.id) {
        const { data, error } = await supabaseClient
          .from('cart_items')
          .select(`
            id,
            product_id,
            variant_id,
            quantity,
            product:products(
              id,
              name_uz,
              name_ru,
              name_en,
              base_price_uzs,
              discount_price_uzs,
              images:product_images(*)
            ),
            variant:product_variants(*)
          `)
          .eq('user_id', user.id);

        if (!error && data) {
          return data
            .filter(item => item.product && item.variant)
            .map(item => ({
              id: item.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              product: item.product,
              variant: item.variant
            }));
        }
      }
    }

    const items = localCart.get(tid) || [];
    return items.map(item => {
      const product = localProducts.find(p => p.id === item.product_id);
      const variant = product?.variants?.find(v => v.id === item.variant_id);
      return {
        ...item,
        product,
        variant
      };
    }).filter(i => i.product && i.variant);
  },

  async addToCart(telegramId, { productId, variantId, quantity = 1 }) {
    const tid = Number(telegramId);
    const qty = parseInt(quantity || '1', 10);

    if (supabaseClient) {
      let user = await this.getUserByTelegramId(tid);
      if (!user) {
        user = await this.upsertUser({ telegramId: tid });
      }

      if (user?.id) {
        const { data: existing } = await supabaseClient
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('variant_id', variantId)
          .maybeSingle();

        if (existing) {
          await supabaseClient
            .from('cart_items')
            .update({ quantity: existing.quantity + qty, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await supabaseClient
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              variant_id: variantId,
              quantity: qty
            });
        }
        return this.getUserCart(tid);
      }
    }

    let items = localCart.get(tid) || [];
    const existingIndex = items.findIndex(i => i.variant_id === variantId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += qty;
    } else {
      items.push({
        id: `cart-${Date.now()}`,
        product_id: productId,
        variant_id: variantId,
        quantity: qty
      });
    }
    localCart.set(tid, items);
    return this.getUserCart(tid);
  },

  async updateCartItem(telegramId, variantId, quantity) {
    const tid = Number(telegramId);
    const qty = parseInt(quantity, 10);

    if (supabaseClient) {
      const user = await this.getUserByTelegramId(tid);
      if (user?.id) {
        if (qty <= 0) {
          await supabaseClient
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('variant_id', variantId);
        } else {
          await supabaseClient
            .from('cart_items')
            .update({ quantity: qty, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('variant_id', variantId);
        }
        return this.getUserCart(tid);
      }
    }

    let items = localCart.get(tid) || [];
    if (qty <= 0) {
      items = items.filter(i => i.variant_id !== variantId);
    } else {
      const item = items.find(i => i.variant_id === variantId);
      if (item) item.quantity = qty;
    }
    localCart.set(tid, items);
    return this.getUserCart(tid);
  },

  async removeFromCart(telegramId, variantId) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      const user = await this.getUserByTelegramId(tid);
      if (user?.id) {
        await supabaseClient
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('variant_id', variantId);
        return this.getUserCart(tid);
      }
    }

    let items = localCart.get(tid) || [];
    items = items.filter(i => i.variant_id !== variantId);
    localCart.set(tid, items);
    return this.getUserCart(tid);
  },

  async clearCart(telegramId) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      const user = await this.getUserByTelegramId(tid);
      if (user?.id) {
        await supabaseClient
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }
    }
    localCart.delete(tid);
  },

  // --- ATOMIC ORDER CREATION ---
  async createOrder({ telegramId, customerName, phoneNumber, deliveryAddress, deliveryCity = 'Tashkent', deliveryNotes, paymentMethod = 'cash_on_delivery', items }) {
    const tid = Number(telegramId);

    if (!items || !items.length) {
      throw new Error('CART_EMPTY: Cart contains no items');
    }

    // Call Postgres atomic RPC in Supabase
    if (supabaseClient) {
      const formattedItems = items.map(i => ({
        variant_id: i.variant_id || i.variantId,
        product_id: i.product_id || i.productId,
        quantity: parseInt(i.quantity || '1', 10)
      }));

      const { data, error } = await supabaseClient.rpc('create_order_atomic', {
        p_telegram_id: tid,
        p_customer_name: customerName,
        p_phone_number: phoneNumber,
        p_delivery_address: deliveryAddress,
        p_delivery_city: deliveryCity,
        p_delivery_notes: deliveryNotes || null,
        p_payment_method: paymentMethod,
        p_items: formattedItems
      });

      if (error) {
        console.error('[Supabase create_order_atomic error]:', error.message);
        if (config.nodeEnv === 'production') {
          throw new Error(`Order placement failed: ${error.message}`);
        }
      } else if (data) {
        if (!data.success && data.error) {
          throw new Error(data.message || data.error);
        }
        return data;
      }
    }

    // Local Fallback Validation & Stock Check
    let subtotal = 0;
    const resolvedOrderItems = [];

    for (const reqItem of items) {
      const variantId = reqItem.variant_id || reqItem.variantId;
      const qty = parseInt(reqItem.quantity || '1', 10);

      let foundProduct = null;
      let foundVariant = null;

      for (const p of localProducts) {
        const v = p.variants?.find(v => v.id === variantId);
        if (v) {
          foundProduct = p;
          foundVariant = v;
          break;
        }
      }

      if (!foundProduct || !foundVariant) {
        throw new Error(`ITEM_NOT_FOUND: Variant ${variantId} was not found`);
      }

      if (foundVariant.stock_quantity < qty) {
        throw new Error(`INSUFFICIENT_STOCK: Item "${foundProduct.name_en}" (${foundVariant.size}/${foundVariant.color_name}) has only ${foundVariant.stock_quantity} units available.`);
      }

      const unitPrice = (foundProduct.discount_price_uzs || foundProduct.base_price_uzs);
      const totalItemPrice = unitPrice * qty;
      subtotal += totalItemPrice;

      resolvedOrderItems.push({
        id: `oi-${Date.now()}-${Math.random()}`,
        product_id: foundProduct.id,
        variant_id: foundVariant.id,
        product_name: foundProduct.name_en,
        selected_size: foundVariant.size,
        selected_color: foundVariant.color_name,
        unit_price_uzs: unitPrice,
        quantity: qty,
        total_price_uzs: totalItemPrice,
        product_image_url: foundProduct.images?.[0]?.image_url || ''
      });
    }

    // Deduct stock
    for (const reqItem of items) {
      const variantId = reqItem.variant_id || reqItem.variantId;
      const qty = parseInt(reqItem.quantity || '1', 10);
      for (const p of localProducts) {
        const v = p.variants?.find(v => v.id === variantId);
        if (v) {
          v.stock_quantity -= qty;
          p.sales_count = (p.sales_count || 0) + qty;
          break;
        }
      }
    }

    const deliveryFee = subtotal >= 500000 ? 0 : 30000;
    const totalAmount = subtotal + deliveryFee;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randSuffix}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      telegram_id: tid,
      customer_name: customerName,
      phone_number: phoneNumber,
      delivery_address: deliveryAddress,
      delivery_city: deliveryCity,
      delivery_notes: deliveryNotes,
      payment_method: paymentMethod,
      subtotal_uzs: subtotal,
      delivery_fee_uzs: deliveryFee,
      total_amount_uzs: totalAmount,
      status: 'pending',
      tracking_number: null,
      dispatch_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: resolvedOrderItems,
      history: [
        {
          previous_status: null,
          new_status: 'pending',
          changed_by: 'customer',
          created_at: new Date().toISOString()
        }
      ]
    };

    localOrders.unshift(newOrder);

    await this.upsertUser({
      telegramId: tid,
      firstName: customerName,
      phoneNumber,
      deliveryAddress,
      deliveryCity
    });

    await this.clearCart(tid);

    return {
      success: true,
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      total_amount_uzs: newOrder.total_amount_uzs,
      subtotal_uzs: newOrder.subtotal_uzs,
      delivery_fee_uzs: newOrder.delivery_fee_uzs,
      status: newOrder.status,
      customer_name: newOrder.customer_name,
      phone_number: newOrder.phone_number,
      delivery_address: newOrder.delivery_address,
      items: resolvedOrderItems,
      created_at: newOrder.created_at
    };
  },

  async getUserOrders(telegramId) {
    const tid = Number(telegramId);
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('telegram_id', tid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Error in getUserOrders]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      } else if (data) {
        return data;
      }
    }
    return localOrders.filter(o => o.telegram_id === tid);
  },

  async getOrderById(orderId) {
    if (supabaseClient) {
      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          history:order_status_history(*)
        `);

      if (isUUID(orderId)) {
        query = query.eq('id', orderId);
      } else {
        query = query.eq('order_number', orderId);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) return data;
    }
    return localOrders.find(o => o.id === orderId || o.order_number === orderId) || null;
  },

  // --- ADMIN METHODS ---
  async getAllOrdersAdmin({ status, search, limit = 50, offset = 0 } = {}) {
    if (supabaseClient) {
      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') query = query.eq('status', status);
      if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,phone_number.ilike.%${search}%`);

      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (error) {
        console.error('[Supabase Error in getAllOrdersAdmin]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      } else if (data) {
        return data;
      }
    }

    let orders = [...localOrders];
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(o =>
        o.order_number?.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s) ||
        o.phone_number?.includes(s)
      );
    }
    return orders.slice(offset, offset + limit);
  },

  async updateOrderStatus(orderId, { status, changedBy = 'admin', notes = '', trackingNumber, dispatchNotes }) {
    if (status === 'cancelled') {
      // Use cancel_order_atomic to atomically restore stock and log status history
      if (supabaseClient) {
        const { data: cancelResult, error: cancelError } = await supabaseClient.rpc('cancel_order_atomic', {
          p_order_id: orderId,
          p_changed_by: changedBy,
          p_reason: notes || dispatchNotes || 'Cancelled by admin'
        });

        if (cancelError) {
          console.error('[Supabase Error in cancel_order_atomic]:', cancelError.message);
        } else if (cancelResult) {
          const updated = await this.getOrderById(orderId);
          return updated;
        }
      }

      // Local Fallback Stock Restoration
      const order = localOrders.find(o => o.id === orderId || o.order_number === orderId);
      if (order && order.status !== 'cancelled') {
        order.status = 'cancelled';
        order.cancelled_reason = notes || dispatchNotes || 'Cancelled by admin';
        order.updated_at = new Date().toISOString();

        // Restore stock
        for (const item of order.items || []) {
          for (const prod of localProducts) {
            const v = prod.variants?.find(v => v.id === item.variant_id);
            if (v) {
              v.stock_quantity += item.quantity;
              prod.sales_count = Math.max(0, (prod.sales_count || 0) - item.quantity);
              break;
            }
          }
        }

        order.history = order.history || [];
        order.history.push({
          previous_status: order.status,
          new_status: 'cancelled',
          changed_by: changedBy,
          notes: notes || dispatchNotes,
          created_at: new Date().toISOString()
        });
        return order;
      }
    }

    // Normal status update (pending, confirmed, processing, shipped, delivered)
    if (supabaseClient) {
      const updatePayload = {
        status,
        updated_at: new Date().toISOString()
      };
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
      if (dispatchNotes !== undefined) updatePayload.dispatch_notes = dispatchNotes;

      let query = supabaseClient.from('orders').update(updatePayload);
      if (isUUID(orderId)) {
        query = query.eq('id', orderId);
      } else {
        query = query.eq('order_number', orderId);
      }

      const { data: updatedOrder, error } = await query.select(`*, items:order_items(*)`).single();

      if (!error && updatedOrder) {
        await supabaseClient.from('order_status_history').insert({
          order_id: updatedOrder.id,
          new_status: status,
          changed_by: changedBy,
          notes: notes || dispatchNotes || `Status updated to ${status}`
        });
        return updatedOrder;
      }
      if (error) {
        console.error('[Supabase Error in updateOrderStatus]:', error.message);
        if (config.nodeEnv === 'production') throw new Error(`Database error: ${error.message}`);
      }
    }

    const order = localOrders.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();
    if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
    if (dispatchNotes !== undefined) order.dispatch_notes = dispatchNotes;

    order.history = order.history || [];
    order.history.push({
      previous_status: previousStatus,
      new_status: status,
      changed_by: changedBy,
      notes,
      created_at: new Date().toISOString()
    });

    return order;
  },

  async getAdminStats() {
    if (supabaseClient) {
      // 1. Try real RPC aggregate first
      const { data: rpcStats, error: rpcError } = await supabaseClient.rpc('get_admin_dashboard_stats');
      if (!rpcError && rpcStats) {
        return rpcStats;
      }

      // 2. Direct real Supabase table queries (no fake numbers)
      const [usersRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
        supabaseClient.from('users').select('id, created_at, last_active_at', { count: 'exact' }),
        supabaseClient.from('orders').select('id, status, total_amount_uzs, created_at'),
        supabaseClient.from('products').select('id, name_en, name_uz, sales_count, base_price_uzs, discount_price_uzs, is_active, images:product_images(image_url, is_primary)'),
        supabaseClient.from('categories').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      const orders = ordersRes.data || [];
      const users = usersRes.data || [];
      const products = productsRes.data || [];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (Number(o.total_amount_uzs) || 0), 0);

      const topSelling = [...products]
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name_uz || p.name_en,
          sales: p.sales_count || 0,
          revenue: (p.sales_count || 0) * (p.discount_price_uzs || p.base_price_uzs || 0),
          image: p.images?.[0]?.image_url || ''
        }));

      return {
        totalUsers: usersRes.count !== null ? usersRes.count : users.length,
        activeUsers: users.filter(u => u.last_active_at && u.last_active_at >= sevenDaysAgo).length,
        newUsersToday: users.filter(u => u.created_at && u.created_at >= startOfToday).length,
        totalProducts: products.filter(p => p.is_active).length,
        availableProducts: products.filter(p => p.is_active).length,
        totalCategories: categoriesRes.count !== null ? categoriesRes.count : 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenueUzs: totalRevenue,
        topSellingProducts: topSelling
      };
    }

    // Local in-memory stats (calculated strictly from actual array values)
    const orders = localOrders;
    const users = Array.from(localUsers.values());

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total_amount_uzs || 0), 0);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const newUsersToday = users.filter(u => new Date(u.created_at).getTime() >= startOfToday).length;

    return {
      totalUsers: users.length,
      newUsersToday,
      activeUsers: users.length,
      availableProducts: localProducts.filter(p => p.is_active).length,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenueUzs: totalRevenue,
      topSellingProducts: localProducts
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name_uz || p.name_en,
          sales: p.sales_count || 0,
          revenue: (p.sales_count || 0) * (p.discount_price_uzs || p.base_price_uzs),
          image: p.images?.[0]?.image_url
        }))
    };
  },

  async getAllUsersAdmin({ search, limit = 50, offset = 0 } = {}) {
    if (supabaseClient) {
      let query = supabaseClient
        .from('users')
        .select(`
          *,
          orders:orders(id)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,username.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (!error && data) {
        return data.map(u => ({
          ...u,
          orders_count: u.orders?.length || 0
        }));
      }
    }

    let users = Array.from(localUsers.values());
    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        String(u.telegram_id).includes(s) ||
        (u.first_name && u.first_name.toLowerCase().includes(s)) ||
        (u.username && u.username.toLowerCase().includes(s)) ||
        (u.phone_number && u.phone_number.includes(s))
      );
    }
    return users.slice(offset, offset + limit).map(u => ({
      ...u,
      orders_count: localOrders.filter(o => o.telegram_id === u.telegram_id).length
    }));
  },

  async saveProduct(productData) {
    if (supabaseClient) {
      const slug = productData.slug || (productData.name_en || productData.name_uz).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const productPayload = {
        name_uz: productData.name_uz || productData.name_en,
        name_ru: productData.name_ru || productData.name_en,
        name_en: productData.name_en,
        category_id: productData.category_id || null,
        base_price_uzs: parseInt(productData.base_price_uzs, 10),
        discount_price_uzs: productData.discount_price_uzs ? parseInt(productData.discount_price_uzs, 10) : null,
        description_uz: productData.description_uz || '',
        description_ru: productData.description_ru || '',
        description_en: productData.description_en || '',
        is_featured: Boolean(productData.is_featured),
        is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true,
        updated_at: new Date().toISOString()
      };

      let savedProduct;
      if (productData.id && isUUID(productData.id)) {
        const { data, error } = await supabaseClient
          .from('products')
          .update(productPayload)
          .eq('id', productData.id)
          .select()
          .single();
        if (error) throw error;
        savedProduct = data;
      } else {
        productPayload.slug = slug;
        const { data, error } = await supabaseClient
          .from('products')
          .insert(productPayload)
          .select()
          .single();
        if (error) throw error;
        savedProduct = data;
      }

      // Save Primary Image
      if (productData.images?.[0]?.image_url || productData.image_url) {
        const imgUrl = productData.images?.[0]?.image_url || productData.image_url;
        await supabaseClient.from('product_images').delete().eq('product_id', savedProduct.id);
        await supabaseClient.from('product_images').insert({
          product_id: savedProduct.id,
          image_url: imgUrl,
          is_primary: true
        });
      }

      // Save Variant
      if (productData.variants?.length) {
        for (const v of productData.variants) {
          const varPayload = {
            product_id: savedProduct.id,
            size: v.size || 'M',
            color_name: v.color_name || 'Standard',
            color_hex: v.color_hex || '#111111',
            stock_quantity: parseInt(v.stock_quantity ?? '20', 10),
            updated_at: new Date().toISOString()
          };

          if (v.id && isUUID(v.id)) {
            await supabaseClient.from('product_variants').update(varPayload).eq('id', v.id);
          } else {
            await supabaseClient.from('product_variants').insert(varPayload);
          }
        }
      }

      return this.getProductById(savedProduct.id);
    }

    if (productData.id) {
      const index = localProducts.findIndex(p => p.id === productData.id);
      if (index > -1) {
        localProducts[index] = { ...localProducts[index], ...productData, updated_at: new Date().toISOString() };
        return localProducts[index];
      }
    }

    const newProd = {
      ...productData,
      id: productData.id || `p-${Date.now()}`,
      slug: productData.slug || `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localProducts.unshift(newProd);
    return newProd;
  },

  async deleteProduct(productId) {
    if (supabaseClient) {
      if (isUUID(productId)) {
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', productId);
        if (error) throw error;
        return { success: true };
      }
    }
    localProducts = localProducts.filter(p => p.id !== productId);
    return { success: true };
  },

  async saveBroadcastNotification(data) {
    if (supabaseClient) {
      const { data: record, error } = await supabaseClient
        .from('notifications')
        .insert({
          title: data.title || data.message.slice(0, 60),
          message: data.message,
          image_url: data.image_url,
          target_language: data.target_language || 'all',
          sent_by: data.sent_by ? Number(data.sent_by) : null,
          total_targeted: data.total_targeted || 0,
          total_delivered: data.total_delivered || 0,
          total_failed: data.total_failed || 0,
          status: data.status || 'completed'
        })
        .select()
        .single();
      if (!error && record) return record;
    }

    const record = {
      id: `notif-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString()
    };
    localNotifications.unshift(record);
    return record;
  }
};
