import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';

export default defineConfig({
    plugins: [
        tanstackStart(),
        nitro(), // Add this plugin
        viteReact()
    ],
});