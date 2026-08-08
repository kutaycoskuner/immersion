import{f as ve,a as fe}from"../chunks/B8MFgm8Y.js";import"../chunks/CcG9GTjx.js";import{o as ge,a as Le}from"../chunks/D6yqbeeG.js";import{ai as R,k as b,D as Te,p as pe,aj as Me,ak as Ne,g as he,B as le,j as Fe,i as qe}from"../chunks/DSQyKW5-.js";import{i as we}from"../chunks/ByKQMsGC.js";import{b as _e}from"../chunks/CDnZ0Xih.js";import{b as se}from"../chunks/DyU2Udzj.js";import{aq as N,C as m,V as a,i as Ae,J as ke,B as Ue,S as ue,a2 as Ee,Y as T,ah as $,aI as V,x as D,aJ as ce,aK as de,aL as We,aM as Oe,P as Ge,W as je,M as me,p as $e,m as Ve,A as Be,ay as Re,K as He,I as Ie,o as Ye,a0 as Qe,aN as Xe,aO as Je,c as Ke,a as Ze,L as er}from"../chunks/pwwaY4by.js";import{t as rr,O as nr,X as tr,V as or,f as B,a as ir,b as ar}from"../chunks/ZIh8np2M.js";import{m as lr}from"../chunks/7TFXkTfW.js";import{G as sr}from"../chunks/BXKoPG31.js";function E(S){var x=Te(0);return function(){return arguments.length===1?(R(x,b(x)+1),arguments[0]):(b(x),S())}}const ur=`varying vec2 vUv;\r
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
`,cr=`// precision highp float\r
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
`,dr=new N({vertexShader:ur,fragmentShader:cr,transparent:!1,side:2,uniforms:{uMap:{value:null},uColor:{value:new m(12238779)},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new m(1,1,1)},uAmbient:{value:new m(.1,.1,.1)}}}),mr=`precision highp float;\r
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
}`,vr=`precision highp float;\r
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
}`,fr=new N({vertexShader:mr,fragmentShader:vr,transparent:!1,side:1,uniforms:{uMap:{value:null},uGroundTex:{value:null},uGroundHalfSize:{value:10},uTime:{value:0},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new m(1,1,1)},uAmbient:{value:new m(.1,.1,.1)},uGrassTint:{value:new m(.4,1,.4)}}}),gr=`// precision highp float;\r
\r
varying vec3 vWorldPos;\r
varying vec3 vNormal;\r
\r
void main() {\r
    vNormal = normalize(normalMatrix * normal);\r
    vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;\r
\r
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos,1.0);\r
}`,pr=`precision highp float;\r
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
}`,hr=new N({vertexShader:gr,fragmentShader:pr,transparent:!1,side:2,uniforms:{uMap:{value:null},uTime:{value:0},uPointLightPos:{value:new a(0,10,0)},uPointLightColor:{value:new m(1,1,1)},uAmbient:{value:new m(.1,.1,.1)},uBaseColor:{value:new m(.8,.8,.8)}}}),wr=`// fullscreen-quad.vert\r
varying vec2 vUv;\r
\r
void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
}`,xr=`precision highp float;\r
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
}`,yr=new N({vertexShader:wr,fragmentShader:xr,uniforms:{uTexColor:{value:null},uTexScrDepth:{value:null},uTexObjDepth:{value:null},uTexNormal:{value:null},uCameraFar:{value:null},uCameraNear:{value:null},uResolution:{value:new Ae(800,600)},uOutlineThickness:{value:1},uOutlineStrength:{value:1}}}),br=`varying vec3 vNormal;\r
void main() {\r
    // view-space normal\r
    vNormal = normalize(normalMatrix * normal); \r
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r
}`,Cr=`        varying vec3 vNormal;\r
        void main() {\r
            // map from [-1,1] to [0,1] for storage\r
            gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);\r
        }`,Pr=new N({vertexShader:br,fragmentShader:Cr,side:ke});var M=E(()=>dr),f=E(()=>fr),z=E(()=>hr),t=E(()=>yr),Dr=ve('<canvas style="display: block; margin: 0; padding: 0; overflow: hidden;"></canvas>');function zr(S,x){pe(x,!1);let y=le(),o,n,i,g={},C=null;console.log("Running in production?",!0),new sr;let F=le();rr.themeStore.subscribe(r=>{R(F,r)}),lr.subscribe(r=>{if(C&&o.remove(C),C=r,C){o.add(C);const p=new Ue().setFromObject(C),l=p.getCenter(new a),h=p.getSize(new a),u=Math.max(h.x,h.y,h.z),c=n.fov*(Math.PI/180);let v=Math.abs(u/2*Math.tan(c/2));v*=1.5,n.position.set(l.x,l.y,l.z+v),n.lookAt(l.x,l.y,l.z)}});function H(r="#ffffff"){r=="#ffffff"&&(r=W(I("--bg"))),o&&(o.background=new m("#363636"),xe(b(F)))}function I(r){return getComputedStyle(document.documentElement).getPropertyValue(r).trim()}function W(r){return!r||typeof r!="string"?(console.warn(`Invalid color input: "${r}". Defaulting to white.`),"#ffffff"):r.startsWith("#")&&r.length===9?r.substring(0,7):r.startsWith("#")&&r.length===7?r:(console.warn(`Invalid color input: "${r}". Defaulting to white.`),"#ffffff")}function xe(r){const p=W(I("--col"));B.uniforms.uColor.value.set(p)}function q(r,p,l,h){let u;l=="z"?u=[new a(-r,0,0),new a(r,0,0)]:u=[new a(0,0,-r),new a(0,0,r)];const c=new Ze().setFromPoints(u),v=new er(c,h);return l=="z"?v.position.z=p:v.position.x=p,v}ge(()=>{o=new ue;const r=new Ke;let l=(e=>typeof window<"u"&&typeof document<"u"?getComputedStyle(document.documentElement).getPropertyValue(e).trim():(console.warn("window or document not found, returning default value"),""))("--bg");l=W(l),H(l);const h=2,u=Math.floor(window.innerWidth/h),c=Math.floor(window.innerHeight/h),v=new ue,ye=new Ee(-1,1,1,-1,0,1),Q=new T(new $(2,2),t());v.add(Q);const d=new V(u,c);d.texture.minFilter=D,d.texture.magFilter=D,d.depthTexture=new ce(u,c),d.depthTexture.type=de,d.depthBuffer=!0;const w=new V(u,c);w.texture.minFilter=D,w.texture.magFilter=D,w.depthTexture=new ce(u,c),w.depthTexture.type=de,w.depthBuffer=!0;const P=new V(u,c);P.texture.minFilter=D,P.texture.magFilter=D,P.texture.format=We,P.texture.type=Oe,n=new Ge(75,window.innerWidth/window.innerHeight,.1,100),t(t().uniforms.uTexColor.value=d.texture),t(t().uniforms.uTexScrDepth.value=d.depthTexture),t(t().uniforms.uTexObjDepth.value=w.depthTexture),t(t().uniforms.uCameraNear.value=n.near),t(t().uniforms.uCameraFar.value=n.far),t().uniforms.uResolution.value.set(window.innerWidth,window.innerHeight),t(t().uniforms.uOutlineThickness.value=.6),t(t().uniforms.uOutlineStrength.value=.5),i=new je({canvas:b(y),antialias:!0}),i.setSize(window.innerWidth,window.innerHeight);const X=new nr(n,i.domElement),O=new tr(n,i,or);O.attachControls(X),n.position.set(0,8,16),n.lookAt(0,2,0);const J=()=>{i.setSize(window.innerWidth,window.innerHeight),n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix()};window.addEventListener("resize",J);for(let e=-10;e<10;e++)e!=0&&(o.add(q(10,e,"x",B)),o.add(q(10,e,"z",B)));o.add(q(10,0,"z",ir)),o.add(q(10,0,"x",ar)),new me({color:8947848,roughness:.5,metalness:0});const K=new $e,Z=K.load(`${se}/textures/grassblades02-alpha-128.png`),ee=K.load(`${se}/textures/heightmap03-1k.png`);Z.anisotropy=i.capabilities.getMaxAnisotropy(),f(f().uniforms.uMap.value=Z),f(f().uniforms.uGroundTex.value=ee),M(M().uniforms.uMap.value=ee);const s=new Ve(16777215,2,30);s.position.set(3,3,0),s.intensity=12,o.add(s);const be=new Be(16777215,.1);o.add(be);const Ce=new T(new Re(.1,8,8),new He({color:16777215}));s.add(Ce);const Pe=new $(20,20,1,1),_=new T(Pe,M());_.rotation.x=-Math.PI/2,_.position.y=0,_.layers.set(0),o.add(_);const G=.6,De=new $(G,G),re=20,ne=2800,te=[];for(let e=0;e<ne;e++){const L=(Math.random()-.5)*re,Se=(Math.random()-.5)*re;te.push(new a(L,G/6,Se))}const A=new Ie(De,f(),ne),oe=[];te.forEach((e,L)=>{oe.push(e.x,e.y,e.z)}),A.geometry.setAttribute("instancePos",new Ye(new Float32Array(oe),3)),A.geometry.getAttribute("instancePos").needsUpdate=!0,A.layers.set(0),o.add(A);const k=new Qe;o.add(k),new me({color:11184810,roughness:.4,metalness:.1});const j=new T(new Xe(1,1,1),z());j.position.set(-2,.5,0),j.rotateY(64),k.add(j);const ie=new T(new Je(.6,.6,1.5,32),z());ie.position.set(0,.75,-2),k.add(ie),k.traverse(e=>{e.layers.set(1)});const U=.1;function ze(){if(g.w&&n.position.add(n.getWorldDirection(new a).multiplyScalar(U)),g.s&&n.position.add(n.getWorldDirection(new a).multiplyScalar(-U)),g.a){const e=new a(-1,0,0);e.applyQuaternion(n.quaternion),n.position.add(e.multiplyScalar(U))}if(g.d){const e=new a(1,0,0);e.applyQuaternion(n.quaternion),n.position.add(e.multiplyScalar(U))}}window.addEventListener("keydown",e=>g[e.key.toLowerCase()]=!0),window.addEventListener("keyup",e=>g[e.key.toLowerCase()]=!1);function ae(){const e=r.getElapsedTime();requestAnimationFrame(ae),M().uniforms.uPointLightPos.value.copy(s.position),M().uniforms.uPointLightColor.value.copy(s.color),f().uniforms.uPointLightPos.value.copy(s.position),f().uniforms.uPointLightColor.value.copy(s.color),f(f().uniforms.uTime.value=r.getElapsedTime()),z().uniforms.uPointLightPos.value.copy(s.position),z().uniforms.uPointLightColor.value.copy(s.color),z(z().uniforms.uTime.value=r.getElapsedTime());const L=3;s.position.x=Math.cos(e)*L,s.position.z=Math.sin(e)*L,s.position.y=3+Math.sin(e*1),o.overrideMaterial=Pr,n.layers.disableAll(),n.layers.enable(1),i.setRenderTarget(P),i.setViewport(0,0,u,c),i.clear(),i.render(o,n),i.setRenderTarget(w),i.clear(),i.render(o,n),o.overrideMaterial=null,n.layers.enableAll(),i.setRenderTarget(d),i.clear(),i.render(o,n),t(t().uniforms.uTexNormal.value=P.texture),t(t().uniforms.uTexObjDepth.value=w.depthTexture),t(t().uniforms.uTexColor.value=d.texture),t(t().uniforms.uTexScrDepth.value=d.depthTexture),Q.material=t(),i.setRenderTarget(null),i.setViewport(0,0,window.innerWidth,window.innerHeight),i.render(v,ye),X.update(),O.render(),ze()}return ae(),window.onresize=()=>{O.update()},()=>{window.removeEventListener("resize",J),window.removeEventListener("keydown",e=>g[e.key.toLowerCase()]=!0),window.removeEventListener("keyup",e=>g[e.key.toLowerCase()]=!1)}}),Le(()=>{}),Me(()=>b(F),()=>{typeof window<"u"&&b(F)&&H()}),Ne(),we();var Y=Dr();_e(Y,r=>R(y,r),()=>b(y)),fe(S,Y),he()}var Sr=ve('<main style="margin: 0; padding: 0; overflow: hidden;"><!></main>');function Or(S,x){pe(x,!1),ge(()=>(document.body.classList.add("no-scroll"),()=>{document.body.classList.remove("no-scroll")})),we();var y=Sr(),o=Fe(y);zr(o,{}),qe(y),fe(S,y),he()}export{Or as component};
