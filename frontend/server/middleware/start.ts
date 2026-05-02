import { defineEventHandler } from 'h3'
// @ts-ignore
import handler from '../../src/entry-server'

export default defineEventHandler(async (event) => {
  // Pass the request to TanStack Start handler
  return handler(event.node.req, event.node.res)
})
