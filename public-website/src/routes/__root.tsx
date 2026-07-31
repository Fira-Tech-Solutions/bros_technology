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
      { title: "BROS Technology — Electronics Accessories in Ethiopia" },
      {
        name: "description",
        content:
          "BROS Technology \u2014 quality electronics accessories at the best prices in Ethiopia.",
      },
      { name: "theme-color", content: "#c85a2a" },
      { property: "og:title", content: "BROS Technology — Electronics Accessories in Ethiopia" },
      {
        property: "og:description",
        content:
          "BROS Technology \u2014 quality electronics accessories at the best prices in Ethiopia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Ethiopic:wght@300;400;500;600&family=Noto+Serif+Ethiopic:wght@400;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/images/favicon/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/images/favicon/favicon.svg" },
      { rel: "shortcut icon", href: "/images/favicon/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/images/favicon/apple-touch-icon.png" },
      { rel: "manifest", href: "/images/favicon/site.webmanifest" },
      {
        rel: "preload",
        as: "image",
        href: "/images/bros_desktop_dark_HD.jpg",
        media: "(min-width: 768px)",
      },
      {
        rel: "preload",
        as: "image",
        href: "/images/bros_mobile_dark_HD.png",
        media: "(max-width: 767px)",
      },
      { rel: "script", src: "https://telegram.org/js/telegram-web-app.js" },
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
