import{S as R,a5 as K,a6 as M,W as _,a7 as j,a8 as o,a9 as T,aa as u,m as w,M as k,ab as B,$ as C,D as F,b as H,h as x,C as Y,E as q,H as G,G as U,B as W,I as A,K as D,c as O,L as S,e as Z}from"./runtime.7hgQhlvh.js";function b(s,g=null,E){if(typeof s!="object"||s===null||R in s)return s;const v=C(s);if(v!==K&&v!==M)return s;var r=new Map,l=F(s),c=_(0);l&&r.set("length",_(s.length));var y;return new Proxy(s,{defineProperty(f,e,t){(!("value"in t)||t.configurable===!1||t.enumerable===!1||t.writable===!1)&&j();var n=r.get(e);return n===void 0?(n=_(t.value),r.set(e,n)):o(n,b(t.value,y)),!0},deleteProperty(f,e){var t=r.get(e);if(t===void 0)e in f&&r.set(e,_(u));else{if(l&&typeof e=="string"){var n=r.get("length"),a=Number(e);Number.isInteger(a)&&a<n.v&&o(n,a)}o(t,u),L(c)}return!0},get(f,e,t){var d;if(e===R)return s;var n=r.get(e),a=e in f;if(n===void 0&&(!a||(d=T(f,e))!=null&&d.writable)&&(n=_(b(a?f[e]:u,y)),r.set(e,n)),n!==void 0){var i=w(n);return i===u?void 0:i}return Reflect.get(f,e,t)},getOwnPropertyDescriptor(f,e){var t=Reflect.getOwnPropertyDescriptor(f,e);if(t&&"value"in t){var n=r.get(e);n&&(t.value=w(n))}else if(t===void 0){var a=r.get(e),i=a==null?void 0:a.v;if(a!==void 0&&i!==u)return{enumerable:!0,configurable:!0,value:i,writable:!0}}return t},has(f,e){var i;if(e===R)return!0;var t=r.get(e),n=t!==void 0&&t.v!==u||Reflect.has(f,e);if(t!==void 0||k!==null&&(!n||(i=T(f,e))!=null&&i.writable)){t===void 0&&(t=_(n?b(f[e],y):u),r.set(e,t));var a=w(t);if(a===u)return!1}return n},set(f,e,t,n){var P;var a=r.get(e),i=e in f;if(l&&e==="length")for(var d=t;d<a.v;d+=1){var h=r.get(d+"");h!==void 0?o(h,u):d in f&&(h=_(u),r.set(d+"",h))}a===void 0?(!i||(P=T(f,e))!=null&&P.writable)&&(a=_(void 0),o(a,b(t,y)),r.set(e,a)):(i=a.v!==u,o(a,b(t,y)));var m=Reflect.getOwnPropertyDescriptor(f,e);if(m!=null&&m.set&&m.set.call(n,t),!i){if(l&&typeof e=="string"){var I=r.get("length"),N=Number(e);Number.isInteger(N)&&N>=I.v&&o(I,N+1)}L(c)}return!0},ownKeys(f){w(c);var e=Reflect.ownKeys(f).filter(a=>{var i=r.get(a);return i===void 0||i.v!==u});for(var[t,n]of r)n.v!==u&&!(t in f)&&e.push(t);return e},setPrototypeOf(){B()}})}function L(s,g=1){o(s,s.v+g)}function z(s,g,E=!1){x&&Y();var v=s,r=null,l=null,c=u,y=E?q:0,f=!1;const e=(n,a=!0)=>{f=!0,t(a,n)},t=(n,a)=>{if(c===(c=n))return;let i=!1;if(x){const d=v.data===G;!!c===d&&(v=U(),W(v),A(!1),i=!0)}c?(r?D(r):a&&(r=O(()=>a(v))),l&&S(l,()=>{l=null})):(l?D(l):a&&(l=O(()=>a(v))),r&&S(r,()=>{r=null})),i&&A(!0)};H(()=>{f=!1,g(e),f||t(null,null)},y),x&&(v=Z)}export{z as i,b as p};
