import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { join } from 'path';

// Plugin para copiar .htaccess após o build
const copyHtaccess = () => {
  return {
    name: 'copy-htaccess',
    closeBundle() {
      try {
        copyFileSync(
          join(__dirname, 'public', '.htaccess'),
          join(__dirname, 'dist', '.htaccess')
        );
        console.log('✅ .htaccess copiado para dist/');
      } catch (error) {
        console.warn('⚠️  Não foi possível copiar .htaccess:', error);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyHtaccess()],
  // Caminho base: projeto roda na raiz do domínio
  base: '/',
  server: {
    // Porta padrão do Vite (5173) ou próxima disponível
    proxy: {
      '/api': {
        target: 'http://localhost', // Servidor PHP (XAMPP)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('⚠️ Erro no proxy da API:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxy:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
