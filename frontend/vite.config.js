import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'sitemap.xml', 'robots.txt'],
            manifest: {
                name: 'Wayzza — Curated Sanctuaries',
                short_name: 'Wayzza',
                description: 'Curated sanctuaries & elite mobility for the modern explorer.',
                theme_color: '#0a2618',
                background_color: '#0a2618',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/images/wayzza-icon.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/images/wayzza-icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/images/wayzza-icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            workbox: {
                // Only precache static app-shell assets. API calls contain user-,
                // booking-, payment-, and admin-specific data — keep them network-only
                // instead of persisting cross-session responses in the service worker.
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [
                    // Don't fallback on API routes or backend paths
                    /^\/api\//,
                    /^\/admin\//
                ],
                // Clean up outdated caches on SW activation
                cleanupOutdatedCaches: true,
                // Skip waiting so new SW activates immediately
                skipWaiting: true,
                clientsClaim: true
            }
        })
    ],
    server: {
        host: true,
        port: 5173,
        allowedHosts: [
            "79eca6c6bfca31.lhr.life",
            ".lhr.life"
        ]
    },
    build: {
        // Generate source maps for production error tracking
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['framer-motion', 'lucide-react', 'recharts'],
                    'maps-vendor': ['leaflet', 'react-leaflet', '@react-google-maps/api'],
                    'utils-vendor': ['date-fns', 'socket.io-client', 'posthog-js'],
                    // Large libraries
                    'pdf-vendor': ['jspdf'],
                    'calendar-vendor': ['react-date-range', 'react-datepicker']
                }
            }
        },
        chunkSizeWarningLimit: 600
    }
});