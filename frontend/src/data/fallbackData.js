export const FALLBACK_CATEGORIES = [
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

export const FALLBACK_PRODUCTS = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category_slug: 'upperwear',
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
    category_slug: 'upperwear',
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
    category_slug: 'headwear',
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
    category_slug: 'headwear',
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
    category_slug: 'bottomwear',
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
    category_slug: 'footwear',
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

