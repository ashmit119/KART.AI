import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import path from "path" // 1. Add this import at the top

export default defineConfig({
    plugins: [
        tanstackStart(),
        react()
    ],
    // 2. Add this entire resolve block to define the alias
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})