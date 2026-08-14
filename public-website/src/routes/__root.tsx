import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../providers/theme";
import { LocaleProvider } from "../providers/locale";
import { LocalBusinessJsonLd, WebSiteJsonLd } from "../components/JsonLd";
import { SITE_URL, absoluteUrl } from "../lib/env";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      {
        title:
          "BROS Technology — Buy Laptops, iPhones, Samsung, iPads, MacBooks & Accessories in Ethiopia",
      },
      {
        name: "description",
        content:
          "Shop laptops, iPhones, Samsung phones, iPads, MacBooks, AirPods, and smartwatches at BROS Technology. Best prices on new and used electronics in Addis Ababa, Ethiopia. Warranty included.",
      },
      {
        name: "keywords",
        content:
          "laptop Ethiopia, buy laptop Addis Ababa, iPhone price Ethiopia, Samsung phone Ethiopia, MacBook Ethiopia, iPad Ethiopia, AirPods Ethiopia, smartwatch Ethiopia, computer shop Addis Ababa, electronics accessories Ethiopia, used laptop Ethiopia, new laptop price, computer store Addis Ababa",
      },
      { name: "theme-color", content: "#1878B4" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      {
        property: "og:title",
        content: "BROS Technology — Buy Laptops, iPhones, Samsung & Electronics in Ethiopia",
      },
      {
        property: "og:description",
        content:
          "Shop laptops, iPhones, Samsung, iPads, MacBooks, AirPods & smartwatches at best prices in Addis Ababa, Ethiopia. Warranty included.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: absoluteUrl("/images/hero/desktop-dark-1920.jpg") },
      { property: "og:locale", content: "en_ET" },
      { property: "og:site_name", content: "BROS Technology" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "BROS Technology — Buy Laptops, iPhones, Samsung & Electronics in Ethiopia",
      },
      {
        name: "twitter:description",
        content:
          "Shop laptops, iPhones, Samsung, iPads, MacBooks, AirPods & smartwatches at best prices in Addis Ababa, Ethiopia.",
      },
      { name: "twitter:image", content: absoluteUrl("/images/hero/desktop-dark-1920.jpg") },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // No canonical here — each route sets its own. A root-level canonical
      // would mark every page as a duplicate of the homepage.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://res.cloudinary.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Ethiopic:wght@300;400;500;600&family=Noto+Serif+Ethiopic:wght@400;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/images/favicon/favicon-96x96.png", sizes: "96x96" },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: "/images/hero/desktop-dark-1920.avif",
        media: "(min-width: 768px)",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: "/images/hero/mobile-dark-828.avif",
        media: "(max-width: 767px)",
      },
      { rel: "alternate", hrefLang: "en", href: SITE_URL },
      { rel: "alternate", hrefLang: "om", href: SITE_URL },
      { rel: "alternate", hrefLang: "am", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="transition-colors duration-300">
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg){document.documentElement.classList.toggle('dark',tg.colorScheme==='dark');document.documentElement.classList.toggle('light',tg.colorScheme==='light');if(tg.themeParams&&tg.themeParams.bg_color){document.documentElement.style.setProperty('--background',tg.themeParams.bg_color)}}}catch(e){}})()`,
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <Outlet />
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
