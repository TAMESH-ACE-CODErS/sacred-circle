import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getLatestVideos } from './api/youtube';
// Mirrors the Vercel /api/youtube function during `npm run dev`.
const youtubeDevApi = {
    name: 'youtube-api-dev',
    configureServer(server) {
        server.middlewares.use('/api/youtube', async (_request, response) => {
            try {
                const data = await getLatestVideos();
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                response.setHeader('Cache-Control', 'public, s-maxage=1800');
                response.end(JSON.stringify(data));
            }
            catch {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                response.end(JSON.stringify({ videos: [], source: 'fallback' }));
            }
        });
    },
};
export default defineConfig({
    plugins: [react(), youtubeDevApi],
    server: { port: 5173 },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                    supabase: ['@supabase/supabase-js'],
                },
            },
        },
    },
});
