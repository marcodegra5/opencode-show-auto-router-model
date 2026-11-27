# OpenCode Show Auto Router Model

A local OpenCode plugin that shows the model returned by OpenRouter for a routed request. The Desktop pill displays the latest detected model and the last completed assistant call's cost, when available. The terminal footer shows the routed model and session cost.

## Installation

Requires OpenCode with the experimental GUI plugin API and an OpenRouter connection. Clone this repository, then run:

```sh
npm ci
npm run build
```

Add the absolute path to the cloned directory to the `plugins` array in your global `~/.config/opencode/opencode.json`. Configure or select an OpenRouter model such as `openrouter/openrouter/auto` and send a message. The plugin starts automatically.

## Development

```sh
npm run build
node --test gui.test.cjs
```

The GUI bundle in `dist/` is required by OpenCode Desktop. Rebuild it after editing `gui.tsx`.

## Limitations

- The Desktop GUI API and its styling are experimental; OpenCode updates may require changes.
- The displayed model is the latest detected response, not a history of models used. It is kept in memory and may be unavailable after a server restart.
- The fallback cache may include background requests such as title generation or compaction. Live Desktop and terminal events filter for primary responses.
- Desktop cost is the amount stored by OpenCode for the last completed assistant call, not the total for an entire user turn that may contain multiple calls. OpenCode may calculate the amount when the provider does not report it. The terminal footer shows session cost instead.
