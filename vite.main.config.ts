import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);

  // Create a modified external list that doesn't include these dependencies
  // This will ensure they are bundled with the app
  const modifiedExternal = external.filter(dep =>
    dep !== 'dotenv' &&
    dep !== 'axios' &&
    dep !== 'cheerio' &&
    dep !== 'uuid' &&
    dep !== 'electron-squirrel-startup' &&
    !dep.startsWith('@aws-sdk/')
  );

  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry || '',
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: modifiedExternal,
      },
    },
    plugins: [pluginHotRestart('restart')],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
