export type Locale = "en";

export const LOCALES: {
  code: Locale;
  label: string;
  nativeLabel: string;
  script: "latin" | "geez";
}[] = [{ code: "en", label: "English", nativeLabel: "English", script: "latin" }];

type TranslationKeys = {
  // Nav
  "nav.home": string;
  "nav.catalog": string;
  "nav.contact": string;
  "nav.discover": string;

  // Hero
  "hero.badge": string;
  "hero.title": string;
  "hero.titleAccent": string;
  "hero.description": string;
  "hero.cta": string;
  "hero.featured": string;

  // Categories
  "categories.browse": string;
  "categories.title": string;

  // Featured
  "featured.badge": string;
  "featured.title": string;
  "featured.viewAll": string;

  // Footer
  "footer.badge": string;
  "footer.title": string;
  "footer.emailPlaceholder": string;
  "footer.cta": string;
  "footer.copyright": string;

  // Catalog
  "catalog.badge": string;
  "catalog.allProducts": string;
  "catalog.showing": string;
  "catalog.products": string;
  "catalog.product": string;
  "catalog.gathering": string;
  "catalog.updating": string;
  "catalog.searchPlaceholder": string;
  "catalog.filters": string;
  "catalog.active": string;
  "catalog.refine": string;
  "catalog.showResults": string;
  "catalog.resetAll": string;
  "catalog.noResults": string;

  // Pagination
  "pagination.previous": string;
  "pagination.next": string;
  "pagination.page": string;
  "pagination.of": string;

  // Filters
  "filter.price": string;
  "filter.brand": string;
  "filter.condition": string;
  "filter.any": string;
  "filter.resetAll": string;

  // Product
  "property.backToCollection": string;
  "property.aboutProduct": string;
  "property.gallery": string;
  "property.specs": string;
  "property.description": string;
  "property.orderNow": string;
  "property.orderViaTelegram": string;
  "property.orderViaWhatsApp": string;
  "property.callToOrder": string;
  "property.inStock": string;
  "property.outOfStock": string;
  "property.brandNew": string;
  "property.from": string;

  // Empty state
  "empty.title": string;
  "empty.description": string;
  "empty.resetAll": string;

  // Error state
  "error.notFound": string;
  "error.somethingWrong": string;
  "error.tryAgain": string;

  // 404
  "404.title": string;
  "404.subtitle": string;
  "404.description": string;
  "404.goHome": string;

  // About section
  "about.badge": string;
  "about.title": string;
  "about.p1": string;
  "about.p2": string;
  "about.offerHeading": string;
  "about.offer1": string;
  "about.offer2": string;
  "about.offer3": string;
  "about.offer4": string;
  "about.offer5": string;

  // Related products
  "related.badge": string;
  "related.title": string;
  "related.viewAll": string;
};

export const translations: Record<Locale, TranslationKeys> = {
  en: {
    "nav.home": "Home",
    "nav.catalog": "Products",
    "nav.contact": "Contact",
    "nav.discover": "Shop Now",

    "hero.badge": "Your trusted electronics shop",
    "hero.title": "Tech Essentials,",
    "hero.titleAccent": "delivered",
    "hero.description": "Quality electronics accessories at the best prices in Ethiopia.",
    "hero.cta": "Browse Products",
    "hero.featured": "Featured",

    "categories.browse": "Browse",
    "categories.title": "Shop by Category",

    "featured.badge": "Popular",
    "featured.title": "Featured Products",
    "featured.viewAll": "View all",

    "footer.badge": "Get in touch",
    "footer.title": "Need help? Contact us.",
    "footer.emailPlaceholder": "Your email",
    "footer.cta": "Send Message",
    "footer.copyright": "\u00A9 {year} BROS Technology. All rights reserved.",

    "catalog.badge": "Products",
    "catalog.allProducts": "All Products",
    "catalog.showing": "Showing {count}",
    "catalog.products": "products",
    "catalog.product": "product",
    "catalog.gathering": "Loading products\u2026",
    "catalog.updating": "updating\u2026",
    "catalog.searchPlaceholder": "Search products, brands\u2026",
    "catalog.filters": "Filters",
    "catalog.active": "active",
    "catalog.refine": "Refine",
    "catalog.showResults": "Show {count} {type}",
    "catalog.resetAll": "Reset all filters",
    "catalog.noResults": "No results found",

    // Pagination
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    "pagination.page": "Page",
    "pagination.of": "of",

    "filter.price": "Price",
    "filter.brand": "Brand",
    "filter.condition": "Condition",
    "filter.any": "Any",
    "filter.resetAll": "Reset all filters",

    "property.backToCollection": "Back to products",
    "property.aboutProduct": "About this product",
    "property.gallery": "Gallery",
    "property.specs": "Specifications",
    "property.description": "Description",
    "property.orderNow": "Order Now",
    "property.orderViaTelegram": "Order via Telegram",
    "property.orderViaWhatsApp": "Order via WhatsApp",
    "property.callToOrder": "Call to Order",
    "property.inStock": "In Stock",
    "property.outOfStock": "Out of Stock",
    "property.brandNew": "Brand New",
    "property.from": "Price",

    "empty.title": "No products found",
    "empty.description":
      "Try adjusting your search or filters \u2014 the product you're looking for may be just a tap away.",
    "empty.resetAll": "Reset all filters",

    "error.notFound": "Product not found.",
    "error.somethingWrong":
      "Something went wrong on our end. You can try refreshing or head back home.",
    "error.tryAgain": "Try again",

    "404.title": "404",
    "404.subtitle": "Page not found",
    "404.description": "The page you\u2019re looking for doesn\u2019t exist or has been moved.",
    "404.goHome": "Go home",

    "about.badge": "About BROS Technology",
    "about.title": "Your Trusted Electronics Store in Addis Ababa",
    "about.p1":
      "BROS Technology is Ethiopia\u2019s premier destination for laptops, smartphones, tablets, and accessories. Whether you\u2019re looking for a brand-new MacBook, a Samsung Galaxy, an iPhone, or a reliable Dell laptop for work, we have something for every budget and need.",
    "about.p2":
      "All our products come with warranty, and our expert team in Addis Ababa is ready to help you find the perfect device. We stock top brands including Apple, Samsung, Dell, Lenovo, HP, and more.",
    "about.offerHeading": "What We Offer",
    "about.offer1": "Laptops \u2014 Dell, Lenovo, HP, MacBook for students and professionals",
    "about.offer2": "iPhones & Samsung \u2014 Latest models with warranty",
    "about.offer3": "iPads & MacBooks \u2014 For creatives and students",
    "about.offer4": "AirPods & Smartwatches \u2014 Premium audio and wearables",
    "about.offer5": "Nationwide delivery across Ethiopia",

    // Related products
    "related.badge": "You might also like",
    "related.title": "More {category}",
    "related.viewAll": "View all",
  },
};

// Interpolation helper: replaces {key} placeholders
export function t(
  locale: Locale,
  key: keyof TranslationKeys,
  params?: Record<string, string | number>,
): string {
  let str = translations[locale][key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}
