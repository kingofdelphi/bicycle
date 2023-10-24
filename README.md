This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.




# THE PHYSICS

## Formulas:

\[ N = \text{contact normal} \]

\[ V_{a_c} = U_{a_c} + \frac{j}{Ma} \cdot N \]

\[ V_{b_c} = U_{b_c} - \frac{j}{Mb} \cdot N \]

\[ U_a = U_{a_c} + W_a R_a \]

\[ U_b = U_{b_c} + W_b R_b \]

\[ W_a' = W_a + \frac{Ra \times N}{Ia} \]

\[ W_b' = W_b - \frac{Rb \times N}{Ib} \]

\[ V_a = V_{a_c} + W_a' R_a \]

\[ V_a = V_{a_c} + (W_a + \frac{Ra \times N}{Ia}) R_a \]

\[ V_a = V_{a_c} + W_a R_a + \frac{j(Ra \times N) R_a}{Ia} \]

\[ V_b = V_{b_c} + W_b' R_b \]

\[ V_b = V_{b_c} + (W_b - \frac{Rb \times N}{Ib}) R_b \]

\[ V_b = V_{b_c} + W_b R_b - \frac{j (Rb \times N) R_b}{Ib} \]

\[ V_a \cdot N - V_b \cdot N = -e(Ua \cdot N - Ub \cdot N) \]

\[ (V_{a_c} + j \frac{(Ra \times N) Ra}{Ia}) \cdot N - (V_{b_c} - j \frac{(Rb \times N) Rb}{Ib}) \cdot N = -e (Ua \cdot N - Ub \cdot N) - (Wa R_a) \cdot N + (Wb \times Rb) \cdot N \]

\[ (U_{a_c} + \frac{j}{Ma} \cdot N + j \frac{(Ra \times N) Ra}{Ia}) \cdot N - (U_{b_c} - \frac{j}{Mb} \cdot N - j \frac{(Rb \times N) Rb}{Ib}) \cdot N = -e (Ua \cdot N - Ub \cdot N) - (Wa R_a) \cdot N + (Wb \times Rb) \cdot N \]

\[ j \left( \frac{1}{Ma} \cdot N + \frac{(Ra \times N) Ra}{Ia} \right) \cdot N - j \left( -\frac{1}{Mb} \cdot N - \frac{(Rb \times N) Rb}{Ib} \right) \cdot N = -e (Ua \cdot N - Ub \cdot N) - (Wa R_a) \cdot N + (Wb \times Rb) \cdot N - U_{a_c} \cdot N + U_{b_c} \cdot N \]

\[ j = \frac{-e(Ua \cdot N - Ub \cdot N) - (Wa R_a) \cdot N + (Wb \times Rb) \cdot N - U_{a_c} \cdot N + U_{b_c} \cdot N}{\frac{1}{Ma} \cdot N + \frac{(Ra \times N) Ra}{Ia} \cdot N - \left( -\frac{1}{Mb} \cdot N - \frac{(Rb \times N) Rb}{Ib} \right) \cdot N} \]

\[ j = \frac{-e(Ua \cdot N - Ub \cdot N) - Ua \cdot N + Ub \cdot N}{\frac{1}{Ma} + \frac{1}{Mb} + \left( \frac{(Ra \times N) Ra}{Ia} \cdot N + \frac{(Rb \times N) Rb}{Ib} \cdot N \right)} \]

\[ j = \frac{-(1+e)(Ua \cdot N - Ub \cdot N)}{\frac{1}{Ma} + \frac{1}{Mb} + \left( \frac{(Ra \times N) Ra}{Ia} \cdot N + \frac{(Rb \times N) Rb}{Ib} \cdot N \right)} \]


