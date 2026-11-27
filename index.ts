import { Plugin } from "@opencode/plugin"
import { read } from "./read.ts"
import { AutoRouter } from "./rpc.ts"

/**
 * Reports which model actually served an OpenRouter request.
 *
 * OpenRouter routers such as `openrouter/auto` answer with a concrete model in the response body.
 * OpenCode only stores the requested model, so this plugin reads the first SSE chunk from a tee'd
 * response body, keeps the result per session, and emits it over RPC for the TUI and GUI parts.
 */

const MAX_SESSIONS = 200

const last = new Map<string, { requested: string; model: string }>()

const remember = (sessionID: string, value: { requested: string; model: string }) => {
  // Map keeps insertion order: re-insert to mark as recent, then drop the oldest past the cap.
  last.delete(sessionID)
  last.set(sessionID, value)
  if (last.size > MAX_SESSIONS) last.delete(last.keys().next().value!)
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
        // Title and compaction requests route too; only the answer the user reads counts.
        if (event.kind !== "primary") return
        const requested = event.model.id
        // Fire-and-forget: awaiting the body here would stall the stream the session is reading.
        void (async () => {
          for (const model of await read(event.response.clone())) {
            if (model === requested) continue
            remember(event.sessionID, { requested, model })
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
