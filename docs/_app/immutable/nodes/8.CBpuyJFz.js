import{f as J,a as K}from"../chunks/B8MFgm8Y.js";import"../chunks/CcG9GTjx.js";import{o as R,a as mn}from"../chunks/D6yqbeeG.js";import{ai as D,k as p,D as vn,p as Z,aj as fn,ak as gn,g as nn,B as Y,j as pn,i as wn}from"../chunks/DSQyKW5-.js";import{i as rn}from"../chunks/ByKQMsGC.js";import{b as hn}from"../chunks/CDnZ0Xih.js";import"../chunks/BYy7J1bX.js";import{aq as en,C as w,V as i,B as yn,S as xn,P as Pn,W as bn,M as Q,p as Cn,m as Mn,A as Sn,Y as S,ay as zn,K as Ln,ah as X,I as Gn,o as kn,a0 as _n,aI as Wn,aJ as An,c as Dn,a as Tn,L as Fn}from"../chunks/BXevVo3a.js";import{t as Un,O as Vn,X as En,V as Nn,f as A,a as $n,b as Bn}from"../chunks/2OjdOJF2.js";import{m as Hn}from"../chunks/7TFXkTfW.js";import{G as In}from"../chunks/DgwTcVjm.js";function on(y){var v=vn(0);return function(){return arguments.length===1?(D(v,p(v)+1),arguments[0]):(p(v),y())}}const jn=`varying vec2 vUv;\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
\r
void main() {\r
    // -----------------------------\r
    // pass these to fragment\r
    // -----------------------------\r
    vUv = uv;\r
    vNormal = normalize(mat3(modelMatrix) * normal);\r
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz; // world position\r
\r
    // -----------------------------\r
    // apply matrices\r
    // -----------------------------\r
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r
}\r
\r
`,qn=`// precision highp float\r
uniform vec3 uColor;\r
uniform vec3 uPointLightPos;\r
uniform vec3 uPointLightColor;\r
uniform vec3 uAmbient;\r
uniform sampler2D uMap;\r
\r
varying vec2 vUv;\r
varying vec3 vNormal;\r
varying vec3 vWorldPos;\r
\r
\r
void main() {\r
    // Lighting\r
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);\r
    float diff = max(dot(vNormal, lightDir), 0.0);\r
    vec3 litColor = (diff * uPointLightColor + uAmbient);\r
\r
    // Texture\r
    vec4 tex = texture2D(uMap, vUv);\r
\r
    // Mix lighting and texture\r
    vec3 finalColor = litColor * tex.xyz;\r
\r
    gl_FragColor = vec4(finalColor, 1.0);\r
\r
\r
}\r
\r
\r
`,On=new en({vertexShader:jn,fragmentShader:qn,transparent:!1,side:2,uniforms:{uMap:{value:null},uColor:{value:new w(12238779)},uPointLightPos:{value:new i(0,10,0)},uPointLightColor:{value:new w(1,1,1)},uAmbient:{value:new w(.1,.1,.1)}}}),Yn=`precision highp float;\r
\r
attribute vec3 instancePos;\r
\r
uniform sampler2D uGroundTex;\r
uniform float uTime;\r
uniform float uGroundHalfSize;\r
\r
varying vec2 vUv;\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
varying vec3 vGroundColor;\r
\r
void main() {\r
\r
    // -----------------------------\r
    // billboarding\r
    // -----------------------------\r
    // ----- based on camera but ignore pitch (y-axis rotation)\r
    // camera forward direction in world space\r
    vec3 camForward = normalize(vec3(\r
        -viewMatrix[0][2],\r
        -viewMatrix[1][2],\r
        -viewMatrix[2][2]\r
    ));\r
\r
    // remove pitch (ignore Y)\r
    // camForward.y = 0.0;\r
    camForward = normalize(camForward);\r
\r
    // build billboard basis\r
    // vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), camForward));\r
    // vec3 up = vec3(0.0, 1.0, 0.0);\r
\r
\r
    // ----- based on camera\r
    vec3 worldUp = vec3(0.0, 1.0, 0.0);\r
    vec3 right = normalize(cross(worldUp, camForward));\r
    vec3 up = normalize(cross(camForward, right));\r
\r
    // construct vertex\r
    vec3 worldPos =\r
        instancePos +\r
        right * position.x +\r
        up * position.y;\r
\r
    // -----------------------------\r
    // pass to fragment directly 1\r
    // -----------------------------\r
    vUv = uv;\r
\r
    // -----------------------------\r
    // grass sway animation\r
    // -----------------------------\r
    float heightMask = vUv.y;          // 0 bottom, 1 top\r
    float windStrength = .02;\r
\r
    float wind =\r
        sin(uTime * 2.0 + instancePos.x * 0.5 + instancePos.z * 0.5)\r
        * windStrength;\r
\r
    worldPos += right * wind * heightMask;\r
\r
    // -----------------------------\r
    // sample ground texture once per blade\r
    // -----------------------------\r
    float groundSize = uGroundHalfSize * 2.0;\r
\r
    // uv\r
    // (0,1) ----------- (1,1)\r
    // |                 |\r
    // |                 |\r
    // |                 |\r
    // (0,0) ----------- (1,0)\r
    vec2 groundUV = (instancePos.xz + uGroundHalfSize) / groundSize;\r
    groundUV.y = 1.0 - groundUV.y;\r
\r
    vGroundColor = texture2D(uGroundTex, groundUV).rgb;\r
\r
\r
    // -----------------------------\r
    // pass to fragment directly 2\r
    // -----------------------------\r
    // vNormal = normalize(mat3(modelMatrix) * normal);\r
    vNormal = vec3(0.0, 1.0, 0.0);\r
    // vNormal = normalize(cross(right, up));\r
\r
    vWorldPos = worldPos;\r
\r
\r
    // -----------------------------\r
    // calculate position\r
    // -----------------------------\r
    // vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz; // world position\r
\r
\r
    // -----------------------------\r
    // apply matrices\r
    // -----------------------------\r
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);\r
}`,Qn=`precision highp float;\r
\r
uniform vec3 uPointLightPos;\r
uniform vec3 uPointLightColor;\r
uniform vec3 uAmbient;\r
uniform vec3 uGrassTint;\r
\r
uniform sampler2D uMap;\r
varying vec3 vGroundColor;\r
\r
varying vec2 vUv;\r
varying vec3 vNormal;\r
varying vec3 vWorldPos;\r
\r
void main() {\r
\r
    vec4 tex = texture2D(uMap, vUv);\r
    // discard fully transparent pixels\r
    if(tex.a < 0.5) discard;\r
\r
    // terrain color\r
    vec3 baseColor = vGroundColor;\r
\r
    // lighting\r
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);\r
    float diff = max(dot(normalize(vNormal), lightDir), 0.0);\r
    vec3 lighting = diff * uPointLightColor + uAmbient;\r
\r
    vec3 illumination = baseColor * lighting;\r
\r
\r
    // base color test\r
    // gl_FragColor = vec4(baseColor, 1.0);\r
\r
    // lighting test\r
    // gl_FragColor = vec4(lighting, tex.a);\r
\r
        // lighting test\r
    gl_FragColor = vec4(illumination, tex.a);\r
\r
}`,Xn=new en({vertexShader:Yn,fragmentShader:Qn,transparent:!1,side:1,uniforms:{uMap:{value:null},uGroundTex:{value:null},uGroundHalfSize:{value:10},uTime:{value:0},uPointLightPos:{value:new i(0,10,0)},uPointLightColor:{value:new w(1,1,1)},uAmbient:{value:new w(.1,.1,.1)},uGrassTint:{value:new w(.4,1,.4)}}});var P=on(()=>On),d=on(()=>Xn),Jn=J('<canvas style="display: block; margin: 0; padding: 0; overflow: hidden;"></canvas>');function Kn(y,v){Z(v,!1);let f=Y(),o,e,u={},h=null;new In;let b=Y();Un.themeStore.subscribe(r=>{D(b,r)}),Hn.subscribe(r=>{if(h&&o.remove(h),h=r,h){o.add(h);const c=new yn().setFromObject(h),t=c.getCenter(new i),a=c.getSize(new i),m=Math.max(a.x,a.y,a.z),g=e.fov*(Math.PI/180);let l=Math.abs(m/2*Math.tan(g/2));l*=1.5,e.position.set(t.x,t.y,t.z+l),e.lookAt(t.x,t.y,t.z)}});function T(r="#ffffff"){r=="#ffffff"&&(r=z(F("--bg"))),o&&(o.background=new w("#363636"),tn(p(b)))}function F(r){return getComputedStyle(document.documentElement).getPropertyValue(r).trim()}function z(r){return!r||typeof r!="string"?(console.warn(`Invalid color input: "${r}". Defaulting to white.`),"#ffffff"):r.startsWith("#")&&r.length===9?r.substring(0,7):r.startsWith("#")&&r.length===7?r:(console.warn(`Invalid color input: "${r}". Defaulting to white.`),"#ffffff")}function tn(r){const c=z(F("--col"));A.uniforms.uColor.value.set(c)}function C(r,c,t,a){let m;t=="z"?m=[new i(-r,0,0),new i(r,0,0)]:m=[new i(0,0,-r),new i(0,0,r)];const g=new Tn().setFromPoints(m),l=new Fn(g,a);return t=="z"?l.position.z=c:l.position.x=c,l}R(()=>{o=new xn;const r=new Dn;let t=(n=>typeof window<"u"&&typeof document<"u"?getComputedStyle(document.documentElement).getPropertyValue(n).trim():(console.warn("window or document not found, returning default value"),""))("--bg");t=z(t),T(t),e=new Pn(75,window.innerWidth/window.innerHeight,.1,1e3);const a=new bn({canvas:p(f),antialias:!0});a.setSize(window.innerWidth,window.innerHeight);const m=new Vn(e,a.domElement),g=new En(e,a,Nn);g.attachControls(m),e.position.set(0,8,16),e.lookAt(0,2,0);const l=()=>{a.setSize(window.innerWidth,window.innerHeight),e.aspect=window.innerWidth/window.innerHeight,e.updateProjectionMatrix()};window.addEventListener("resize",l);for(let n=-10;n<10;n++)n!=0&&(o.add(C(10,n,"x",A)),o.add(C(10,n,"z",A)));o.add(C(10,0,"z",$n)),o.add(C(10,0,"x",Bn)),new Q({color:8947848,roughness:.5,metalness:0});const V=new Cn,E=V.load("/textures/grassblades02-alpha-128.png");E.anisotropy=a.capabilities.getMaxAnisotropy();const N=V.load("/textures/heightmap01-1k.png");d(d().uniforms.uMap.value=E),d(d().uniforms.uGroundTex.value=N),P(P().uniforms.uMap.value=N);const s=new Mn(16777215,2,30);s.position.set(3,3,0),s.intensity=8,o.add(s);const an=new Sn(16777215,.1);o.add(an);const sn=new S(new zn(.1,8,8),new Ln({color:16777215}));s.add(sn);const ln=new X(20,20,1,1),L=new S(ln,P());L.rotation.x=-Math.PI/2,L.position.y=0,o.add(L);const G=.6,dn=new X(G,G),$=20,B=2800,H=[];for(let n=0;n<B;n++){const x=(Math.random()-.5)*$,cn=(Math.random()-.5)*$;H.push(new i(x,G/6,cn))}const k=new Gn(dn,d(),B),I=[];H.forEach((n,x)=>{I.push(n.x,n.y,n.z)}),k.geometry.setAttribute("instancePos",new kn(new Float32Array(I),3)),k.geometry.getAttribute("instancePos").needsUpdate=!0,o.add(k);const _=new _n;o.add(_);const j=new Q({color:11184810,roughness:.4,metalness:.1}),W=new S(new Wn(1,1,1),j);W.position.set(-2,.5,0),W.rotateY(64),_.add(W);const q=new S(new An(.6,.6,1.5,32),j);q.position.set(0,.75,-2),_.add(q);const M=.1;function un(){if(u.w&&e.position.add(e.getWorldDirection(new i).multiplyScalar(M)),u.s&&e.position.add(e.getWorldDirection(new i).multiplyScalar(-M)),u.a){const n=new i(-1,0,0);n.applyQuaternion(e.quaternion),e.position.add(n.multiplyScalar(M))}if(u.d){const n=new i(1,0,0);n.applyQuaternion(e.quaternion),e.position.add(n.multiplyScalar(M))}}window.addEventListener("keydown",n=>u[n.key.toLowerCase()]=!0),window.addEventListener("keyup",n=>u[n.key.toLowerCase()]=!1);function O(){const n=r.getElapsedTime();requestAnimationFrame(O),P().uniforms.uPointLightPos.value.copy(s.position),P().uniforms.uPointLightColor.value.copy(s.color),d().uniforms.uPointLightPos.value.copy(s.position),d().uniforms.uPointLightColor.value.copy(s.color),d(d().uniforms.uTime.value=r.getElapsedTime());const x=3;s.position.x=Math.cos(n)*x,s.position.z=Math.sin(n)*x,a.render(o,e),m.update(),g.render(),un()}return O(),window.onresize=()=>{g.update()},()=>{window.removeEventListener("resize",l),window.removeEventListener("keydown",n=>u[n.key.toLowerCase()]=!0),window.removeEventListener("keyup",n=>u[n.key.toLowerCase()]=!1)}}),mn(()=>{}),fn(()=>p(b),()=>{typeof window<"u"&&p(b)&&T()}),gn(),rn();var U=Jn();hn(U,r=>D(f,r),()=>p(f)),K(y,U),nn()}var Rn=J('<main style="margin: 0; padding: 0; overflow: hidden;"><!></main>');function ur(y,v){Z(v,!1),R(()=>(document.body.classList.add("no-scroll"),()=>{document.body.classList.remove("no-scroll")})),rn();var f=Rn(),o=pn(f);Kn(o,{}),wn(f),K(y,f),nn()}export{ur as component};
