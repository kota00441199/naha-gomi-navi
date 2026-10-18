import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.ts';

// 自動入力を使う開発時だけ読み込む。通常のVite設定には影響しない。
export default mergeConfig(base, defineConfig({
  server: {
    proxy: {
      '/api/automation': { target: 'http://127.0.0.1:3001', changeOrigin: false },
    },
  },
}));
