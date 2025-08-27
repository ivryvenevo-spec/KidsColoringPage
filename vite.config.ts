import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fix: Import `process` to provide correct types for `process.cwd()` which is needed by `loadEnv`.
// The global `process` object may not have the correct types in a Vite config file.
import process from 'process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // The base path is now set dynamically by the GitHub Actions workflow.
    // It falls back to '/' for local development.
    base: env.VITE_BASE_URL || '/',
    define: {
      // The GitHub Action workflow sets the VITE_API_KEY. This makes it available
      // as process.env.API_KEY in the client-side code, adhering to SDK guidelines.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})
