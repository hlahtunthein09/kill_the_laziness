import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    pool: 'vmThreads',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'tw-animate-css': path.resolve(__dirname, './__mocks__/empty-module.ts'),
      'shadcn/tailwind.css': path.resolve(__dirname, './__mocks__/empty-module.ts'),
      'next-themes': path.resolve(__dirname, './__mocks__/next-themes.ts'),
      'next/navigation': path.resolve(__dirname, './__mocks__/next-navigation.ts'),
    },
  },
})
