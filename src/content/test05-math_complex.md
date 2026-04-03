---
template: 1.6
revision: 1.3
title: Test complex math notations
description: katex complex math statements tests
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

# Testing KaTeX with Complex Expressions

### 1. Quadratic Formula (Display Mode)

This shows complex fractions and roots.

<Katex expression={String.raw`
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
`} displayMode={true} />


### 2. Logical Statements (Inline Mode)

An example of a conditional logical statement:

<Katex expression={String.raw`
P \implies (Q \lor \neg R)
`} displayMode={true} /> is a common way to express a logical implication.


### 3. Matrix and Systems of Equations (Display Mode)

An example of a 4x4 matrix.

<Katex expression={String.raw`
\det(A) = \begin{vmatrix}
a & b & c & d \\
e & f & g & h \\
i & j & k & l \\
m & n & o & p
\end{vmatrix}
`} displayMode={true} />


### 4. Complex Integral with Limits (Display Mode)

A definite integral example using a complex exponential function.

<Katex expression={String.raw`
\int_{-\infty}^{\infty} e^{-x^2/2} dx = \sqrt{2\pi}
`} displayMode={true} />


### 5. Piecewise Function (Display Mode)

Showing how to define a function with multiple cases.

<Katex expression={String.raw`
f(x) =
\begin{cases}
-x & \text{if } x < 0 \\
x^2 & \text{if } 0 \le x < 2 \\
4 & \text{if } x \ge 2
\end{cases}
`} displayMode={true} />


### 6. Original Integral Example (Display Mode)

<Katex expression={String.raw`
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
`} displayMode={true} />
