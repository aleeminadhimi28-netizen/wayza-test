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
    }
});
