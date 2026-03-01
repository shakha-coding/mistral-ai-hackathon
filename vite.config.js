import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            // Sophia (alpha) → base model on port 8080
            '/api/base/v1/chat/completions': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                rewrite: (path) => '/v1/chat/completions',
            },
            // Yuki (beta) → adapter model on port 8081
            '/api/adapter/v1/chat/completions': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
                rewrite: (path) => '/v1/chat/completions',
            },
        }
    }
});
