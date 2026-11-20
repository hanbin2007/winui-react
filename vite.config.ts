import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gallery (demo) app.
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works from any sub-path (such as GitHub Pages).
  base: './',
  build: { outDir: 'dist-gallery' },
});
