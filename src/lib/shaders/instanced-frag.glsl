precision highp float;

uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;
uniform vec3 uGrassTint;

uniform sampler2D uMap;
varying vec3 vGroundColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {

    vec4 tex = texture2D(uMap, vUv);
    // discard fully transparent pixels
    if(tex.a < 0.5) discard;

    // terrain color
    vec3 baseColor = vGroundColor;

    // lighting
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);
    float diff = max(dot(normalize(vNormal), lightDir), 0.0);
    vec3 lighting = diff * uPointLightColor + uAmbient;

    vec3 illumination = baseColor * lighting;


    // base color test
    // gl_FragColor = vec4(baseColor, 1.0);

    // lighting test
    // gl_FragColor = vec4(lighting, tex.a);

        // lighting test
    gl_FragColor = vec4(illumination, tex.a);

}