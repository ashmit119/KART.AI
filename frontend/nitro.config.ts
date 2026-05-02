import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  preset: 'vercel',
  handlers: [
    {
      route: '/**',
      handler: './dist/server/server.js'
    }
  ]
})
