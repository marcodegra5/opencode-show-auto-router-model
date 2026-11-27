import { test } from "node:test"
import assert from "node:assert/strict"
import { read } from "./read.ts"

const stream = (...chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk))
        controller.close()
      },
    }),
  )

test("finds the model when the SSE chunk is split across reads", async () => {
  assert.deepEqual(await read(stream('data: {"id":"gen-1","mod', 'el":"deepseek/deepseek-v4.1-flash"}\n\n')), [
    "deepseek/deepseek-v4.1-flash",
  ])
})

test("ignores a model name quoted inside generated text", async () => {
  assert.deepEqual(await read(stream('data: {"choices":[{"delta":{"content":"say \\"model\\":\\"fake\\""}}]}\n\n')), [])
})

test("gives up after 8 KB without a model", async () => {
  assert.deepEqual(await read(stream("x".repeat(9000), '"model":"late/model"')), [])
})
