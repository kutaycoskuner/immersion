import{f as we,a as xe}from"../chunks/vxQGDvkq.js";import"../chunks/-J4l31pL.js";import{o as ye,a as Ge}from"../chunks/vPgrXwaF.js";import{T as F,k as g,ak as Oe,p as be,P as je,R as $e,g as Ce,j as Pe,e as Ve,S as B,i as De}from"../chunks/VrR6ci3J.js";import{i as ze}from"../chunks/O5N9lCRW.js";import{i as Re}from"../chunks/D9wOOexQ.js";import{b as Be}from"../chunks/BKxHJtmX.js";import{b as me}from"../chunks/L1fMEyJB.js";import{au as q,C as v,V as a,i as He,J as Ie,S as fe,a2 as Ye,Y as M,ah as H,ay as I,x as z,az as ge,aA as pe,aB as Ke,aC as Qe,P as Je,W as Xe,M as he,p as Ze,m as er,A as rr,ax as nr,K as tr,I as or,o as ir,a0 as ar,av as lr,aD as sr,c as ur,B as cr,L as dr,a as vr}from"../chunks/L8pzg24E.js";import{t as mr,O as fr,V as gr,f as Y,a as pr,b as hr,c as wr}from"../chunks/dmX_b-HS.js";import{m as xr}from"../chunks/RhbvBMnf.js";import{G as yr}from"../chunks/VBhr7Dyt.js";function G(L){var y=Oe(0);return function(){return arguments.length===1?(F(y,g(y)+1),arguments[0]):(g(y),L())}}const br=`varying vec2 vUv;\r
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
`,Cr=`// precision highp float\r
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
vec3 quantizeColor(vec3 color, float levels) {\r
    return floor(color * levels) / levels;\r
}\r
\r
void main() {\r
\r
    // variables\r
    // ----------------------------------------------------------\r
    float quantizationLevels = 5.0;\r
\r
    // lighting parameters calculation\r
    // ----------------------------------------------------------\r
    vec3    lightDir = normalize(uPointLightPos - vWorldPos);\r
    float   diffuse = max(dot(vNormal, lightDir), 0.0);\r
    vec3    lighting = (diffuse * uPointLightColor + uAmbient);\r
\r
    // sample base color\r
    // ----------------------------------------------------------\r
    vec4    baseColor = texture2D(uMap, vUv);\r
\r
\r
\r
    // quantize lighting\r
    // ----------------------------------------------------------\r
    vec3 qLighting = quantizeColor(lighting, quantizationLevels);\r
    if(length(qLighting) <= 0.05) qLighting = uAmbient;\r
\r
\r
    // calculate illumination\r
    // ----------------------------------------------------------\r
    vec3 illumination = baseColor.xyz * qLighting;\r
    gl_FragColor = vec4(illumination, 1.0);\r
\r
}\r
\r
\r
`,Pr=new q({vertexShader:br,fragmentShader:Cr,transparent:!1,side:2,uniforms:{uMap:{value:null},uColor:{value:new v(12238779)},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new v(1,1,1)},uAmbient:{value:new v(.1,.1,.1)}}}),Dr=`precision highp float;\r
\r
attribute vec3 instancePos;\r
\r
uniform vec3 uPointLightPos;\r
uniform vec3 uPointLightColor;\r
uniform vec3 uAmbient;\r
\r
uniform sampler2D uGroundTex;\r
uniform float uTime;\r
uniform float uGroundHalfSize;\r
\r
varying vec2 vUv;\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
varying vec3 vLeafIllumination;\r
\r
vec3 quantizeColor(vec3 color, float levels) {\r
    return floor(color * levels) / levels;\r
}\r
\r
\r
void main() {\r
\r
    // -------------------------------------------------------------\r
    // billboarding\r
    // -------------------------------------------------------------\r
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
    // -------------------------------------------------------------\r
    // pass to fragment directly 1\r
    // -------------------------------------------------------------\r
    vUv = uv;\r
\r
    // -------------------------------------------------------------\r
    // grass sway animation\r
    // -------------------------------------------------------------\r
    float heightMask = vUv.y;          // 0 bottom, 1 top\r
    float windStrength = .02;\r
\r
    float wind =\r
        sin(uTime * 2.0 + instancePos.x * 0.5 + instancePos.z * 0.5)\r
        * windStrength;\r
\r
    worldPos += right * wind * heightMask;\r
\r
    // -------------------------------------------------------------\r
    // pass to fragment directly 2\r
    // -------------------------------------------------------------\r
    // vNormal = normalize(mat3(modelMatrix) * normal);\r
    vNormal = vec3(0.0, 1.0, 0.0);\r
    // vNormal = normalize(cross(right, up));\r
\r
    vWorldPos = worldPos;\r
\r
    // -------------------------------------------------------------\r
    // calculate lighting here as we want uniform color on same leaf\r
    // -------------------------------------------------------------\r
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
    // sample base color\r
    vec3 baseColor = texture2D(uGroundTex, groundUV).rgb;\r
\r
    float quantizationLevels = 5.0;\r
    vec3 lightDir = normalize(uPointLightPos - instancePos);\r
    float diffuse = max(dot(vNormal, lightDir), 0.0);\r
    vec3 lighting = diffuse * uPointLightColor + uAmbient;\r
\r
    // // quantize lighting\r
    vec3 qLighting = quantizeColor(lighting, quantizationLevels);\r
    if(length(qLighting) <= 0.05) qLighting = uAmbient;\r
\r
    vLeafIllumination = qLighting * baseColor;\r
\r
\r
    // -------------------------------------------------------------\r
    // apply matrices\r
    // -------------------------------------------------------------\r
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);\r
}`,zr=`precision highp float;\r
\r
uniform vec3 uPointLightPos;\r
uniform vec3 uPointLightColor;\r
uniform vec3 uAmbient;\r
\r
uniform sampler2D uMap;\r
\r
varying vec2 vUv;\r
varying vec3 vNormal;\r
varying vec3 vWorldPos;\r
varying vec3 vLeafIllumination;\r
\r
void main() {\r
\r
    // remove transparent zones\r
    // -------------------------------------------------------------\r
    vec4 tex = texture2D(uMap, vUv);\r
    // discard fully transparent pixels\r
    if(tex.a < 0.5) discard;\r
\r
    // final pixel color \r
    // -------------------------------------------------------------\r
    gl_FragColor = vec4(vLeafIllumination, tex.a);\r
\r
}`,Sr=new q({vertexShader:Dr,fragmentShader:zr,transparent:!1,side:1,uniforms:{uMap:{value:null},uGroundTex:{value:null},uGroundHalfSize:{value:10},uTime:{value:0},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new v(1,1,1)},uAmbient:{value:new v(.1,.1,.1)},uGrassTint:{value:new v(.4,1,.4)}}}),Lr=`// precision highp float;\r
\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
\r
void main() {\r
    vNormal = normalize(normalMatrix * normal);\r
    vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;\r
\r
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos,1.0);\r
}`,Tr=`precision highp float;\r
\r
uniform vec3 uPointLightPos;\r
uniform vec3 uPointLightColor;\r
uniform vec3 uAmbient;\r
uniform vec3 uBaseColor;\r
\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
\r
vec3 quantizeColor(vec3 color, float levels) {\r
    return floor(color * levels) / levels;\r
}\r
\r
void main() {\r
    // variables\r
    // -------------------------------------------------------------\r
    float quantLevels = 5.0;\r
\r
    // lighting parameteres\r
    // -------------------------------------------------------------\r
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);\r
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);\r
\r
    // illumination\r
    // -------------------------------------------------------------\r
    vec3 lighting = diffuse * uPointLightColor + uAmbient;\r
\r
\r
    // color quantization\r
    // -------------------------------------------------------------\r
    vec3 qLighting = quantizeColor(lighting, quantLevels);\r
    // fallback if quantized lighting is too low\r
    if(length(qLighting) <= 0.01) {\r
        qLighting = uAmbient;\r
    }\r
    // qLighting = lighting;\r
\r
    // final color\r
    vec3 illumination = uBaseColor * qLighting;\r
\r
    gl_FragColor = vec4(illumination, 1.0);\r
}`,Mr=new q({vertexShader:Lr,fragmentShader:Tr,transparent:!1,side:2,uniforms:{uMap:{value:null},uTime:{value:0},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new v(1,1,1)},uAmbient:{value:new v(.1,.1,.1)},uBaseColor:{value:new v(.8,.8,.8)}}}),Nr=`// fullscreen-quad.vert\r
varying vec2 vUv;\r
\r
void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
}`,Fr=`precision highp float;\r
\r
uniform sampler2D uTexColor;        // color render target\r
uniform sampler2D uTexScrDepth;\r
uniform sampler2D uTexObjDepth;\r
uniform sampler2D uTexNormal;\r
\r
uniform float uCameraNear;\r
uniform float uCameraFar;\r
\r
uniform vec2 uResolution;           // screen size\r
uniform float uOutlineThickness;    // e.g., 1.0..3.0 pixels\r
uniform float uOutlineStrength;     // intensity of the outline\r
\r
varying vec2 vUv;\r
\r
// --------------------------------------------\r
// depth linearization\r
// --------------------------------------------\r
// Converts non-linear depth to linear [0..1]\r
float linearizeDepth(float depth) {\r
    float z = depth * 2.0 - 1.0;\r
    return (2.0 * uCameraNear * uCameraFar) /\r
           (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));\r
}\r
\r
// --------------------------------------------\r
// read normal\r
// --------------------------------------------\r
vec3 getNormal(vec2 uv){\r
    vec3 n = texture2D(uTexNormal, uv).rgb;\r
    return n * 2.0 - 1.0;\r
}\r
\r
// --------------------------------------------\r
// depth edge detection\r
// --------------------------------------------\r
float detectDepthEdge(vec2 uv, vec2 texel){\r
\r
    float centerDepth = linearizeDepth(texture2D(uTexScrDepth, uv).r);\r
    float diff = 0.0;\r
    float d;\r
\r
    d = linearizeDepth(texture2D(uTexScrDepth, uv + vec2(texel.x,0.0)).r);\r
    diff = max(diff, abs(centerDepth - d));\r
\r
    d = linearizeDepth(texture2D(uTexScrDepth, uv - vec2(texel.x,0.0)).r);\r
    diff = max(diff, abs(centerDepth - d));\r
\r
    d = linearizeDepth(texture2D(uTexScrDepth, uv + vec2(0.0,texel.y)).r);\r
    diff = max(diff, abs(centerDepth - d));\r
\r
    d = linearizeDepth(texture2D(uTexScrDepth, uv - vec2(0.0,texel.y)).r);\r
    diff = max(diff, abs(centerDepth - d));\r
\r
    // Apply tolerance\r
    // todo: uniformize outline tolerance\r
    if(diff < 1.5) {\r
        diff = 0.0;\r
    }\r
\r
    return diff;\r
}\r
\r
// --------------------------------------------\r
// normal edge detection\r
// --------------------------------------------\r
float detectNormalEdge(vec2 uv, vec2 texel){\r
\r
    vec3 center = getNormal(uv);\r
    float diff = 0.0;\r
\r
    vec2 offsets[4];\r
    offsets[0] = vec2(texel.x,0.0);\r
    offsets[1] = vec2(-texel.x,0.0);\r
    offsets[2] = vec2(0.0,texel.y);\r
    offsets[3] = vec2(0.0,-texel.y);\r
\r
    for(int i=0;i<4;i++){\r
\r
        vec2 uvOffset = uv + offsets[i];\r
\r
       float objectDepth = linearizeDepth(texture2D(uTexObjDepth, vUv).r);\r
       float sceneDepth  = linearizeDepth(texture2D(uTexScrDepth, vUv).r); \r
\r
        // discard outlines where object is fully behind scene\r
        if(objectDepth - sceneDepth > 0.001){\r
            continue;\r
        }\r
\r
        vec3 n = getNormal(uvOffset);\r
        diff = max(diff, 1.0 - dot(center,n));\r
    }\r
\r
    return diff;\r
}\r
\r
\r
void main() {\r
    //      assign variables\r
    // -------------------------------------------------------------\r
    vec4 color = texture2D(uTexColor, vUv);\r
\r
    vec2 texel = uOutlineThickness / uResolution;\r
\r
    float depthEdge  = detectDepthEdge(vUv, texel);\r
    float normalEdge = detectNormalEdge(vUv, texel);\r
\r
        // Assign colors for edges\r
    // vec3 depthColor  = vec3(1.0, 0.0, 0.0); // red for depth edges (outer)\r
    // vec3 normalColor = vec3(0.0, 1.0, 0.0); // green for normal edges (inner)\r
\r
    // Combine edges: depth outer, normal inner\r
    // vec3 edgeColor = max(depthEdge * depthColor, normalEdge * normalColor);\r
    vec3 outlineColor = vec3(1.0); \r
\r
    depthEdge  = clamp(depthEdge  * uOutlineStrength, 0.0, .8);\r
    normalEdge = clamp(normalEdge * uOutlineStrength, 0.0, 1.0);\r
\r
    float edge = max(depthEdge, normalEdge);\r
\r
\r
    //      debug finals\r
    // -------------------------------------------------------------\r
    //  print color\r
    // ------------------------------------------\r
    // gl_FragColor = color;\r
\r
\r
    //  print obj depth\r
    // ------------------------------------------\r
    // float centerObjDepth = linearizeDepth(texture2D(uTexObjDepth, vUv).r);\r
    // float normalizedDepth = (centerObjDepth - uCameraNear) / (uCameraFar - uCameraNear);\r
    // normalizedDepth = 1.0 - normalizedDepth;  // invert: closest → white, farthest → black\r
    // gl_FragColor = vec4(vec3(normalizedDepth), 1.0);\r
    \r
    \r
    //  print screen depth\r
    // ------------------------------------------\r
    // float centerDepth = linearizeDepth(texture2D(uTexScrDepth, vUv).r);\r
    // float normalizedDepth = (centerDepth - uCameraNear) / (uCameraFar - uCameraNear);\r
    // normalizedDepth = 1.0 - normalizedDepth;  // invert: closest → white, farthest → black\r
    // gl_FragColor = vec4(vec3(normalizedDepth), 1.0);\r
\r
\r
    // print obj normals\r
    // ------------------------------------------\r
    // // read stored normal (0..1)\r
    // vec3 normal = texture2D(uTexNormal, vUv).rgb;\r
    // // decode to [-1..1]\r
    // normal = normal * 2.0 - 1.0;\r
    // // visualize: map back to [0..1]\r
    // normal = normal * 0.5 + 0.5;\r
    // gl_FragColor = vec4(normal, 1.0);\r
\r
    // final color\r
    // ------------------------------------------\r
    // Blend outline with original color\r
    // vec3 finalColor = mix(vec3(0.1), edgeColor, edge);\r
    vec3 finalColor = mix(color.rgb, outlineColor, edge);\r
    gl_FragColor = vec4(finalColor, 1.0);\r
}`,qr=new q({vertexShader:Nr,fragmentShader:Fr,uniforms:{uTexColor:{value:null},uTexScrDepth:{value:null},uTexObjDepth:{value:null},uTexNormal:{value:null},uCameraFar:{value:null},uCameraNear:{value:null},uResolution:{value:new He(800,600)},uOutlineThickness:{value:1},uOutlineStrength:{value:1}}}),_r=`varying vec3 vNormal;\r
void main() {\r
    // view-space normal\r
    vNormal = normalize(normalMatrix * normal); \r
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r
}`,Ar=`        varying vec3 vNormal;\r
        void main() {\r
            // map from [-1,1] to [0,1] for storage\r
            gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);\r
        }`,Ur=new q({vertexShader:_r,fragmentShader:Ar,side:Ie});var N=G(()=>Pr),f=G(()=>Sr),S=G(()=>Mr),t=G(()=>qr),kr=we('<div style="position: relative;"><canvas style="display: block; margin: 0; padding: 0; overflow: hidden;"></canvas> <!></div>');function Er(L,y){be(y,!1);let b=B(),C=B(),o,n,i,P={},p=null;console.log("Running in production?",!0),new yr;let _=B();const Se=mr.themeStore.subscribe(e=>{F(_,e)});function Le(e){if(p&&o.remove(p),p=e,p){o.add(p);const h=new vr().setFromObject(p),l=h.getCenter(new a),w=h.getSize(new a),u=Math.max(w.x,w.y,w.z),c=n.fov*(Math.PI/180);let m=Math.abs(u/2*Math.tan(c/2));m*=1.5,n.position.set(l.x,l.y,l.z+m),n.lookAt(l.x,l.y,l.z)}}function K(e="#ffffff"){e=="#ffffff"&&(e=O(Q("--bg"))),o&&(o.background=new v("#363636"),Te(g(_)))}function Q(e){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()}function O(e){return!e||typeof e!="string"?(console.warn(`Invalid color input: "${e}". Defaulting to white.`),"#ffffff"):e.startsWith("#")&&e.length===9?e.substring(0,7):e.startsWith("#")&&e.length===7?e:(console.warn(`Invalid color input: "${e}". Defaulting to white.`),"#ffffff")}function Te(e){const h=O(Q("--col"));Y.uniforms.uColor.value.set(h)}function A(e,h,l,w){let u;l=="z"?u=[new a(-e,0,0),new a(e,0,0)]:u=[new a(0,0,-e),new a(0,0,e)];const c=new cr().setFromPoints(u),m=new dr(c,w);return l=="z"?m.position.z=h:m.position.x=h,m}ye(()=>{o=new fe;const e=new ur;let l=(r=>typeof window<"u"&&typeof document<"u"?getComputedStyle(document.documentElement).getPropertyValue(r).trim():(console.warn("window or document not found, returning default value"),""))("--bg");l=O(l),K(l);const w=2,u=Math.floor(window.innerWidth/w),c=Math.floor(window.innerHeight/w),m=new fe,Fe=new Ye(-1,1,1,-1,0,1),X=new M(new H(2,2),t());m.add(X);const d=new I(u,c);d.texture.minFilter=z,d.texture.magFilter=z,d.depthTexture=new ge(u,c),d.depthTexture.type=pe,d.depthBuffer=!0;const x=new I(u,c);x.texture.minFilter=z,x.texture.magFilter=z,x.depthTexture=new ge(u,c),x.depthTexture.type=pe,x.depthBuffer=!0;const D=new I(u,c);D.texture.minFilter=z,D.texture.magFilter=z,D.texture.format=Ke,D.texture.type=Qe,n=new Je(75,window.innerWidth/window.innerHeight,.1,100),t(t().uniforms.uTexColor.value=d.texture),t(t().uniforms.uTexScrDepth.value=d.depthTexture),t(t().uniforms.uTexObjDepth.value=x.depthTexture),t(t().uniforms.uCameraNear.value=n.near),t(t().uniforms.uCameraFar.value=n.far),t().uniforms.uResolution.value.set(window.innerWidth,window.innerHeight),t(t().uniforms.uOutlineThickness.value=.6),t(t().uniforms.uOutlineStrength.value=.5),i=new Xe({canvas:g(b),antialias:!0}),i.setSize(window.innerWidth,window.innerHeight);const Z=new fr(n,i.domElement);n.position.set(0,8,16),n.lookAt(0,2,0);const ee=()=>{i.setSize(window.innerWidth,window.innerHeight),n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix()};window.addEventListener("resize",ee);for(let r=-10;r<10;r++)r!=0&&(o.add(A(10,r,"x",Y)),o.add(A(10,r,"z",Y)));o.add(A(10,0,"z",pr)),o.add(A(10,0,"x",hr)),new he({color:8947848,roughness:.5,metalness:0});const re=new Ze,ne=re.load(`${me}/textures/grassblades02-alpha-128.png`),te=re.load(`${me}/textures/heightmap03-1k.png`);ne.anisotropy=i.capabilities.getMaxAnisotropy(),f(f().uniforms.uMap.value=ne),f(f().uniforms.uGroundTex.value=te),N(N().uniforms.uMap.value=te);const s=new er(16777215,2,30);s.position.set(3,3,0),s.intensity=12,o.add(s);const qe=new rr(16777215,.1);o.add(qe);const _e=new M(new nr(.1,8,8),new tr({color:16777215}));s.add(_e);const Ae=new H(20,20,1,1),U=new M(Ae,N());U.rotation.x=-Math.PI/2,U.position.y=0,U.layers.set(0),o.add(U);const $=.6,Ue=new H($,$),oe=20,ie=2800,ae=[];for(let r=0;r<ie;r++){const T=(Math.random()-.5)*oe,We=(Math.random()-.5)*oe;ae.push(new a(T,$/6,We))}const k=new or(Ue,f(),ie),le=[];ae.forEach((r,T)=>{le.push(r.x,r.y,r.z)}),k.geometry.setAttribute("instancePos",new ir(new Float32Array(le),3)),k.geometry.getAttribute("instancePos").needsUpdate=!0,k.layers.set(0),o.add(k);const E=new ar;o.add(E),new he({color:11184810,roughness:.4,metalness:.1});const V=new M(new lr(1,1,1),S());V.position.set(-2,.5,0),V.rotateY(64),E.add(V);const se=new M(new sr(.6,.6,1.5,32),S());se.position.set(0,.75,-2),E.add(se),E.traverse(r=>{r.layers.set(1)});const W=.1;function ke(){if(P.w&&n.position.add(n.getWorldDirection(new a).multiplyScalar(W)),P.s&&n.position.add(n.getWorldDirection(new a).multiplyScalar(-W)),P.a){const r=new a(-1,0,0);r.applyQuaternion(n.quaternion),n.position.add(r.multiplyScalar(W))}if(P.d){const r=new a(1,0,0);r.applyQuaternion(n.quaternion),n.position.add(r.multiplyScalar(W))}}const ue=r=>P[r.key.toLowerCase()]=!0,ce=r=>P[r.key.toLowerCase()]=!1;window.addEventListener("keydown",ue),window.addEventListener("keyup",ce);const R=new gr(n,Z);F(C,R);let de=0;function ve(){const r=e.getElapsedTime();de=requestAnimationFrame(ve),N().uniforms.uPointLightPos.value.copy(s.position),N().uniforms.uPointLightColor.value.copy(s.color),f().uniforms.uPointLightPos.value.copy(s.position),f().uniforms.uPointLightColor.value.copy(s.color),f(f().uniforms.uTime.value=e.getElapsedTime()),S().uniforms.uPointLightPos.value.copy(s.position),S().uniforms.uPointLightColor.value.copy(s.color),S(S().uniforms.uTime.value=e.getElapsedTime());const T=3;s.position.x=Math.cos(r)*T,s.position.z=Math.sin(r)*T,s.position.y=3+Math.sin(r*1),o.overrideMaterial=Ur,n.layers.disableAll(),n.layers.enable(1),i.setRenderTarget(D),i.setViewport(0,0,u,c),i.clear(),i.render(o,n),i.setRenderTarget(x),i.clear(),i.render(o,n),o.overrideMaterial=null,n.layers.enableAll(),i.setRenderTarget(d),i.clear(),i.render(o,n),t(t().uniforms.uTexNormal.value=D.texture),t(t().uniforms.uTexObjDepth.value=x.depthTexture),t(t().uniforms.uTexColor.value=d.texture),t(t().uniforms.uTexScrDepth.value=d.depthTexture),X.material=t(),i.setRenderTarget(null),i.setViewport(0,0,window.innerWidth,window.innerHeight),i.render(m,Fe),R.update(),Z.update(),ke()}ve();const Ee=xr.subscribe(Le);return()=>{cancelAnimationFrame(de),R.dispose(),F(C,void 0),window.removeEventListener("resize",ee),window.removeEventListener("keydown",ue),window.removeEventListener("keyup",ce),Ee(),Se(),p&&o.remove(p),i.dispose()}}),Ge(()=>{}),je(()=>g(_),()=>{typeof window<"u"&&g(_)&&K()}),$e(),ze();var j=kr(),J=Pe(j);Be(J,e=>F(b,e),()=>g(b));var Me=Ve(J,2);{var Ne=e=>{wr(e,{get controller(){return g(C)}})};Re(Me,e=>{g(C)&&e(Ne)})}De(j),xe(L,j),Ce()}var Wr=we('<main style="margin: 0; padding: 0; overflow: hidden;"><!></main>');function Xr(L,y){be(y,!1),ye(()=>(document.body.classList.add("no-scroll"),()=>{document.body.classList.remove("no-scroll")})),ze();var b=Wr(),C=Pe(b);Er(C,{}),De(b),xe(L,b),Ce()}export{Xr as component};
