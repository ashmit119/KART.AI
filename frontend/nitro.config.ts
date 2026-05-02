import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  preset: 'vercel',
  publicAssets: [
    {
      dir: './dist/client',
      maxAge: 31536000 // 1 year
    }
  ],
  handlers: [
    {
      route: '/**',
      handler: './dist/server/server.js'
    }
  ]
})
