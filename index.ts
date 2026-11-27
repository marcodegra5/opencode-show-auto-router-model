import { Plugin } from "@opencode/plugin"
import { AutoRouter } from "./rpc.ts"

/**
 * Reports which model actually served an OpenRouter request.
 *
 * OpenRouter routers such as `openrouter/auto` answer with a concrete model in the response body.
 * OpenCode only stores the requested model, so this plugin reads the first SSE chunk from a tee'd
 * response body, keeps the result per session, and emits it over RPC for the TUI and GUI parts.
 */

const MODEL = /"model"\s*:\s*"([^"]+)"/g
const MAX_BYTES = 8192

const last = new Map<string, { requested: string; model: string }>()

const read = async (response: Response) => {
  const reader = response.body?.getReader()
  if (!reader) return []
  const decoder = new TextDecoder()
  let buf = ""
  try {
    while (buf.length < MAX_BYTES) {
      const { value, done } = await reader.read()
      if (done || !value) break
      buf += decoder.decode(value, { stream: true })
      if (MODEL.test(buf)) break
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  MODEL.lastIndex = 0
  return [...new Set([...buf.matchAll(MODEL)].map((match) => match[1]))]
}

export default Plugin.define({
  id: "auto-router-model",
  async setup(ctx) {
    const registration = await ctx.rpc.register(AutoRouter, {
      last: async (input) => last.get((input as { sessionID: string }).sessionID) ?? {},
    })

    await ctx.session.hook(
      "http.response",
      (event) => {
        const requested = event.model.id
        // Fire-and-forget: awaiting the body here would stall the stream the session is reading.
        void (async () => {
          for (const model of await read(event.response.clone())) {
            if (model === requested) continue
            last.set(event.sessionID, { requested, model })
            await registration.events.emit("routed", {
              sessionID: event.sessionID,
              requested,
              model,
              kind: event.kind,
            })
          }
        })().catch((error) => console.warn("[auto-router-model]", error))
      },
      { providerID: "openrouter" },
    )
  },
})
