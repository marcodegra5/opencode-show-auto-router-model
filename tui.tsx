import { Plugin } from "@opencode/plugin/tui"
import { createSignal } from "solid-js"
import { AutoRouter } from "./rpc.ts"

export default Plugin.define({
  id: "auto-router-model.tui",
  setup(context) {
    const [routed, setRouted] = createSignal<{ sessionID: string; label: string }>()

    const stop = context.client.rpc(AutoRouter).events.on("routed", (event) => {
      // Title and compaction requests route too; the footer tracks the answer the user is reading.
      if (event.data.kind !== "primary") return
      setRouted({
        sessionID: event.data.sessionID,
        label: `${event.data.requested} → ${event.data.model}`,
      })
      void context.data.session.sync(event.data.sessionID).catch(() => {})
    })

    context.ui.slot({
      append: "home.footer.status",
      render: () => {
        const route = context.ui.router.current()
        const sessionID = route?.type === "session" ? route.sessionID : routed()?.sessionID
        // The signal holds the last routed session; never show its model beside another session's cost.
        const label = routed()?.sessionID === sessionID ? routed()?.label : undefined
        const cost = sessionID ? context.data.session.cost(sessionID) : undefined
        const text = [label, typeof cost === "number" ? `$${cost.toFixed(4)}` : ""].filter(Boolean).join(" · ")
        return text ? <text>{text}</text> : null
      },
    })

    return () => stop()
  },
})
