const MODEL = /"model"\s*:\s*"([^"]+)"/g
const MAX_BYTES = 8192

/** Reads the start of an OpenRouter SSE body and returns the model names it reports. */
export const read = async (response: Response) => {
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
