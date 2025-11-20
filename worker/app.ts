import handler from "~/entry.rsc"
import { env } from 'cloudflare:workers'

export default {
  async fetch(req) {
    console.log(env.MESSAGE)
    return handler(req)
  }
} as ExportedHandler<Env>
