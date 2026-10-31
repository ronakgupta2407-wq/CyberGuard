import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'localhost-webauthn-origin',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const host = request.headers.host?.split(':')[0];
          if (host !== '127.0.0.1') {
            next();
            return;
          }

          response.statusCode = 308;
          response.setHeader('Location', `http://localhost:5173${request.url || '/'}`);
          response.end();
        });
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
