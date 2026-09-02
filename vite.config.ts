import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

// Plugin para copiar .htaccess e a pasta api/ após o build
const copyDeployAssets = () => {
  return {
    name: 'copy-deploy-assets',
    closeBundle() {
      const distDir = join(__dirname, 'dist');

      try {
        copyFileSync(
          join(__dirname, 'public', '.htaccess'),
          join(distDir, '.htaccess')
        );
        console.log('✅ .htaccess copiado para dist/');
      } catch (error) {
        console.warn('⚠️  Não foi possível copiar .htaccess:', error);
      }

      try {
        const apiSrc = join(__dirname, 'api');
        const apiDest = join(distDir, 'api');

        if (!existsSync(apiSrc)) {
          console.warn('⚠️  Pasta api/ não encontrada para copiar');
          return;
        }

        if (existsSync(apiDest)) {
          rmSync(apiDest, { recursive: true, force: true });
        }

        cpSync(apiSrc, apiDest, { recursive: true });
        console.log('✅ Pasta api/ copiada para dist/api/');
      } catch (error) {
        console.warn('⚠️  Não foi possível copiar a pasta api/:', error);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyDeployAssets()],
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
