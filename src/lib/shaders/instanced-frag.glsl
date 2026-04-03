precision highp float;

uniform sampler2D uMap;

varying vec2 vUv;

void main() {

    vec4 tex = texture2D(uMap, vUv);

    // discard fully transparent pixels
    if(tex.a < 0.4) discard;

    gl_FragColor = tex;
}