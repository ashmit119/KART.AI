import { defineEventHandler, toRequest } from 'h3'
// @ts-ignore
import handler from '../../src/entry-server'

export default defineEventHandler(async (event) => {
  // Pass the request to TanStack Start handler
  const request = toRequest(event)
  return handler(request)
})
