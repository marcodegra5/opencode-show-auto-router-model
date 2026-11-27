import { ComposerPill, Plugin, Style } from "@opencode/plugin/gui"
import { createStore } from "solid-js/store"
import { AutoRouter } from "./rpc.ts"

export default Plugin.define({
  setup(ctx) {
    const [routed, setRouted] = createStore<Record<string, { requested: string; model: string }>>({})

    const apply = (sessionID: string, data: { requested?: string; model?: string }) => {
      if (!data.model) return
      setRouted(sessionID, { requested: data.requested ?? "", model: data.model })
    }

    ctx.add(Style, `
      [data-slot="session-plugin-pill"][aria-label^="Auto Router:"] {
        height: auto;
        min-height: 32px;
        white-space: normal;
        text-align: start;
      }
      [data-slot="session-plugin-pill"][aria-label^="Auto Router:"] > span {
        max-width: none;
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        overflow-wrap: anywhere;
      }
    `)

    ctx.add(ComposerPill, {
      id: "router",
      show: ({ session }) => {
        const hit = routed[session.id]
        const message = session.server.data.session.message.list(session.id).findLast((item) => item.type === "assistant")
        const cost = message?.type === "assistant" && message.time.completed && message.model.providerID === "openrouter" && message.model.id === hit?.requested
          ? message.cost
          : undefined
        const spend = typeof cost === "number" ? ` · last call $${cost.toFixed(6)}` : ""
        // Temporary: the idle label proves the pill renders while the routed model is unknown.
        return hit
          ? {
              label: `${hit.model}${spend}`,
              title: `Auto Router: ${hit.model}`,
            }
          : { label: "router idle", title: "Routed model" }
      },
    })

    const stop = ctx.client.rpc(AutoRouter).events.on("routed", (event) => {
      // Title and compaction requests route too; the pill tracks the answer the user is reading.
      if (event.data.kind !== "primary") return
      apply(event.data.sessionID, event.data)
    })

    // Events are live only. Poll the server's cache so a missed or unsupported event still fills the pill.
    const timer = setInterval(() => {
      const sessionID = ctx.sessions.current()?.id
      if (!sessionID) return
      void ctx.client
        .rpc(AutoRouter)
        .last({ sessionID })
        .then((data) => apply(sessionID, data))
        .catch(() => {})
    }, 2000)
    return () => {
      stop()
      clearInterval(timer)
    }
  },
})
