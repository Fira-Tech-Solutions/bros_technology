import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [
    tanstackStart(),
    tailwindcss(),
    nitro({ preset: "vercel" }),
    viteReact(),
    tsconfigPaths(),
  ],
});
