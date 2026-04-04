precision highp float;

uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;
uniform vec3 uGrassTint;

uniform sampler2D uMap;
uniform sampler2D uGroundTex;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {

    vec4 tex = texture2D(uMap, vUv);
    // discard fully transparent pixels
    if(tex.a < 0.4) discard;

    // sample ground color using world position
    float groundHalfSize = 10.0;
    vec2 groundUV = (vWorldPos.xz + groundHalfSize) / (groundHalfSize * 2.0);
    vec3 groundColor = texture2D(uGroundTex, groundUV).rgb;

     // combine grass tint with ground variation
    vec3 baseColor = groundColor;

    // lighting
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);
    float diff = max(dot(normalize(vNormal), lightDir), 0.0);

    vec3 finalColor = baseColor * (diff * uPointLightColor + uAmbient);;


    gl_FragColor = vec4(baseColor, tex.a);
    // gl_FragColor = vec4(fract(vWorldPos * 0.1),1.0);
    // gl_FragColor = vec4(fract(vWorldPos.x * 0.1), fract(vWorldPos.z * 0.1), 0.0, 1.0);
}