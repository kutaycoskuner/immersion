        varying vec3 vNormal;
        void main() {
            // map from [-1,1] to [0,1] for storage
            gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
        }