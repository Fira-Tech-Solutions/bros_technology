export type Locale = "en" | "om" | "am";

export const LOCALES: {
  code: Locale;
  label: string;
  nativeLabel: string;
  script: "latin" | "geez";
}[] = [
  { code: "en", label: "English", nativeLabel: "English", script: "latin" },
  { code: "om", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo", script: "latin" },
  { code: "am", label: "Amharic", nativeLabel: "\u1260\u121A\u1295\u1348\u1293", script: "geez" },
];

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
  },

  om: {
    "nav.home": "Maqaa",
    "nav.catalog": "Oonuu",
    "nav.contact": "Quunnamtii",
    "nav.discover": "Ilaali",

    "hero.badge": "Maakaa elektirooniksii amanamaa",
    "hero.title": "Teknolojii,",
    "hero.titleAccent": "nutti kenname",
    "hero.description": "Onoonni elektirooniksii guyyaa fi gammoo ta\u2019u Etiyophiyaa keessa.",
    "hero.cta": "Oonuu ilaalaa",
    "hero.featured": "Filatame",

    "categories.browse": "Ilaali",
    "categories.title": "Garee Irraa Ilaali",

    "featured.badge": "Jaallatamaa",
    "featured.title": "Oonuu Filataman",
    "featured.viewAll": "Hunda ilaalaa",

    "footer.badge": "Quunnamtii",
    "footer.title": "Isinseen gamuun jirtaa? Eegaa.",
    "footer.emailPlaceholder": "Imeelii kee",
    "footer.cta": "Ergi",
    "footer.copyright": "\u00A9 {year} BROS Technology. Mirkiileen hundaa eegaltame.",

    "catalog.badge": "Oonuu",
    "catalog.allProducts": "Oonuu Hunda",
    "catalog.showing": "Mul\u2019aa {count}",
    "catalog.products": "oonuu",
    "catalog.product": "oonuu",
    "catalog.gathering": "Oonuu fe\u2019aa jiru\u2026",
    "catalog.updating": "fooyya\u2019uu jira\u2026",
    "catalog.searchPlaceholder": "Oonuu, maqaa guyyaa barbaadhu\u2026",
    "catalog.filters": "Gingilchii",
    "catalog.active": "socho\u2019aa",
    "catalog.refine": "Filii",
    "catalog.showResults": "{count} {type} mul\u2019isi",
    "catalog.resetAll": "Gingilchii hunda kenneessi",

    "filter.price": "Gargaarsa",
    "filter.brand": "Brandii",
    "filter.condition": "Haala",
    "filter.any": "Kennee",
    "filter.resetAll": "Gingilchii hunda kenneessi",

    "property.backToCollection": "Deebi\u2019i oonuu",
    "property.aboutProduct": "Oonuu kana",
    "property.gallery": "Gallery",
    "property.specs": "Yaada",
    "property.description": "Ibsa",
    "property.orderNow": "Amma ajajaa",
    "property.orderViaTelegram": "Telegram irraa ajajaa",
    "property.orderViaWhatsApp": "WhatsApp irraa ajajaa",
    "property.callToOrder": "Bilbila\u2019uun ajajaa",
    "property.inStock": "Jira",
    "property.outOfStock": "Dhabaa",
    "property.brandNew": "Haaraa",
    "property.from": "Gargaarsa",

    "empty.title": "Oonuu hin argamne",
    "empty.description":
      "Barbaaduu kee ykn gingilchii jijjiirraa godhu \u2014 oonuun barbaadduu tuqaa tokko qofa ta\u2019aachuu malta.",
    "empty.resetAll": "Gingilchii hunda kenneessi",

    "error.notFound": "Oonuu hin argamne.",
    "error.somethingWrong":
      "Waa\u2019ee tokko sirrii hin taane. Jijjiirraa godhu ykn gurraatti deebi\u2019i.",
    "error.tryAgain": "Irra deebi\u2019i yaali",

    "404.title": "404",
    "404.subtitle": "Fuula hin argamne",
    "404.description": "Fuula barbaadduun hin jiru ykn of irra jijjiiramee jira.",
    "404.goHome": "Maqaa deebi\u2019i",

    "about.badge": "BROS Technology Waliin",
    "about.title": "Maqaan Keessan Elektirooniksii Amanamaa Addis Ababa Keessa",
    "about.p1":
      "BROS Technology Etiyophiyaa keessa elektirooniksii, laptoppii, smartfoonii, teebilii, fi jecnulli keessa bu\u2019aa guyyaa ta\u2019u. MacBook haaraa, Samsung Galaxy, iPhone, ykn Dell laptoppii amanamaa barbaadde, karaa hundaa fi needs hundaa qofa jechuun kan si\u2019ifame.",
    "about.p2":
      "Oonuu hunduu warantii waliin argamu, fi gareen gochaanii Addis Ababa keessa jiru ati device sirrii barbaadduuf si\u2019ifame. Apple, Samsung, Dell, Lenovo, HP fi kan kaawu irratti oonuu godhina.",
    "about.offerHeading": "Maal Arginna",
    "about.offer1": "Laptoppii \u2014 Dell, Lenovo, HP, MacBook barattoota fi hojjettootaaf",
    "about.offer2": "iPhones & Samsung \u2014 Fooyya\u2019ama haaraa warantii waliin",
    "about.offer3": "iPads & MacBooks \u2014 Abbaa karoottii fi barattootaaf",
    "about.offer4": "AirPods & Smartwatches \u2014 Soodduu fi waan ulfataa",
    "about.offer5": "Ergina biyya bulchiinsa Etiyophiyaa keessaa",
  },

  am: {
    "nav.home": "\u1230\u1295\u12CD",
    "nav.catalog": "\u1265\u1295\u12CB\u1295\u1293",
    "nav.contact": "\u1270\u1308\u1235",
    "nav.discover": "\u1265\u1295\u12CB\u1295\u1293 \u1260\u1275\u12F3\u1263",

    "hero.badge": "\u1270\u1275\u1228\u122A\u12EB \u1265\u1295\u12CB\u1295\u1293 \u1285\u12A8",
    "hero.title": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295,",
    "hero.titleAccent": "\u1270\u12AD\u1295\u1231\u1237\u1228\u1235",
    "hero.description":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1348\u1275\u1237\u123B\u1228\u1235 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB \u1325\u1295\u1265\u1233\u1295.",
    "hero.cta": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1260\u1275\u12F3\u1263\u1295",
    "hero.featured": "\u1270\u1265\u1293\u122D\u12AB\u1295",

    "categories.browse": "\u1260\u1275\u12F3\u1263\u1295",
    "categories.title":
      "\u1265\u121A\u1293\u1295 \u12B3\u1295\u12CD\u1295\u1293\u1295 \u1260\u1275\u12F3\u1263\u1295",

    "featured.badge": "\u1270\u1265\u1293\u122D\u12AB\u1295",
    "featured.title":
      "\u1270\u1265\u1293\u122D\u12AB\u1295 \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295",
    "featured.viewAll": "\u1265\u1293\u12D3\u12E8\u1295 \u1260\u1275\u12F3\u1263\u1295",

    "footer.badge": "\u1270\u1228\u1276\u12CD\u122A\u1295\u123B\u1228\u1293\u1295",
    "footer.title":
      "\u12A8\u12F5\u1325\u1233\u1295\u1297\u12EB\u1295? \u12E8\u1308\u1235\u123D\u12F3\u1228\u1235.",
    "footer.emailPlaceholder":
      "\u12E8\u1276\u12CD\u122A\u1275\u123B\u1228\u1293\u1295\u12E8\u129B\u12E8",
    "footer.cta": "\u1265\u1233\u1295 \u12A8\u12E0\u12A3",
    "footer.copyright":
      "\u00A9 {year} BROS Technology. \u1265\u1293\u12D3\u12E8\u1295 \u1270\u122E\u1295\u12CD\u1295 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB\u1295.",

    "catalog.badge": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295",
    "catalog.allProducts":
      "\u1265\u1293\u12D3\u12E8\u1295 \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295",
    "catalog.showing": "\u1260\u1275\u12F3\u1231\u1295\u1349\u1295 {count}",
    "catalog.products": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295",
    "catalog.product": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295",
    "catalog.gathering":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1260\u124D\u1228\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1228\u1276\u2026",
    "catalog.updating":
      "\u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u1296\u1295\u1297\u1349\u1228\u1276\u2026",
    "catalog.searchPlaceholder":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295, \u1265\u1295\u12CB\u1295\u1293 \u1260\u124D\u1295\u12F3\u1293\u1295\u2026",
    "catalog.filters": "\u1302\u122E\u12F5\u1231\u134D\u1293",
    "catalog.active": "\u1308\u1323\u123D\u12F3\u1237\u1297\u12EB",
    "catalog.refine": "\u1260\u130D\u12F5\u1218\u1228\u1293\u1295",
    "catalog.showResults": "{count} {type} \u1260\u1275\u12F3\u1231\u1295\u1349",
    "catalog.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "filter.price": "\u12E8\u1276\u12CD\u122A",
    "filter.brand": "\u1265\u1295\u12CB\u1295\u1293",
    "filter.condition": "\u1270\u12AD\u1295\u1231\u1237\u1228\u1235",
    "filter.any": "\u12E8\u1228\u1276\u12CD\u122A",
    "filter.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "property.backToCollection":
      "\u1348\u12AC\u1235 \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295\u12E8",
    "property.aboutProduct": "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u124D\u1293\u1295",
    "property.gallery": "\u1218\u12F5\u121B\u1295",
    "property.specs": "\u1260\u127D\u129A\u1295\u1293\u1295",
    "property.description": "\u1273\u1349\u1228\u1293\u1295",
    "property.orderNow": "\u1240\u1295 \u12A8\u1295\u12CB\u1293",
    "property.orderViaTelegram": "\u1265\u1233\u1295 Telegram \u12A8\u1295\u12CB\u1293",
    "property.orderViaWhatsApp": "\u1265\u1233\u1295 WhatsApp \u12A8\u1295\u12CB\u1293",
    "property.callToOrder": "\u1265\u1233\u1295 \u12A8\u12E0\u12A3\u1295\u12F3\u1233",
    "property.inStock": "\u12A0\u1295\u12F3\u1237\u1228\u1235 \u1290\u1295",
    "property.outOfStock": "\u12A0\u1295\u12F3\u1237\u1228\u1235 \u130D\u12F5\u1218",
    "property.brandNew": "\u1265\u1295\u12CB\u1295\u1293 \u1270\u1228\u1276\u12CD\u122A",
    "property.from": "\u12E8\u1276\u12CD\u122A",

    "empty.title":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u130D\u12F5\u1218\u1228\u1295",
    "empty.description":
      "\u12E8\u1276\u12CD\u122A \u130D\u1295\u12F5\u1323\u1295\u1237\u1228\u1235 \u12E8\u1273\u130D\u12F5\u1323\u1295\u1237\u1228\u1235 \u12A8\u12F5\u1325\u1233\u1295 \u1302\u122E\u12F5\u1231\u134D\u1293 \u12A8\u1235\u12E8\u1295\u1293\u12F5\u1233\u1295 \u2014 \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295\u12E8 \u1260\u1233\u1276\u1295 \u12F3\u1295\u1228\u1295 \u12A0\u1295\u12F3\u1237\u1228\u1235 \u12A0\u1276\u127D\u1296\u1295\u1235\u1297\u12EB\u1295.",
    "empty.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "error.notFound":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u130D\u12F5\u1218\u1228\u1295.",
    "error.somethingWrong":
      "\u1265\u1230\u1276\u12CD\u122A \u1308\u1233\u129B\u1293\u1295\u1349\u1228\u1295 \u1320\u1295\u12CD\u1295 \u12E8\u1218\u12F5\u1228\u1349\u1228\u1276. \u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u12F3\u1233 \u12A8\u12F5\u1325\u1233\u1295 \u12E8\u1273\u1308\u1237\u1233\u1228 \u12AB\u1293\u12D3\u12E8\u1228\u1295\u12F3\u1233.",
    "error.tryAgain": "\u12EB\u1233\u1325\u1233 \u1323\u1295\u1265\u1233\u1295",

    "404.title": "404",
    "404.subtitle": "\u1273\u12E9\u1228\u1349\u1293\u1295 \u130D\u12F5\u1218\u1228\u1295",
    "404.description":
      "\u1273\u12E9\u1228\u1349\u1293\u1295 \u12EB\u1233\u12AB\u1293\u1295\u12E8\u1295\u1235\u1276 \u12E8\u1218\u12F5\u1228\u1349\u1228\u1276 \u12A8\u12F5\u1325\u1233\u1295 \u12E8\u1273\u1308\u1237\u1233\u1228 \u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u1295.",
    "404.goHome": "\u1230\u1295\u12CD\u12E8",

    "about.badge": "\u1265\u1295\u12CB\u1295\u1293 \u1273\u1228\u1228\u1235\u1293\u1295",
    "about.title":
      "\u1265\u1293\u12D3\u12E8\u1295 \u1265\u1295\u12CB\u1295\u1293 \u1285\u12A8 \u12A6\u122A\u122B\u1228\u122A\u134D \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB",
    "about.p1":
      "\u1265\u1295\u12CB\u1295\u1293 \u1273\u1228\u1228\u1235\u1293\u1295 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB \u127A\u1295\u1295\u122A\u1228 \u12EB\u1233\u12AB\u1293\u1295 \u1265\u1295\u12CB\u1295\u1293 \u1270\u12AD\u1293\u1295\u1348\u1295 \u1265\u1295\u12CB\u1295\u1293 \u12A0\u1295\u12F3\u1237\u1228\u1235\u1295\u1349\u1295 \u1260\u124D\u1230\u1295\u1293\u1295 \u12E8\u1218\u1295\u12F5\u1233\u1295\u1297\u12EB\u1295. MacBook \u1270\u1228\u1276\u12CD\u122A\u1295\u123B\u1228\u1295\u1295\u1285\u12A8\u1235 Samsung Galaxy \u1285\u12A8\u1235 iPhone \u1285\u12A8\u1235 \u12A0\u1295\u12F3\u1237\u1228\u1235 \u12D3\u1229\u1295 \u1273\u1229\u1295 Dell laptop \u1270\u12AD\u1295\u1231\u1237\u1228\u1235\u1295\u1349\u1295 \u1270\u12AD\u122A\u1295\u123B\u1228\u1295\u1295\u1285\u12A8\u1235 \u1265\u1293\u12D3\u12E8\u1295 \u12A6\u122D\u1293\u1228\u1295\u1349\u1295 \u1260\u124D\u1293\u1228\u1295\u1349\u1295 \u12A0\u1295\u12F3\u1237\u1228\u1235 \u1290\u1295\u1237\u1295\u1293.",
    "about.p2":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1273\u1228\u1228\u1235\u1293\u1295\u1349\u1295 \u1265\u1293\u12D3\u12E8\u1295 \u1265\u1295\u12CB\u1295\u1293 \u1273\u1228\u1228\u1235\u1293\u1295\u1295\u1349\u1295\u12E8 \u1270\u12AD\u1295\u1231\u1237\u1228\u1235\u1295\u1349\u1295 \u1290\u1295\u1237\u1295\u1293 \u12A6\u122A\u122B\u1228\u122A\u134D \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB \u12A0\u1295\u12F3\u1237\u1228\u1235 \u1260\u1293\u1234\u1295\u1295\u1295\u1285\u12A8\u1235 \u1265\u1293\u12D3\u12E8\u1295 \u1285\u12A8\u1235 \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1260\u124D\u1230\u1295\u1293\u1295 \u12A0\u1295\u12F3\u1237\u1228\u1235 \u1290\u1295. Apple, Samsung, Dell, Lenovo, HP \u1260\u124D\u1293\u1293\u1228\u1295\u1349\u1295\u1295\u1349\u1295 \u1265\u1293\u12D3\u12E8\u1295 \u1270\u1228\u1276\u12CD\u122A\u1295\u123B\u1228\u1295\u1295.",
    "about.offerHeading":
      "\u1270\u12AD\u1295\u1231\u1237\u1228\u1235 \u1273\u1295\u1293\u1295\u1349\u1295",
    "about.offer1":
      "\u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u2014 Dell, Lenovo, HP, MacBook \u1265\u1295\u12CB\u1295\u1293\u1295\u1349\u1295 \u1260\u124D\u1293\u1228\u1295\u1349\u1295\u1295\u1349\u1295\u1296\u1295",
    "about.offer2":
      "iPhones & Samsung \u2014 \u1270\u1228\u1276\u12CD\u122A\u1295\u123B\u1228\u1295\u1295 \u1273\u1228\u1228\u1235\u1293\u1295\u1295\u1349\u1295\u12E8",
    "about.offer3":
      "iPads & MacBooks \u2014 \u1270\u1228\u1276\u12CD\u122A \u12A0\u1293\u1293\u1295\u1295 \u1260\u124D\u1293\u1228\u1295\u1349\u1295\u1295\u1349\u1295\u1296\u1295",
    "about.offer4":
      "AirPods & Smartwatches \u2014 \u1273\u1229\u1295\u1349\u1295 \u12A6\u1229\u1295\u1349\u1295 \u1260\u124D\u1293\u1228\u1295\u1349\u1295\u1295\u1349\u1295\u1296\u1295",
    "about.offer5":
      "\u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB \u1265\u1293\u12D3\u12E8\u1295 \u1265\u1233\u1295\u1295\u1349\u1228\u1293\u1295\u1295\u1349\u1295",
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
