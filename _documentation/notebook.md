# Notebook

# Installation and Use
- prerequisites
- install
- build
- run deployment
- run release

# Build 
- install
- update
- fixing

- development
    - cd immersion
    - yarn run dev --open 
    
- deployment
    - https://svelte.dev/docs/kit/adapter-static
    - yarn add @sveltejs/adapter-static`
    - yarn add gh-pages --dev
    - yarn build

- delete modules
    - yarn remove gh-pages

- testing
    - yarn global add serve

- creation
    - npx sv create <app-name>
    - npx sv create immersion
        - sv@0.6.10
        - which template would you like?
            - [x] sveltekit minimal (barebones scafffolding for your new app)
            - svelte library
        - add type checking with typescript?
            - yes, using typescript syntax
        - what would you like to add to your project
            - prettiest, eslint, vitest, playwright, sveltekit-adapter, drizzle, mdsvex
            - not: tailwindcss, lucia, paraglide, storybook
        - tailwindcss: which plugins would you like to add?
            - typography
            - not forms, container-queries
        - sveltekit adapter: which sveltekit adapter would you like to use/
            - static
        - drizzle: which database would you like to use?
            - postgresql
            - not mysql, sqlite
        - dirizzle which postgresql client would you like to use?
            - postgres.js 
            - not neon
        - drizzle: do you want to run the database locally with docker compose?
            - yes
        - which package manager do you want to install dependencies with?
            - npm
    - yarn add @types/three --dev

# Links
- svelte tutorialsf
    - https://svelte.dev/tutorial/svelte/welcome-to-svelte

- svelte kit first project link
    - https://svelte.dev/docs/kit

- deployment
    - https://www.okupter.com/blog/deploy-sveltekit-website-to-github-pages

- svelte markdown blog
    - https://joyofcode.xyz/sveltekit-markdown-blog

# Keywords

# Features to implement
1. [x] deployment
2. [x] basic component
3. [ ] state management between components             
4. [x] markdown rendering / toc / footnotes on static   | blog post
5. [ ] json data import                                 | blog
6. [ ] 3d rendering                                     | space

- import main css
- import lefthoverhav, colormode, gotoup, imageslider

# Structure

# Blackboard
- three.js defaults
    - right handed
    - y up

# How to

# Problems
- <problem>

