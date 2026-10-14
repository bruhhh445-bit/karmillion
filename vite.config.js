import { defineConfig } from 'vite';

// The game is served from https://bruhhh445-bit.github.io/karmillion/
export default defineConfig({
  base: '/karmillion/',
  build: { target: 'es2019' },
});
