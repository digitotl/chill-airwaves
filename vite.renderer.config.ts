import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      assetsDir: 'assets',
      emptyOutDir: true,
      // Ensure assets are properly processed and included
      assetsInlineLimit: 0,
    },
    plugins: [
      react(),
      pluginExposeRenderer(name)
    ],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig;
});
