---
template: 1.6
revision: 1.3
title: Test katex math notation
description: katex content rendering test
category:
  - sveltekit
  - svelte
tags:
  - game-design
  - draft
created: 2023-03-01
updated: 2023-03-01
author: lichzelg
language: en
visibility: true
sort_order: 1
---

<script>
  import Katex from '$lib/components/Katex.svelte'
</script>

# Testing KaTeX


Block math example:

a^2 + b^2 = c^2

$a^2 + b^2 = c^2$

<Katex expression={String.raw`
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
`} displayMode={true} />
