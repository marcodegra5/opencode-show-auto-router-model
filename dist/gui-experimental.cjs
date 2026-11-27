"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const s=require("@opencode/plugin/gui"),c=require("solid-js/store"),m=require("@opencode/plugin/rpc"),g={type:"object",properties:{requested:{type:"string"},model:{type:"string"}},additionalProperties:!1},l=m.Rpc.define({id:"auto-router-model",methods:{last:{input:{type:"object",properties:{sessionID:{type:"string"}},required:["sessionID"],additionalProperties:!1},output:g}},events:{routed:{schema:{type:"object",properties:{sessionID:{type:"string"},requested:{type:"string"},model:{type:"string"},kind:{type:"string"}},required:["sessionID","requested","model","kind"],additionalProperties:!1}}}}),y=s.Plugin.define({setup(o){const[d,a]=c.createStore({}),r=(e,t)=>{t.model&&a(e,{requested:t.requested??"",model:t.model})};o.add(s.Style,`
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
    `),o.add(s.ComposerPill,{id:"router",show:({session:e})=>{const t=d[e.id],i=e.server.data.session.cost(e.id),n=typeof i=="number"?` · $${i.toFixed(4)}`:"";return t?{label:`${t.model}${n}`,title:`Auto Router: ${t.model}`}:{label:`router idle${n}`,title:"Routed model and session spend"}}});const u=o.client.rpc(l).events.on("routed",e=>{e.data.kind==="primary"&&r(e.data.sessionID,e.data)}),p=setInterval(()=>{const e=o.sessions.current()?.id;e&&o.client.rpc(l).last({sessionID:e}).then(t=>r(e,t)).catch(()=>{})},2e3);return()=>{u(),clearInterval(p)}}});exports.default=y;
