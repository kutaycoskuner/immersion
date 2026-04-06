precision highp float;

uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;

uniform sampler2D uMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLeafIllumination;

void main() {

    // remove transparent zones
    // -------------------------------------------------------------
    vec4 tex = texture2D(uMap, vUv);
    // discard fully transparent pixels
    if(tex.a < 0.5) discard;

    // final pixel color 
    // -------------------------------------------------------------
    gl_FragColor = vec4(vLeafIllumination, tex.a);

}