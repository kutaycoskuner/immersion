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

- [x] gpu/cpu: add image and alpha to quad
    - added two textures from apprentice
    - texture u material uzerinden eklmedim
    - gorselde alpha oldugundan emin degildim photoshopta alpha channel ekleyip kontrol ettim
    - vrtx uv > frag: fragmentta alpha pass
    - problem: document not defined 
        - solution: texture importu sahne icine aldim

- [x] gpu: animating grass
    - added wind sway with time and shifting x of upper coordinates with sin wave

- [x] basic light interaction
    - added some objects
    - added point light
    - rotated point light
    - tweak position, str of point light
    - disabled directional light
    - i can see materials are responding to light
    - now for custom  shaders
        - tried for instancedquads but had problem.
            - built in solution did not work
        - switched to simpler example
            - illumunate the ground instead
            - point lighti uniform olarak gondererek groundu aydinlattim


- [ ] color pass from ground to grass
    - added texture to ground
    - seamless 2d black and white texture, grunge, cloud noise, brush stroke cc0 with patches
    - blur, hue-> saturate, color overylay
    - ground pass in illuminated versiyonu icin 2 pass gerektigi icin, ayni degiskenleri grass a da gonderip orada da hesaplattiriyorum
    - nk: ground texture color smapling

- [ ] pixelation 
    - 


- [ ] outlines

- [ ] pseudo-isometric camera