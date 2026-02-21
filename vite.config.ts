import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const repoName = 'stories';
const isPagesBuild = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  plugins: [react()],
  base: isPagesBuild ? `/${repoName}/` : '/',
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
});
