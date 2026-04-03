#

- [x] cpu: create ground plane

- [x] cpu: create quad for simulating grass patches

- [x] cpu: generate position points for spawning quads

- [x] cpu: instance mesh
    - used instancedMesh class of three.js
    - need to use custom shader for artistic control
    - problem: material not working with custom shaders
        - solved by passing positions as attribute

- [x] gpu: orient faces to camera
    - billboarding / axis aligned billboarding 
    - normal of quad should face to opposite of camera direction

- [x] add image and alpha to quad
    - added two textures from apprentice
    - texture u material uzerinden eklmedim
    - gorselde alpha oldugundan emin degildim photoshopta alpha channel ekleyip kontrol ettim
    - vrtx uv > frag: fragmentta alpha pass
