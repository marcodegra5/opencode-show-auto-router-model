const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

// Exercise the shipped GUI bundle with the window setup API.
test('GUI setup displays routed model and cleans up its resources', () => {
  const exports = {}
  let listener
  let pill
  let styles
  let stopped = false
  let cleared = false
  const rpc = {
    events: { on: (_event, callback) => { listener = callback; return () => { stopped = true } } },
    last: async () => ({}),
  }
  const modules = {
    '@opencode/plugin/gui': { Plugin: { define: (definition) => definition }, ComposerPill: 'pill', Style: 'style' },
    '@opencode/plugin/rpc': { Rpc: { define: (definition) => definition } },
    'solid-js/store': { createStore: (initial) => [initial, (key, value) => { initial[key] = value }] },
  }
  const sandbox = {
    exports,
    require: (name) => { assert.ok(modules[name], `Unexpected module: ${name}`); return modules[name] },
    setInterval: () => 123,
    clearInterval: (id) => { assert.equal(id, 123); cleared = true },
  }
  vm.runInNewContext(fs.readFileSync(require.resolve('./dist/gui-experimental.cjs'), 'utf8'), sandbox)
  const cleanup = exports.default.setup({
    add: (type, item) => { if (type === 'pill') pill = item; if (type === 'style') styles = item },
    client: { rpc: () => rpc },
    sessions: { current: () => undefined },
  })
  assert.equal(pill.show({ session: { id: 'session', server: { data: { session: { cost: () => 0.01 } } } } }).label, 'router idle · $0.0100')
  listener({ data: { kind: 'primary', sessionID: 'session', requested: 'openrouter/auto', model: 'deepseek/deepseek-v4.1-flash-1017-very-long-model-name-without-spaces' } })
  const routed = pill.show({ session: { id: 'session', server: { data: { session: { cost: () => 0.01 } } } } })
  assert.equal(routed.label, 'deepseek/deepseek-v4.1-flash-1017-very-long-model-name-without-spaces')
  assert.equal(routed.title, 'Auto Router: deepseek/deepseek-v4.1-flash-1017-very-long-model-name-without-spaces')
  assert.match(styles, /session-plugin-pill/)
  assert.match(styles, /Auto Router:/)
  assert.match(styles, /overflow-wrap:\s*anywhere/)
  assert.match(styles, /max-width:\s*none/)
  cleanup()
  assert.equal(stopped, true)
  assert.equal(cleared, true)
})
