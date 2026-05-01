import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'
import path from "path"

export default defineConfig({
    plugins: [
        tanstackStart(),
        tailwindcss(),
        react(),
        tsconfigPaths(),
        nitro({
            preset: 'vercel'
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})