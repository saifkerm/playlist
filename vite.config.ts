import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const isPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoNameFromCi = process.env.GITHUB_REPOSITORY?.split('/')[1];
const repoName = process.env.GITHUB_PAGES_REPO || repoNameFromCi || 'playlist';
const base = isPagesBuild ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
});
