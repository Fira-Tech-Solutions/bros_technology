# 03 — Features

## Admin Mobile App

### Login (`src/screens/LoginScreen.js`)
- Email/password form with show/hide password toggle
- Brand showcase panel (hidden on mobile)
- Links to "Forgot password?" and "Register as Agent"
- Footer links to firatech.systems

### Agent Signup (`src/screens/AgentSignupScreen.js`)
- **Step 1**: Enter 6-digit invitation code → `POST /api/auth/verify-agent-code`
- **Step 2**: Complete registration (name, email, phone, password) → `POST /api/auth/register`
- Code verification pre-fills name/phone from server

### Dashboard (`src/screens/DashboardScreen.js`)
- StatusChart: bar/pie chart of listing statuses (Available/Sold/Pending/Archived)
- RecentProducts: first 8 listings with pull-to-refresh
- Notification bell with unread count badge

### Properties (`src/screens/PropertiesScreen.js`)
- Two tabs: **Listings** and **Categories**
- Listings tab: search bar, category filter chips, paginated FlatList of ListingCards
- Inline Telegram syndication button per listing
- Categories tab: CRUD for categories with schema rules (dynamic field definitions)
- Floating "+" button for add listing

### Add Listing (`src/screens/AddListingScreen.js`)
- **3-step wizard**:
  - Step 1: Title, description, price, stock, category selector
  - Step 2: Dynamic schema fields from category (brand-dependent model selection, predefined dropdowns with "Other" custom option)
  - Step 3: Image picker with drag-to-reorder, listing summary
- Submits as FormData with images

### Listing Detail (`src/screens/ListingDetailScreen.js`)
- Edit all fields: title, description, price, stock, status (Available/Pending/Sold/Archived)
- Dynamic schema fields (same system as Add Listing)
- Image management: existing images (add/remove), new uploads
- Save and Delete actions

### Settings (`src/screens/SettingsScreen.js`)
- Profile card (tap to navigate to Profile)
- Appearance toggle (dark/light)
- Language dropdown (English/Amharic/Afaan Oromoo)
- Store section (admin-only): Contact & Social Media
- About section with version
- Logout button

### Profile (`src/screens/ProfileScreen.js`)
- Avatar upload (image picker)
- Name, email fields
- Contact & Social Media: 10 preset fields (Phone, WhatsApp, Telegram, Facebook, Twitter, Instagram, TikTok, YouTube, LinkedIn, Website) + custom fields

### Syndication Config (`src/screens/SyndicationConfigScreen.js`)
- **Settings tab** (admin-only): Bot token, channel ID, active toggle, test connection
- **Posts tab**: Swipeable filter pages (All/Successful/Pending/Failed)
  - Post cards with image, title, status badge, action badge, timestamp
  - Detail modal: caption editor, delete, retry (for failed)

### Finance (`src/screens/CommissionScreen.js`)
- Summary cards: Total Assets, Total Value, Available, Sold, Pending, Archived
- Per-category breakdown with status pills and progress bars
- Admin-only

### Notifications (`src/screens/NotificationScreen.js`)
- Full-screen notification list with type icons
- Tap marks as read and navigates to relevant listing
- "Mark all read" button
- Polls every 30 seconds via `useNotifications` hook

### Contact Settings (`src/screens/ContactSettingsScreen.js`)
- Admin-only store settings editor
- Sections: Contact Information, Business Details, Social Media
- All fields stored via `PUT /api/settings`

## Admin Web Portal

### Dashboard (`src/pages/Dashboard.tsx`)
- Uses `useListings()` + `useCategories()` (TanStack Query)
- Stats: Total Products, Available, Sold, Total Stock, Categories
- Device Analytics by Category with icons
- Status Distribution horizontal bar chart (custom, not Recharts)
- Recent Products list (latest 5)

### Properties (`src/pages/Properties.tsx`)
- DataTable with columns: Product (image+title+category), Price, Status, Stock (color-coded), Agent, Date, Actions
- Search by title/category, filter by category dropdown
- Actions: Edit, Syndicate, Delete (with confirmation modals)
- Pagination: 15 per page

### Add Listing (`src/pages/AddListing.tsx`)
- 3-step wizard (same UX as mobile app)
- Dynamic schema fields with custom dropdowns (predefined options + "Other" custom)
- Brand-dependent model selection
- Submits as FormData

### Listing Detail (`src/pages/ListingDetail.tsx`)
- Two-column layout (main + 320px sidebar)
- Basic info card, dynamic category fields, product photos sidebar
- Save Changes, Delete, Syndicate actions

### Categories (`src/pages/Categories.tsx`)
- DataTable: Category (icon+name), Fields count, Products count, Actions
- Create/Edit modal with icon selector and Schema Rules editor
- Add rules: field name, type (string/number/boolean/select), required toggle

### Agents (`src/pages/Agents.tsx`)
- Two tabs: Invitation Codes / Registered Agents
- Generate code modal: name, role toggle, max uses
- Copy-to-clipboard for codes
- Revoke/Remove with confirmation

### Syndication (`src/pages/Syndication.tsx`)
- **Settings tab** (admin): Bot info, channel info, configuration modal
- **Posts tab**: Filter pills, post list with status/action badges
- Detail modal: caption editor, delete, retry

### Finance (`src/pages/Finance.tsx`)
- Uses `useAssetStats()` (TanStack Query)
- Stats cards, Recharts BarChart by category, category detail cards

### Settings (`src/pages/Settings.tsx`)
- Profile card, Appearance toggle, Language dropdown
- Store section (admin-only): Contact, Business, Social Media fields
- About, Logout

## Public Website

### Homepage (`src/routes/index.tsx`)
- Sticky parallax hero with responsive images (AVIF/WebP)
- 3D Three.js canvas (floating golden icosahedron)
- Categories grid (fetched from API)
- Featured products (first 6 from API)
- Animated stats counters (2500+ customers, 4800+ products, etc.)
- Brand marquee with motion animation
- SEO content section about BROS Technology
- Contact section with social links

### Catalog (`src/routes/catalog.tsx`)
- Full-text search with debouncing (300ms), Cmd+K shortcut
- Desktop sidebar with `FilterPanel` (price range, category-specific filters)
- Mobile filter sheet (bottom drawer)
- Horizontal category pills with animated indicator
- Grid and list layout toggle
- Zod schema validation for search params
- `CollectionPageJsonLd` structured data

### Product Detail (`src/routes/property.$id.tsx`)
- SSR loader for crawlers: `loader: async ({ params }) => fetchProduct(params.id)`
- Hero image with parallax effect
- Specs table, description, gallery with lightbox
- Lightbox: keyboard navigation, touch swipe, thumbnails
- Sticky order sidebar (desktop): Telegram, WhatsApp, Call buttons
- Mobile sticky order bar
- `ProductJsonLd` structured data
- Inquiry tracking: `POST /api/public/listings/:id/inquiry`

### Sitemap (`src/routes/sitemap[.]xml.tsx`)
- Server-only dynamic XML sitemap
- Fetches all categories and products (up to 5000)
- Includes homepage, catalog, category pages, individual product URLs
- Cache: `s-maxage=3600, stale-while-revalidate=86400`

### Telegram Mini App Integration
- Detects Telegram WebApp environment
- Syncs theme (dark/light) from Telegram
- Hides nav bar in MiniApp mode
- Uses Telegram `MainButton` for ordering
- `startParam` for deep linking to specific products
