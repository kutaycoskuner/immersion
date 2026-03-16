import{f as d,a as m}from"./B8MFgm8Y.js";import"./CcG9GTjx.js";import{e,f as x}from"./DSQyKW5-.js";import{K as t}from"./KmtRYGeL.js";const c={template:1.6,revision:1.3,title:"Test complex math notations",description:"katex complex math statements tests",category:["sveltekit","svelte"],tags:["game-design","draft"],created:"2023-03-01T00:00:00.000Z",updated:"2023-03-01T00:00:00.000Z",author:"lichzelg",language:"en",visibility:!0,sort_order:1},{template:v,revision:w,title:_,description:M,category:S,tags:b,created:T,updated:D,author:q,language:A,visibility:k,sort_order:E}=c;var g=d("<h1>Testing KaTeX with Complex Expressions</h1> <h3>1. Quadratic Formula (Display Mode)</h3> <p>This shows complex fractions and roots.</p> <!> <h3>2. Logical Statements (Inline Mode)</h3> <p>An example of a conditional logical statement:</p> <!> is a common way to express a logical implication. <h3>3. Matrix and Systems of Equations (Display Mode)</h3> <p>An example of a 4x4 matrix.</p> <!> <h3>4. Complex Integral with Limits (Display Mode)</h3> <p>A definite integral example using a complex exponential function.</p> <!> <h3>5. Piecewise Function (Display Mode)</h3> <p>Showing how to define a function with multiple cases.</p> <!> <h3>6. Original Integral Example (Display Mode)</h3> <!>",1);function I(p){var i=g(),a=e(x(i),6);t(a,{expression:String.raw`
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
`,displayMode:!0});var o=e(a,6);t(o,{expression:String.raw`
P \implies (Q \lor \neg R)
`,displayMode:!0});var s=e(o,6);t(s,{expression:String.raw`
\det(A) = \begin{vmatrix}
a & b & c & d \\
e & f & g & h \\
i & j & k & l \\
m & n & o & p
\end{vmatrix}
`,displayMode:!0});var r=e(s,6);t(r,{expression:String.raw`
\int_{-\infty}^{\infty} e^{-x^2/2} dx = \sqrt{2\pi}
`,displayMode:!0});var n=e(r,6);t(n,{expression:String.raw`
f(x) =
\begin{cases}
-x & \text{if } x < 0 \\
x^2 & \text{if } 0 \le x < 2 \\
4 & \text{if } x \ge 2
\end{cases}
`,displayMode:!0});var l=e(n,4);t(l,{expression:String.raw`
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
`,displayMode:!0}),m(p,i)}export{I as default,c as metadata};
