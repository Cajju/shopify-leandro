import { defineConfig, loadEnv } from 'vite'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import svgr from 'vite-plugin-svgr'

if (process.env.npm_lifecycle_event === 'build' && !process.env.CI && !process.env.SHOPIFY_API_KEY) {
  throw new Error(
    '\n\nThe frontend build will not work without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command, for example:' +
      '\n\nSHOPIFY_API_KEY=<your-api-key> npm run build\n'
  )
}

process.env.VITE_SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false
}

const host = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : 'localhost'

let hmrConfig
if (host === 'localhost') {
  hmrConfig = {
    protocol: 'ws',
    host: 'localhost',
    port: 64999,
    clientPort: 64999
  }
} else {
  hmrConfig = {
    protocol: 'wss',
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443
  }
}

export default defineConfig(({ mode }) => {
  const env = mode === 'production' ? loadEnv(mode, '../../', 'VITE_') : loadEnv('dev', '../../', 'VITE_')

  // Create an object with all env variables for import.meta.env
  const envWithImportMetaPrefix = Object.entries(env).reduce((prev, [key, val]) => {
    return {
      ...prev,
      [`import.meta.env.${key}`]: JSON.stringify(val)
    }
  }, {})

  return {
    root: dirname(fileURLToPath(import.meta.url)),
    plugins: [
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                minify: mode !== 'production',
                fileName: false,
                pure: true,
                transpileTemplateLiterals: true
              }
            ]
          ]
        }
      }),
      svgr(),
      visualizer()
    ],
    define: {
      ...envWithImportMetaPrefix,
      'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY)
    },
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, './assets'),
        '@components': path.resolve(__dirname, './components'),
        '@utils': path.resolve(__dirname, './utils'),
        '@rq-api': path.resolve(__dirname, './rq-api'),
        '@shared': path.resolve(__dirname, '../shared'),
        '@hooks': path.resolve(__dirname, './hooks'),
        '@widget': path.resolve(__dirname, '../widget')
      },
      preserveSymlinks: true
    },
    server: {
      host: 'localhost',
      port: process.env.FRONTEND_PORT,
      hmr: hmrConfig,
      proxy: {
        '^/(\\?.*)?$': proxyOptions,
        '^/api(/|(\\?.*)?$)': proxyOptions
      }
    }
  }
})
