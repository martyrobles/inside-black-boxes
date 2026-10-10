import { readdirSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const argumentDir = resolve(__dirname, 'arguments');
const argumentPages = Object.fromEntries(
  readdirSync(argumentDir)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .map((name) => [name.replace(/\.html$/, ''), resolve(argumentDir, name)]),
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        episodes: resolve(__dirname, 'episodes.html'),
        about: resolve(__dirname, 'about.html'),
        episodeDetail: resolve(__dirname, 'episodes/urias-orellana.html'),
        argumentsIndex: resolve(argumentDir, 'index.html'),
        ...argumentPages,
      },
    },
  },
});
