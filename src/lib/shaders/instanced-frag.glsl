precision highp float;

uniform sampler2D map;

varying vec2 vUv;

void main() {

    vec4 tex = texture2D(map, vUv);

    // discard fully transparent pixels
    if(tex.a < 0.4) discard;

    gl_FragColor = tex;
}