const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/test02.hqKiES4V.js","../chunks/disclose-version.CcStZYi8.js","../chunks/runtime.B8qfXqKW.js","../chunks/legacy.DJG8O6yz.js","../chunks/html.CZrwVxNo.js","../chunks/test03.DDOR_aeX.js","../chunks/test04_component.B8WAuPEu.js","../chunks/render.73VzE-Sh.js","../chunks/events.BxRJdanb.js"])))=>i.map(i=>d[i]);
import{_ as v,c as P}from"../chunks/preload-helper.Dvd6I-iB.js";import{H as q}from"../chunks/control.CYgJF_JY.js";import{a as _,t as g}from"../chunks/disclose-version.CcStZYi8.js";import{g as w,I as c,j as D,D as d,i as O,ae as T,F as n,G as r,x as I}from"../chunks/runtime.B8qfXqKW.js";import{h as j,s as f}from"../chunks/render.73VzE-Sh.js";import{e as R,i as k}from"../chunks/each.GYzXVRDV.js";import{s as A}from"../chunks/attributes.9bGN69wS.js";import{f as H}from"../chunks/utils.DYyNIFpO.js";const L=(e,t,s)=>{const a=e[t];return a?typeof a=="function"?a():Promise.resolve(a):new Promise((l,p)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(p.bind(null,new Error("Unknown variable dynamic import: "+t+(t.split("/").length!==s?". Note that variables only represent file names one level deep.":""))))})};function M(e,t){throw new q(e,t)}new TextEncoder;async function V({params:e}){try{const t=await L(Object.assign({"../../../../content/test02.md":()=>v(()=>import("../chunks/test02.hqKiES4V.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url),"../../../../content/test03.md":()=>v(()=>import("../chunks/test03.DDOR_aeX.js"),__vite__mapDeps([5,1,2,3]),import.meta.url),"../../../../content/test04_component.md":()=>v(()=>import("../chunks/test04_component.B8WAuPEu.js"),__vite__mapDeps([6,1,2,3,7,8]),import.meta.url)}),`../../../../content/${e.slug}.md`,6);return{content:t.default,meta:t.metadata}}catch{M(404,`Could not find ${e.slug}`)}}const W=Object.freeze(Object.defineProperty({__proto__:null,load:V},Symbol.toStringTag,{value:"Module"}));var S=g('<meta property="og:type" content="article"> <meta property="og:title">',1),z=g('<span class="surface-4 svelte-19x3q4r"> </span>'),C=g('<article class="svelte-19x3q4r"><hgroup><h1 class="svelte-19x3q4r"> </h1> <p class="svelte-19x3q4r"> </p></hgroup> <div class="tags svelte-19x3q4r"></div> <div class="prose"><!></div></article>');function X(e,t){w(t,!0);var s=C();j(i=>{var o=S(),m=d(O(o),2);c(()=>{T.title=t.data.meta.title,A(m,"content",t.data.meta.title)}),_(i,o)});var a=n(s),l=n(a),p=n(l,!0);r(l);var h=d(l,2),y=n(h);c(()=>f(y,`Published at ${H(t.data.meta.updated)??""}`)),r(h),r(a);var u=d(a,2);R(u,21,()=>t.data.meta.categories,k,(i,o)=>{var m=z(),E=n(m);r(m),c(()=>f(E,`#${I(o)??""}`)),_(i,m)}),r(u);var x=d(u,2),b=n(x);P(b,()=>t.data.content,(i,o)=>{o(i,{})}),r(x),r(s),c(()=>f(p,t.data.meta.title)),_(e,s),D()}export{X as component,W as universal};
