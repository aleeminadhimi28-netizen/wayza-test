import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        allowedHosts: [
            "79eca6c6bfca31.lhr.life",
            ".lhr.life"
        ]
    },
    build: {
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
        chunkSizeWarningLimit: 600 // Increase limit slightly
    }
});
