import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from /health-tech-arcade/.
export default defineConfig({
  base: '/health-tech-arcade/',
  plugins: [react()],
});
