import{Y as k,Z as R,_ as O,y as C,N as H,G as L,$ as b,x as M,a0 as P,T as $,X as T,B as g,v as A,w as q,e as p,C as B,W,a1 as j,L as z,z as G,a2 as X,q as Z,c as F,p as J,h as E,a as K,l as Q}from"./runtime.DAeAgcKc.js";import{b as U}from"./disclose-version.C2k6qm2s.js";const x=["touchstart","touchmove"];function rr(r){return x.includes(r)}const er=new Set,D=new Set;function m(r){var S;var e=this,n=e.ownerDocument,c=r.type,o=((S=r.composedPath)==null?void 0:S.call(r))||[],t=o[0]||r.target,u=0,_=r.__root;if(_){var d=o.indexOf(_);if(d!==-1&&(e===document||e===window)){r.__root=e;return}var h=o.indexOf(e);if(h===-1)return;d<=h&&(u=d)}if(t=o[u]||r.target,t!==e){k(r,"currentTarget",{configurable:!0,get(){return t||n}});var w=H,i=L;R(null),O(null);try{for(var a,s=[];t!==null;){var f=t.assignedSlot||t.parentNode||t.host||null;try{var l=t["__"+c];if(l!==void 0&&!t.disabled)if(C(l)){var[V,...Y]=l;V.apply(t,[r,...Y])}else l.call(t,r)}catch(y){a?s.push(y):a=y}if(r.cancelBubble||f===e||f===null)break;t=f}if(a){for(let y of s)queueMicrotask(()=>{throw y});throw a}}finally{r.__root=e,delete r.currentTarget,R(w),O(i)}}}function sr(r,e){var n=e==null?"":typeof e=="object"?e+"":e;n!==(r.__t??(r.__t=r.nodeValue))&&(r.__t=n,r.nodeValue=n==null?"":n+"")}function tr(r,e){return I(r,e)}function ir(r,e){b(),e.intro=e.intro??!1;const n=e.target,c=E,o=p;try{for(var t=M(n);t&&(t.nodeType!==8||t.data!==P);)t=$(t);if(!t)throw T;g(!0),A(t),q();const u=I(r,{...e,anchor:t});if(p===null||p.nodeType!==8||p.data!==B)throw W(),T;return g(!1),u}catch(u){if(u===T)return e.recover===!1&&j(),b(),z(n),g(!1),tr(r,e);throw u}finally{g(c),A(o)}}const v=new Map;function I(r,{target:e,anchor:n,props:c={},events:o,context:t,intro:u=!0}){b();var _=new Set,d=i=>{for(var a=0;a<i.length;a++){var s=i[a];if(!_.has(s)){_.add(s);var f=rr(s);e.addEventListener(s,m,{passive:f});var l=v.get(s);l===void 0?(document.addEventListener(s,m,{passive:f}),v.set(s,1)):v.set(s,l+1)}}};d(G(er)),D.add(d);var h=void 0,w=X(()=>{var i=n??e.appendChild(Z());return F(()=>{if(t){J({});var a=Q;a.c=t}o&&(c.$$events=o),E&&U(i,null),h=r(i,c)||{},E&&(L.nodes_end=p),t&&K()}),()=>{var f;for(var a of _){e.removeEventListener(a,m);var s=v.get(a);--s===0?(document.removeEventListener(a,m),v.delete(a)):v.set(a,s)}D.delete(d),i!==n&&((f=i.parentNode)==null||f.removeChild(i))}});return N.set(h,w),h}let N=new WeakMap;function or(r,e){const n=N.get(r);return n?(N.delete(r),n(e)):Promise.resolve()}export{ir as h,tr as m,sr as s,or as u};
