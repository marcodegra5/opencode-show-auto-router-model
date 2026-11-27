"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const s=require("@opencode/plugin/gui"),c=require("solid-js/store"),m=require("@opencode/plugin/rpc"),g={type:"object",properties:{requested:{type:"string"},model:{type:"string"}},additionalProperties:!1},n=m.Rpc.define({id:"auto-router-model",methods:{last:{input:{type:"object",properties:{sessionID:{type:"string"}},required:["sessionID"],additionalProperties:!1},output:g}},events:{routed:{schema:{type:"object",properties:{sessionID:{type:"string"},requested:{type:"string"},model:{type:"string"},kind:{type:"string"}},required:["sessionID","requested","model","kind"],additionalProperties:!1}}}}),y=s.Plugin.define({setup(o){const[l,d]=c.createStore({}),r=(e,t)=>{t.model&&d(e,{requested:t.requested??"",model:t.model})};o.add(s.Style,`
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
    `),o.add(s.ComposerPill,{id:"router",show:({session:e})=>{const t=l[e.id],i=e.server.data.session.cost(e.id),p=typeof i=="number"?` · $${i.toFixed(4)}`:"";return t?{label:t.model,title:`Auto Router: ${t.model}`}:{label:`router idle${p}`,title:"Routed model and session spend"}}});const a=o.client.rpc(n).events.on("routed",e=>{e.data.kind==="primary"&&r(e.data.sessionID,e.data)}),u=setInterval(()=>{const e=o.sessions.current()?.id;e&&o.client.rpc(n).last({sessionID:e}).then(t=>r(e,t)).catch(()=>{})},2e3);return()=>{a(),clearInterval(u)}}});exports.default=y;
