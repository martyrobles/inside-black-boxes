import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        episodes: resolve(__dirname, 'episodes.html'),
        about: resolve(__dirname, 'about.html'),
        episodeDetail: resolve(__dirname, 'episodes/urias-orellana.html'),
      },
    },
  },
});
