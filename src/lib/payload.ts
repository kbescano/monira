import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Cached Payload instance for use in React Server Components via the Local API
 * (no HTTP round-trip). `getPayload` memoizes internally per config, but we
 * wrap it so every server component just does `const payload = await getPayloadClient()`.
 */
export const getPayloadClient = () => getPayload({ config })
