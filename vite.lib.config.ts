import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Library build: ESM + CJS bundles and one stylesheet.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)),
      name: 'WinUIReact',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'winui-react.js' : 'winui-react.cjs'),
      cssFileName: 'winui-react',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
