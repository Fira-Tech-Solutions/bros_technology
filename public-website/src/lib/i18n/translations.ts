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

  // Hero Background
  "hero.bg.abaGeda.title": string;
  "hero.bg.abaGeda.description": string;
  "hero.bg.posta.title": string;
  "hero.bg.posta.description": string;

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
  "catalog.allResidences": string;
  "catalog.showing": string;
  "catalog.properties": string;
  "catalog.property": string;
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
  "filter.bedrooms": string;
  "filter.bathrooms": string;
  "filter.amenities": string;
  "filter.any": string;
  "filter.resetAll": string;

  // Property
  "property.backToCollection": string;
  "property.theResidence": string;
  "property.gallery": string;
  "property.features": string;
  "property.location": string;
  "property.enquire": string;
  "property.namePlaceholder": string;
  "property.emailPlaceholder": string;
  "property.notePlaceholder": string;
  "property.requestViewing": string;
  "property.callConcierge": string;
  "property.bookViewing": string;
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
};

export const translations: Record<Locale, TranslationKeys> = {
  en: {
    "nav.home": "Home",
    "nav.catalog": "Catalog",
    "nav.contact": "Contact",
    "nav.discover": "Discover",

    "hero.badge": "A new chapter in residence",
    "hero.title": "Architecture,",
    "hero.titleAccent": "distilled",
    "hero.description":
      "A quiet portfolio of residences in the places that matter \u2014 chosen for light, line, and lasting craft.",
    "hero.cta": "Explore the collection",
    "hero.featured": "Featured",

    "hero.bg.abaGeda.title": "Adama Cityscape",
    "hero.bg.abaGeda.description": "The vibrant heart of Adama \u2014 where modern living meets the Rift Valley breeze.",
    "hero.bg.posta.title": "Rift Valley Views",
    "hero.bg.posta.description": "Nestled along the Great Rift Valley, Adama offers stunning landscapes and a thriving community.",

    "categories.browse": "Browse",
    "categories.title": "By disposition",

    "featured.badge": "Selected",
    "featured.title": "Currently in residence",
    "featured.viewAll": "View all",

    "footer.badge": "In conversation",
    "footer.title": "Begin a private viewing.",
    "footer.emailPlaceholder": "Your email",
    "footer.cta": "Request an appointment",
    "footer.copyright": "\u00A9 {year} Adama Property. All rights reserved.",

    "catalog.badge": "Collection",
    "catalog.allResidences": "All residences",
    "catalog.showing": "Showing {count}",
    "catalog.properties": "properties",
    "catalog.property": "property",
    "catalog.gathering": "Gathering residences\u2026",
    "catalog.updating": "updating\u2026",
    "catalog.searchPlaceholder": "Search location, name, tag\u2026",
    "catalog.filters": "Filters",
    "catalog.active": "active",
    "catalog.refine": "Refine",
    "catalog.showResults": "Show {count} {type}",
    "catalog.resetAll": "Reset all filters",

    "filter.price": "Price",
    "filter.bedrooms": "Bedrooms",
    "filter.bathrooms": "Bathrooms",
    "filter.amenities": "Amenities",
    "filter.any": "Any",
    "filter.resetAll": "Reset all filters",

    "property.backToCollection": "Back to collection",
    "property.theResidence": "The residence",
    "property.gallery": "Gallery",
    "property.features": "Features",
    "property.location": "Location",
    "property.enquire": "Enquire privately",
    "property.namePlaceholder": "Name",
    "property.emailPlaceholder": "Email",
    "property.notePlaceholder": "A note",
    "property.requestViewing": "Request a viewing",
    "property.callConcierge": "Call concierge",
    "property.bookViewing": "Book viewing",
    "property.from": "From",

    "empty.title": "No residences match",
    "empty.description":
      "Try widening your price range or removing a filter \u2014 your perfect retreat may be one tap away.",
    "empty.resetAll": "Reset all filters",

    "error.notFound": "Residence not found.",
    "error.somethingWrong":
      "Something went wrong on our end. You can try refreshing or head back home.",
    "error.tryAgain": "Try again",

    "404.title": "404",
    "404.subtitle": "Page not found",
    "404.description": "The page you\u2019re looking for doesn\u2019t exist or has been moved.",
    "404.goHome": "Go home",
  },

  om: {
    "nav.home": "Maqaa",
    "nav.catalog": "Kataalaa",
    "nav.contact": "Quunnamtii",
    "nav.discover": "Argadhu",

    "hero.badge": "Bagaayyee haaraa mannaa keessa",
    "hero.title": "Mimilaanii,",
    "hero.titleAccent": "cunqurfame",
    "hero.description":
      "Galmee nagaa mannaa iddoo barbaachisaa keessa \u2014 cuunqurfaman ifa, sarara, fi akkasumas hiikaa waamaraa godhamuudha.",
    "hero.cta": "Tolee hordofii argadhu",
    "hero.featured": "Filatame",

    "hero.bg.abaGeda.title": "Magnaanaa Adamaa",
    "hero.bg.abaGeda.description": "Laluu Adamaa \u2014 haqa qabuu fi sagalee Rift Valley waliin qusachuu.",
    "hero.bg.posta.title": "Ilaaicha Rift Valley",
    "hero.bg.posta.description": "Adamaa, Rift Valley keessa, argama fi humna waldaa qabu.",

    "categories.browse": "Ilaali",
    "categories.title": "Akkaataa Tuqaa",

    "featured.badge": "Filatame",
    "featured.title": "Amma mannaa keessa",
    "featured.viewAll": "Hunda ilaalaa",

    "footer.badge": "Jalqabduu",
    "footer.title": "Mulqata qabuuffii jalqabu.",
    "footer.emailPlaceholder": "Imeelii kee",
    "footer.cta": "Yeroo gaafii request godhu",
    "footer.copyright": "\u00A9 {year} Adama Property. Mirkiileen hundaa eegaltame.",

    "catalog.badge": "Tolee",
    "catalog.allResidences": "Manna hunda",
    "catalog.showing": "Mul\u2019aa {count}",
    "catalog.properties": "manna",
    "catalog.property": "manaa",
    "catalog.gathering": "Manna toltchuun jira\u2026",
    "catalog.updating": "fooyya\u2019uu jira\u2026",
    "catalog.searchPlaceholder": "Iddoo, maqaa, tagii barbaadhu\u2026",
    "catalog.filters": "Gingilchii",
    "catalog.active": "socho\u2019aa",
    "catalog.refine": "Filii",
    "catalog.showResults": "{count} {type} mul\u2019isi",
    "catalog.resetAll": "Gingilchii hunda kenneessi",

    "filter.price": "Gargaarsa",
    "filter.bedrooms": "Kutaa",
    "filter.bathrooms": "Baathroom",
    "filter.amenities": "Ga\u2019eewwan",
    "filter.any": "Kennee",
    "filter.resetAll": "Gingilchii hunda kenneessi",

    "property.backToCollection": "Deebi\u2019i tolee",
    "property.theResidence": "Mannaa",
    "property.gallery": "Gallery",
    "property.features": "Amala",
    "property.location": "Iddoo",
    "property.enquire": "Dorgommii qabuuf gaafii godhu",
    "property.namePlaceholder": "Maqaa",
    "property.emailPlaceholder": "Imeelii",
    "property.notePlaceholder": "Addaawaa",
    "property.requestViewing": "Mul\u2019ata request godhu",
    "property.callConcierge": "Concierge tuqu",
    "property.bookViewing": "Mul\u2019ata gurraachuu",
    "property.from": "Ijjaa",

    "empty.title": "Manna hin argamne",
    "empty.description":
      "Gargaarsa bal\u2019aa ta\u2019e ykn gingilchii haqa \u2014 mannaa PERFECT kee tuqaa tokko qofa ta\u2019aachuu malta.",
    "empty.resetAll": "Gingilchii hunda kenneessi",

    "error.notFound": "Manna hin argamne.",
    "error.somethingWrong":
      "Waa\u2019ee tokko sirrii hin taane. Jijjiirraa godhu ykn gurraatti deebi\u2019i.",
    "error.tryAgain": "Irra deebi\u2019i yaali",

    "404.title": "404",
    "404.subtitle": "Fuula hin argamne",
    "404.description": "Fuula barbaadduun hin jiru ykn of irra jijjiiramee jira.",
    "404.goHome": "Maqaa deebi\u2019i",
  },

  am: {
    "nav.home": "\u1230\u1295\u12CD",
    "nav.catalog": "\u1218\u12F5\u121B\u1295",
    "nav.contact": "\u1270\u1308\u1235",
    "nav.discover": "\u1260\u124D\u1295\u12F3",

    "hero.badge":
      "\u1265\u1293\u122D\u12AB\u1295 \u1235\u1228\u134A \u1348\u1275\u1237\u123B\u1228\u1235 \u1270\u1228\u1276",
    "hero.title": "\u1260\u1228\u1295\u12F5\u1233\u1293\u1295,",
    "hero.titleAccent": "\u12E8\u121B\u122A\u1295\u12CD\u1295",
    "hero.description":
      "\u1273\u1275\u1228\u122A\u12EB \u1348\u1275\u1237\u123B\u1228\u1235\u1233\u1293\u1295 \u1270\u1218\u1293\u1236\u1295\u1237\u1228\u1235 \u1275\u122B\u1293\u1295\u1349\u1235 \u2014 \u12F3\u1295\u1228\u1295\u1233, \u1265\u121B\u1295, \u12AB\u1293\u12D3\u122E \u1270\u12AB\u1276\u12CD\u122A\u1349\u1235\u1237\u1228\u1235 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB\u1295.",
    "hero.cta": "\u1218\u12F5\u121B\u1295\u12E8 \u1308\u1235\u123D\u12F3\u1228\u1235",
    "hero.featured": "\u1270\u1265\u1293\u122D\u12AB\u1295",

    "hero.bg.abaGeda.title": "\u1260\u1228\u1230\u121A\u12F3 \u1260\u1228\u1230\u121A\u12F3",
    "hero.bg.abaGeda.description": "\u1260\u1228\u1230\u121A\u12F3 \u1270\u12AB\u1276\u12CD\u122A\u1349\u1235 \u2014 \u1235\u1228\u134A \u1273\u1275\u1228\u122A\u12EB \u1290\u1295\u12F5\u1260\u1228\u1276 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB\u1295.",
    "hero.bg.posta.title": "\u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5 \u1265\u121B\u1295",
    "hero.bg.posta.description": "\u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5 \u1265\u121B\u1295\u2014\u2014 \u1260\u1228\u1230\u121A\u12F3 \u1270\u1218\u1293\u1236\u1295 \u1270\u12AD\u1295\u1231\u1237\u123B\u1228\u1235 \u12AB\u1293\u12D3\u12E8\u1295\u2014\u2014 \u1265\u1293\u12D3\u12E8\u1295 \u1270\u12AB\u1276\u12CD\u122A\u1349\u1235\u1237\u1228\u1235 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB\u1295.",

    "categories.browse": "\u1260\u1275\u12F3\u1263\u1295",
    "categories.title": "\u1265\u121A\u1293\u1295 \u12B3\u1295\u12CD\u1295\u1293\u1295",

    "featured.badge": "\u1270\u1265\u1293\u122D\u12AB\u1295",
    "featured.title":
      "\u1218\u1325\u1228\u12E8 \u1348\u1275\u1237\u123B\u1228\u1235 \u1270\u1228\u1276",
    "featured.viewAll": "\u1265\u1293\u12D3\u12E8\u1295 \u1260\u1275\u12F3\u1263\u1295",

    "footer.badge": "\u1273\u1275\u122B\u1293\u1295\u1237\u1228\u1235",
    "footer.title":
      "\u1273\u1348\u1233\u12AB\u1295 \u1348\u1275\u1237\u123B\u1228\u1235 \u1323\u1295\u1265\u1233\u1295.",
    "footer.emailPlaceholder":
      "\u12E8\u1276\u12CD\u122A\u1275\u123B\u1228\u1293\u1295\u12E8\u129B\u12E8",
    "footer.cta": "\u1270\u1323\u1295\u1265\u1233\u1295 \u12EB\u1295\u12F5\u1260\u1228\u1276",
    "footer.copyright":
      "\u00A9 {year} Adama Property. \u1265\u1293\u12D3\u12E8\u1295 \u1270\u122E\u1295\u12CD\u1295 \u12E8\u1320\u1293\u12CD\u1295\u1297\u12EB\u1295.",

    "catalog.badge": "\u1218\u12F5\u121B\u1295",
    "catalog.allResidences": "\u1265\u1293\u12D3\u12E8\u1295 \u1348\u1275\u1237\u123B\u1228\u1235",
    "catalog.showing": "\u1260\u1275\u12F3\u1231\u1295\u1349\u1295 {count}",
    "catalog.properties": "\u1348\u1275\u1237\u123B\u1228\u1235",
    "catalog.property": "\u1348\u1275\u1237\u123B\u1228\u1235",
    "catalog.gathering":
      "\u1348\u1275\u1237\u123B\u1228\u1235 \u1260\u124D\u1228\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1228\u1276\u2026",
    "catalog.updating":
      "\u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u1296\u1295\u1297\u1349\u1228\u1276\u2026",
    "catalog.searchPlaceholder":
      "\u1260\u124D\u1295\u12F3\u1293\u1295, \u12E8\u1276\u12CD\u122A, \u127F\u1228\u1295 \u1260\u124D\u1295\u12F3\u1293\u1295\u2026",
    "catalog.filters": "\u1302\u122E\u12F5\u1231\u134D\u1293",
    "catalog.active": "\u1308\u1323\u123D\u12F3\u1237\u1297\u12EB",
    "catalog.refine": "\u1260\u130D\u12F5\u1218\u1228\u1293\u1295",
    "catalog.showResults": "{count} {type} \u1260\u1275\u12F3\u1231\u1295\u1349",
    "catalog.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "filter.price": "\u12E8\u1276\u12CD\u122A",
    "filter.bedrooms": "\u12E8\u1233\u1230\u1237\u123B\u1228\u1235",
    "filter.bathrooms": "\u12D0\u1233\u1230\u1237\u123B\u1228\u1235",
    "filter.amenities": "\u1270\u12AD\u1295\u1231\u1237\u123B\u1228\u1235",
    "filter.any": "\u12E8\u1228\u1276\u12CD\u122A",
    "filter.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "property.backToCollection": "\u1348\u12AC\u1235 \u1218\u12F5\u121B\u1295\u12E8",
    "property.theResidence": "\u1348\u1275\u1237\u123B\u1228\u1235",
    "property.gallery": "\u1218\u12F5\u121B\u1295",
    "property.features": "\u1270\u12AD\u1295\u1231\u1237\u123B\u1228\u1235",
    "property.location": "\u1270\u1218\u1293\u1236",
    "property.enquire": "\u1273\u1348\u1233\u12AB\u1295 \u12EB\u1295\u12F5\u1260\u1228\u1276",
    "property.namePlaceholder": "\u12E8\u1276\u12CD\u122A",
    "property.emailPlaceholder":
      "\u12E8\u1276\u12CD\u122A\u1275\u123B\u1228\u1293\u1295\u12E8\u129B\u12E8",
    "property.notePlaceholder": "\u1273\u1349\u1228\u1293\u1295",
    "property.requestViewing":
      "\u1270\u1275\u12F3\u1263\u1295 \u12EB\u1295\u12F5\u1260\u1228\u1276",
    "property.callConcierge": "Concierge \u12E8\u1273\u130D\u1295",
    "property.bookViewing":
      "\u1270\u1275\u12F3\u1263\u1295 \u12E8\u1218\u1308\u122B\u1295\u12F3\u1233",
    "property.from": "\u1260\u1233\u1276\u1295",

    "empty.title": "\u1348\u1275\u1237\u123B\u1228\u1235 \u130D\u12F5\u1218\u1228\u1295",
    "empty.description":
      "\u12E8\u1276\u12CD\u122A \u130D\u1295\u12F5\u1323\u1295\u1237\u1228\u1235 \u12E8\u1273\u130D\u12F5\u1323\u1295\u1237\u1228\u1235 \u12A8\u12F5\u1325\u1233\u1295 \u1302\u122E\u12F5\u1231\u134D\u1293 \u12A8\u1235\u12E8\u1295\u1293\u12F5\u1233\u1295 \u2014 \u12E8\u1300\u121A\u1235 \u1348\u1275\u1237\u123B\u1228\u1235\u12E8 \u1260\u1233\u1276\u1295 \u12F3\u1295\u1228\u1295 \u12A0\u1295\u12F3\u1237\u1228\u1235 \u12A0\u1276\u127D\u1296\u1295\u1235\u1297\u12EB\u1295.",
    "empty.resetAll":
      "\u1302\u122E\u12F5\u1231\u134D\u1293 \u1265\u1293\u12D3\u12E8\u1295 \u12E8\u1218\u1348\u12F5\u1233\u12CD\u1295\u1296\u1295\u1297\u1349\u1295",

    "error.notFound": "\u1348\u1275\u1237\u123B\u1228\u1235 \u130D\u12F5\u1218\u1228\u1295.",
    "error.somethingWrong":
      "\u1265\u1230\u1276\u12CD\u122A \u1308\u1233\u129B\u1293\u1295\u1349\u1228\u1295 \u1320\u1295\u12CD\u1295 \u12E8\u1218\u12F5\u1228\u1349\u1228\u1276. \u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u12F3\u1233 \u12A8\u12F5\u1325\u1233\u1295 \u12E8\u1273\u1308\u1237\u1233\u1228 \u12AB\u1293\u12D3\u12E8\u1228\u1295\u12F3\u1233.",
    "error.tryAgain": "\u12EB\u1233\u1325\u1233 \u1323\u1295\u1265\u1233\u1295",

    "404.title": "404",
    "404.subtitle": "\u1273\u12E9\u1228\u1349\u1293\u1295 \u130D\u12F5\u1218\u1228\u1295",
    "404.description":
      "\u1273\u12E9\u1228\u1349\u1293\u1295 \u12EB\u1233\u12AB\u1293\u1295\u12E8\u1295\u1235\u1276 \u12E8\u1218\u12F5\u1228\u1349\u1228\u1276 \u12A8\u12F5\u1325\u1233\u1295 \u12E8\u1273\u1308\u1237\u1233\u1228 \u12E8\u121B\u1293\u12CD\u1295\u1228\u12F5\u1323\u1228\u12CD\u1228\u1295\u1295.",
    "404.goHome": "\u1230\u1295\u12CD\u12E8",
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
