import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Keep the runtime tile URL and the service worker's tile-cache rule from
// drifting apart: both come from VITE_TILE_URL. Default mirrors src/app/map.ts.
const TILE_URL = process.env.VITE_TILE_URL
  ?? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const TILE_ORIGIN = new URL(TILE_URL).origin
const tilePattern = new RegExp(`^${TILE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`, 'i')

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Radari Crna Gora',
        short_name: 'Radari',
        description: 'Enforcement locations in Montenegro, with warnings while you drive.',
        theme_color: '#0F1417',
        background_color: '#0F1417',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        runtimeCaching: [
          {
            urlPattern: tilePattern,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
