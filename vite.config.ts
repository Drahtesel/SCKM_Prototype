import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Automatische Base-URL für GitHub Pages (https://drahtesel.github.io/SCKM_Prototype/)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/SCKM_Prototype/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
}));
