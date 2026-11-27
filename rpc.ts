import { Rpc } from "@opencode/plugin/rpc"

const routed = {
  type: "object",
  properties: {
    requested: { type: "string" },
    model: { type: "string" },
  },
  additionalProperties: false,
} as const

export const AutoRouter = Rpc.define({
  id: "auto-router-model",
  methods: {
    last: {
      input: {
        type: "object",
        properties: { sessionID: { type: "string" } },
        required: ["sessionID"],
        additionalProperties: false,
      },
      output: routed,
    },
  },
  events: {
    routed: {
      schema: {
        type: "object",
        properties: {
          sessionID: { type: "string" },
          requested: { type: "string" },
          model: { type: "string" },
          kind: { type: "string" },
        },
        required: ["sessionID", "requested", "model", "kind"],
        additionalProperties: false,
      },
    },
  },
})
