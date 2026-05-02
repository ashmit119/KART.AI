import { defineConfig } from "@lovable.dev/vite-tanstack-config"
import path from "path"

export default defineConfig({
    cloudflare: false,
    tanstackStart: {
        server: {
            preset: 'vercel'
        }
    },
    vite: {
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    }
})