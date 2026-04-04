// precision highp float
uniform vec3 uColor;
uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;
uniform sampler2D uMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;


void main() {
    // Lighting
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 litColor = uColor * (diff * uPointLightColor + uAmbient);

    // Texture
    vec4 tex = texture2D(uMap, vUv);

    // Mix lighting and texture
    vec3 finalColor = litColor * tex.xyz;

    gl_FragColor = vec4(finalColor, 1.0);
}


