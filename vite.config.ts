import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'github-pages-helper',
        closeBundle() {
          try {
            const distDir = path.resolve(__dirname, 'dist');
            const distIndex = path.resolve(distDir, 'index.html');
            const dist404 = path.resolve(distDir, '404.html');
            const noJekyll = path.resolve(distDir, '.nojekyll');

            if (fs.existsSync(distIndex)) {
              fs.copyFileSync(distIndex, dist404);
            }
            if (fs.existsSync(distDir)) {
              fs.writeFileSync(noJekyll, '');
            }
          } catch (e) {
            console.warn('GitHub pages helper note:', e);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
