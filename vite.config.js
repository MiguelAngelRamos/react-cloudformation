// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'istanbul', // o 'v8' si prefieres
      reporter: ['text', 'html'], // Tipos de reporte que deseas
      include: ['src/**/*.{js,ts,jsx,tsx}'], // Archivos a incluir en el reporte
    }
  },
});
