import { defineConfig } from "@lovable.dev/vite-tanstack-config"
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
    cloudflare: false,
    tanstackStart: {
        server: {
            preset: 'vercel'
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
            react(),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    }
})