"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const r=require("@opencode/plugin/gui"),g=require("solid-js/store"),y=require("@opencode/plugin/rpc"),f={type:"object",properties:{requested:{type:"string"},model:{type:"string"}},additionalProperties:!1},l=y.Rpc.define({id:"auto-router-model",methods:{last:{input:{type:"object",properties:{sessionID:{type:"string"}},required:["sessionID"],additionalProperties:!1},output:f}},events:{routed:{schema:{type:"object",properties:{sessionID:{type:"string"},requested:{type:"string"},model:{type:"string"},kind:{type:"string"}},required:["sessionID","requested","model","kind"],additionalProperties:!1}}}}),h=r.Plugin.define({setup(s){const[d,a]=g.createStore({}),i=(e,t)=>{t.model&&a(e,{requested:t.requested??"",model:t.model})};s.add(r.Style,`
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
    `),s.add(r.ComposerPill,{id:"router",show:({session:e})=>{const t=d[e.id],o=e.server.data.session.message.list(e.id).findLast(m=>m.type==="assistant"),n=o?.type==="assistant"&&o.time.completed&&o.model.providerID==="openrouter"&&o.model.id===t?.requested?o.cost:void 0,c=typeof n=="number"?` · last call $${n.toFixed(6)}`:"";return t?{label:`${t.model}${c}`,title:`Auto Router: ${t.model}`}:{label:"router idle",title:"Routed model"}}});const u=s.client.rpc(l).events.on("routed",e=>{e.data.kind==="primary"&&i(e.data.sessionID,e.data)}),p=setInterval(()=>{const e=s.sessions.current()?.id;e&&s.client.rpc(l).last({sessionID:e}).then(t=>i(e,t)).catch(()=>{})},2e3);return()=>{u(),clearInterval(p)}}});exports.default=h;
