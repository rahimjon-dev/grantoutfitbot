# 🛍 GRANT LUXURY OUTFITBOT — TELEGRAM MINI APP & ONLINE STORE

> A complete, production-ready Telegram online fashion shopping platform featuring a Telegram Mini App (React + Vite + Tailwind CSS), an Express.js backend with Telegram `initData` cryptographic verification, a Supabase PostgreSQL database with Row-Level Security (RLS) & atomic stock management, and an omnichannel Admin Control Panel (Telegram inline controls + Web Dashboard).

---

## 🌟 Key Features

### 1. Telegram Bot & Multilingual Onboarding
- **First-time Onboarding:** Beautiful welcome message prompting language choice via inline buttons:
  - 🇺🇿 **O‘zbekcha**
  - 🇷🇺 **Русский**
  - 🇬🇧 **English**
- **Persistence:** Selected language is stored in Supabase (`users.language_code`) and applied across all bot messages, Mini App UI, menus, and order notifications.
- **Persistent Telegram Reply Keyboard:**
  - 🛍 **Onlayn Do‘kon** (launches Telegram Mini App with `web_app` button)
  - 📦 **Buyurtmalarim** (My Orders summary with real-time status)
  - 👤 **Profilim** (Customer profile & native phone contact sharing)
  - 🌐 **Tilni o‘zgartirish** (Instant language switcher)
  - 📞 **Qo‘llab-quvvatlash** (Concierge support details)
- **Menu Button:** Automatically configures Telegram's native menu button (`setChatMenuButton`) to open the Mini App on Android, iOS, and Desktop.
- **Contact Sharing:** Supports Telegram native contact sharing (`request_contact: true`) and manual phone input.
- **Activity & Membership Tracking:** Tracks observable membership events (`my_chat_member` for blocked/unblocked bot) and user actions in `user_activity`.

### 2. Telegram Mini App (React + Tailwind CSS)
- **Aesthetic:** Minimalist, editorial luxury fashion brand design (deep blacks, slate tones, gold accents `#d4af37`, and smooth glassmorphism).
- **Curated 6 Product Categories:**
  1. *Headwear* — Caps, beanies, panamas.
  2. *Upperwear* — Heavyweight tees (280 GSM), loopback hoodies (450 GSM), coats.
  3. *Bottomwear* — Pleated wide trousers, raw denim, joggers.
  4. *Footwear* — Full-grain calfskin leather low sneakers, boots.
  5. *Accessories* — Pebbled leather crossbody bags, wallets, timepieces.
  6. *Seasonal Collection* — Double-breasted heavy wool overcoats, trench coats.
- **Product Details:** High-resolution image gallery, variant selectors (sizes, colors with hex swatches), real-time stock counters, quantity stepper, "Add to Bag", and "Buy Now".
- **Shopping Bag & Free Delivery Progress:** Real-time subtotal in Uzbek soʻm (UZS), free shipping progress bar (orders over 500,000 UZS), quantity adjustments, and item removal.
- **Multi-step Checkout:**
  - Customer details prefilled from verified Telegram user profile.
  - Native contact-sharing or manual phone number entry.
  - Delivery address & courier notes.
  - Payment method (Cash on delivery, Card on delivery, Click/Payme).
- **My Orders:** Live order status tracking with timestamps, item cards, tracking number, and courier dispatch notes.
- **Standalone Browser Preview:** When opened outside Telegram, a built-in preview bar enables switching between Customer and Admin modes, simulating Telegram WebApp identities seamlessly.

### 3. Backend & Security Architecture (Node.js & Express)
- **Telegram `initData` Verification:** Cryptographically validates HMAC-SHA256 signatures using `crypto.createHmac` and the bot token per the official Telegram WebApp specification. Derives authenticated user identity securely on the server.
- **Atomic Stock & Order Management:** PostgreSQL function `create_order_atomic` locks variant rows (`FOR UPDATE`), prevents overselling race conditions, reduces inventory safely, generates unique order IDs (`ORD-YYYYMMDD-XXXX`), logs status history, and records user activity.
- **Admin Authorization:** Server-side enforcement ensuring administrative actions are restricted strictly to configured Telegram IDs (`ADMIN_TELEGRAM_IDS`) or the admin secret key.
- **Centralized Middleware:** Helmet headers, CORS, request rate limiting (`express-rate-limit`), error handling, and Morgan logging.

### 4. Admin Management (Telegram + Web Dashboard)
- **Instant Telegram Alerts:** Sends instant Markdown notifications to all administrators whenever an order is placed, complete with item details, sizes, colors, phone number, address, and interactive inline buttons:
  - 🟢 **Confirm Order** (`adm:confirm:<id>`)
  - ⚙️ **Start Processing** (`adm:process:<id>`)
  - 🚚 **Mark as Shipped** (`adm:ship:<id>`)
  - 📦 **Mark as Delivered** (`adm:deliver:<id>`)
  - ❌ **Reject Order** (`adm:reject:<id>`)
  - 📞 **Contact Customer** (`tg://user?id=...`)
- **Admin Web Dashboard:**
  - **Overview KPI Cards:** Real-time revenue in UZS, total orders, pending/completed/cancelled breakdown, registered users, and best sellers.
  - **Orders Management:** Search by order number, customer name, or phone. Update status, assign tracking numbers, and add dispatch notes. Automatically notifies the customer in their preferred language.
  - **Product Catalog Management:** Add new products, configure variants (sizes, colors, stock), prices, discounts, and toggle homepage featuring.
  - **User Insights:** Search user database, track activity logs, view language preference and order history.
  - **Omnichannel Broadcasts:** Target announcements to all users or specific languages (UZ, RU, EN) with safe rate limiting.

---

## 📁 Project Structure

```text
grantOutfitbot/
├── backend/
│   ├── src/
│   │   ├── config/index.js           # Environment & secret loader
│   │   ├── controllers/              # Product, Order, User, Admin controllers
│   │   ├── middleware/               # Telegram HMAC auth & Admin middleware
│   │   ├── routes/                   # REST API routes
│   │   ├── services/                 # Supabase & Telegram notification services
│   │   └── server.js                 # Express server entrypoint
│   ├── package.json
│   └── .env.example
├── bot/
│   ├── src/
│   │   ├── config/index.js           # Bot configuration
│   │   ├── handlers/                 # Start, language, menu, admin callback handlers
│   │   ├── keyboards/                # Reply keyboards & inline menus
│   │   ├── locales/                  # Uzbek, Russian, English dictionaries
│   │   ├── services/                 # DB persistence & activity logging
│   │   └── bot.js                    # Grammy bot runner
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, BottomNav, ProductModal, CartDrawer, CheckoutModal
│   │   ├── context/                  # Telegram, Language, Cart, Favorites contexts
│   │   ├── locales/                  # uz.json, ru.json, en.json translations
│   │   ├── pages/                    # Home, Catalog, Favorites, Orders, Profile, AdminDashboard
│   │   ├── services/api.js           # Authenticated API client
│   │   ├── utils/formatters.js       # UZS currency and date helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── supabase/
│   └── migrations/
│       ├── 20261011000001_initial_schema.sql         # 12 core tables & indexes
│       ├── 20261011000002_rls_policies.sql           # Row Level Security
│       ├── 20261011000003_atomic_order_functions.sql # Atomic order placement RPC
│       └── 20261011000004_seed_catalog.sql           # Luxury fashion seed catalog
├── .env.example                                      # Root environment blueprint
├── package.json                                      # Concurrently orchestration scripts
└── README.md
```

---

## 🚀 Setup & Local Development Guide

### Step 1: Create Your Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, choose a name (e.g., `Grant Luxury Outfit`), and a username ending in `bot` (e.g., `grant_outfit_bot`).
3. Copy the **HTTP API Bot Token** provided by BotFather.
4. (Optional) In BotFather, send `/setmenubutton` to configure your bot's menu button to open your Mini App URL.

### Step 2: Obtain Your Telegram Admin User ID
1. Open [@userinfobot](https://t.me/userinfobot) or [@raw_data_bot](https://t.me/raw_data_bot) on Telegram.
2. Send any message to receive your numerical `Id` (e.g., `123456789`).

### Step 3: Set Up Supabase Database
1. Go to [Supabase](https://supabase.com) and create a new project.
2. In the Supabase Dashboard, go to **SQL Editor**.
3. Run the migration scripts in order from `supabase/migrations/`:
   - `20261011000001_initial_schema.sql`
   - `20261011000002_rls_policies.sql`
   - `20261011000003_atomic_order_functions.sql`
   - `20261011000004_seed_catalog.sql`
4. Copy your project credentials from **Project Settings -> API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

> **Note:** The backend includes a zero-config local fallback engine. If you launch before configuring Supabase credentials, the backend and frontend run automatically with in-memory seeded inventory, allowing immediate local testing!

### Step 4: Configure Environment Variables
Copy `.env.example` in the root, `backend/`, and `bot/`:

```bash
# Root or Backend .env
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_MINI_APP_URL=http://localhost:5173
ADMIN_TELEGRAM_IDS=123456789

# Security
ADMIN_SECRET_KEY=grant_secret_key_2026
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 5: Install Dependencies & Run
In the root directory:

```bash
# Install all dependencies across backend, bot, and frontend
npm run install:all

# Run everything concurrently (Backend on :5000, Bot polling, Frontend on :5173)
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: Telegram Bot
cd bot && npm run dev

# Terminal 3: React Mini App
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser. The app will launch with the browser preview bar, allowing you to test shopping, cart checkout, and the Admin Dashboard directly.

---

## 🌐 Production Deployment

### Frontend (Vercel / Cloudflare Pages / Netlify)
1. Link your repository to Vercel.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set environment variable: `VITE_API_BASE_URL=https://your-backend-api.com`.
6. Once deployed, take the production URL (e.g., `https://grant-outfit.vercel.app`) and configure it with BotFather:
   - In [@BotFather](https://t.me/BotFather), run `/newapp` or `/setmenubutton`.
   - Set the Web App URL to your deployed frontend URL.

### Backend & Bot (Render / Railway / VPS)
1. Deploy `backend` and `bot` to a Node.js 18+ runtime (e.g. Railway or Render web service & worker).
2. Add all environment variables from `.env.example`.
3. Set `TELEGRAM_MINI_APP_URL` to your production frontend URL.
4. For production webhooks: Set `TELEGRAM_WEBHOOK_URL` in the bot configuration, or run standard long polling on a worker process.

---

## 🧪 Testing the Shopping & Admin Flow

1. **Telegram User Flow:**
   - Open your bot in Telegram and send `/start`.
   - Choose a language (🇺🇿, 🇷🇺, or 🇬🇧).
   - Press **🛍 Onlayn Do‘kon** to launch the Mini App.
   - Browse categories (Headwear, Upperwear, Footwear, etc.).
   - Open a product, select size `L` and color `Onyx Black`.
   - Click **Savatchaga qo‘shish** (Add to Bag).
   - Open the bag, review your order, and tap **Buyurtma berish** (Checkout).
   - Enter your name, phone, and delivery address.
   - Confirm the order.
   - You will see the **Order Confirmation Screen** with order code `ORD-YYYYMMDD-XXXX`.
2. **Admin Real-time Telegram Alert:**
   - The Telegram accounts listed in `ADMIN_TELEGRAM_IDS` will immediately receive a rich order alert.
   - Tap inline buttons to advance the status: **✅ Tasdiqlash** → **🚚 Jo‘natildi** → **📦 Yetkazildi**.
   - The customer will receive immediate Telegram notifications regarding their order status.
3. **Web Admin Dashboard:**
   - In the Mini App, switch to the **Admin** tab (or browse to `/admin`).
   - View live statistics (Revenue, Total Orders, Active Users).
   - Inspect orders, assign courier tracking numbers (e.g. `TRK-98421`), and add dispatch notes.
   - Add new fashion products with custom variants and images.
   - Compose and send rate-limited broadcast announcements.

---

## 🛡 Security Highlights
- **Cryptographic Verification:** Server verifies Telegram `initData` using the bot token secret key. Client-supplied IDs are never trusted blindly.
- **Service-Role Isolation:** The Supabase `service_role` key is strictly kept in the backend server and bot, never bundled into frontend client scripts.
- **Race Condition Prevention:** Database locks rows `FOR UPDATE` in `create_order_atomic` to guarantee inventory integrity and prevent overselling.
- **Integer Price Storage:** All prices are stored as whole integer numbers in Uzbek soʻm (UZS) to prevent floating-point rounding errors.
