import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/fuzzy-drive-ai/',
  test: { globals: true, environment: 'node' },
});
