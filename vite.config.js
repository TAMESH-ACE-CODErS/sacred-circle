import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { getLatestVideos } from './api/youtube';
import { callQuotesScript } from './api/quotes';
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
function readJsonBody(request) {
    return new Promise((resolve) => {
        let raw = '';
        request.on('data', (chunk) => {
            raw += String(chunk ?? '');
        });
        request.on('end', () => {
            try {
                resolve(raw ? JSON.parse(raw) : undefined);
            }
            catch {
                resolve(undefined);
            }
        });
        request.on('error', () => resolve(undefined));
    });
}
// Mirrors the Vercel /api/quotes function during `npm run dev`.
function quotesDevApi(scriptUrl) {
    return {
        name: 'quotes-api-dev',
        configureServer(server) {
            server.middlewares.use('/api/quotes', async (request, response) => {
                const devRequest = request;
                const method = devRequest.method ?? 'GET';
                const query = {};
                new URL(devRequest.url ?? '/', 'http://localhost').searchParams.forEach((value, key) => {
                    query[key] = value;
                });
                const payload = method === 'POST' ? await readJsonBody(devRequest) : undefined;
                const result = await callQuotesScript(query, payload, scriptUrl);
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                response.setHeader('Cache-Control', method === 'GET' && !query.adminKey
                    ? 'public, s-maxage=60, stale-while-revalidate=300'
                    : 'no-store');
                response.statusCode = result.status;
                response.end(JSON.stringify(result.body));
            });
        },
    };
}
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const quotesScriptUrl = env.VITE_QUOTES_SCRIPT_URL || env.QUOTES_SCRIPT_URL || '';
    return {
        plugins: [react(), youtubeDevApi, quotesDevApi(quotesScriptUrl)],
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
    };
});
