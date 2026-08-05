import { SITE_URL } from "@/lib/env";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "BROS Technology",
        description:
          "Buy laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods, and smartwatches at best prices in Addis Ababa, Ethiopia. Warranty included.",
        url: SITE_URL,
        logo: `${SITE_URL}/images/favicon/favicon-96x96.png`,
        image: `${SITE_URL}/images/hero/desktop-dark-1920.jpg`,
        telephone: ["+251972195934", "+251980564814"],
        email: "girmasamuel200@gmail.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bole, Oromia building",
          addressLocality: "Addis Ababa",
          addressCountry: "ET",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "9.0054",
          longitude: "38.7636",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "19:00",
        },
        sameAs: [
          "https://t.me/brostechnology",
          "https://www.facebook.com/brostechnology",
          "https://www.instagram.com/brostechnology",
          "https://tiktok.com/@brostechnology",
          "https://youtube.com/@brostechnology",
        ],
        priceRange: "$$",
        areaServed: {
          "@type": "Country",
          name: "Ethiopia",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Electronics Accessories",
          itemListElement: [
            { "@type": "OfferCatalog", name: "Laptops", numberOfItems: 2 },
            { "@type": "OfferCatalog", name: "iPhones & Samsung Phones", numberOfItems: 1 },
            { "@type": "OfferCatalog", name: "Smartwatches", numberOfItems: 1 },
          ],
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "BROS Technology",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/catalog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function WebPageJsonLd({ name, description }: { name: string; description: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name,
        description,
        url: SITE_URL,
        isPartOf: {
          "@type": "WebSite",
          name: "BROS Technology",
          url: SITE_URL,
        },
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  price,
  image,
  description,
  brand,
  condition,
  availability = "https://schema.org/InStock",
  url,
}: {
  name: string;
  price: string;
  image: string;
  description?: string;
  brand?: string;
  condition?: string;
  availability?: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        image,
        description: description || `${name} available at BROS Technology in Addis Ababa, Ethiopia`,
        brand: brand ? { "@type": "Brand", name: brand } : undefined,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "ETB",
          price: price.replace(/[^0-9.]/g, ""),
          availability,
          itemCondition: condition?.includes("New")
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition",
        },
        seller: {
          "@type": "LocalBusiness",
          name: "BROS Technology",
          url: SITE_URL,
        },
      }}
    />
  );
}

export function CollectionPageJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Buy Laptops, iPhones, Samsung & Electronics — BROS Technology Ethiopia",
        description:
          "Browse and buy laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods, and smartwatches at BROS Technology in Addis Ababa, Ethiopia.",
        url: `${SITE_URL}/catalog`,
        isPartOf: {
          "@type": "WebSite",
          name: "BROS Technology",
          url: SITE_URL,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Products",
              item: `${SITE_URL}/catalog`,
            },
          ],
        },
      }}
    />
  );
}
