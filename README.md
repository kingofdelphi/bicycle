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

N = contact normal
Va_c = Ua_c + j / Ma . N
Vb_c = Ub_c - j / Mb . N

Ua = Ua_c + Wa*Ra
Ub = Ub_c + Wb*Rb

Wa' = Wa + (Ra*jN)/Ia
Wb' = Wb - (Rb*jN)/Ib

Va = Va_c + Wa'*Ra
Va = Va_c + (Wa + (Ra*jN)/Ia)*Ra
Va = Va_c + Wa*Ra + j.(Ra*N)*Ra / Ia

Vb = Vb_c + Wb'*Rb
Vb = Vb_c + (Wb - (Rb*jN)/Ib)*Rb
Vb = Vb_c + Wb*Rb - j.(Rb*N)*Rb / Ib

Va.N - Vb.N = -e*(Ua.N-Ub.N)


(Va_c + Wa*Ra + j.(Ra*N)*Ra / Ia).N -  (Vb_c + Wb*Rb - j.(Rb*N)*Rb / Ib).N = -e*(Ua.N-Ub.N)

(Vac+j.(Ra*N)*Ra/Ia).N - (Vb_c - j.(Rb*N)*Rb / Ib).N = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N


(Ua_c + j/Ma.N +j.(Ra*N)*Ra/Ia).N - (Ub_c - j / Mb.N - j.(Rb*N)*Rb / Ib).N = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N


(j/Ma.N +j.(Ra*N)*Ra/Ia).N - (-j / Mb.N - j.(Rb*N)*Rb / Ib).N = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N - Ua_c.N + Ub_c.N

j(1/Ma.N +(Ra*N)*Ra/Ia).N -j(-1 / Mb.N - (Rb*N)*Rb / Ib).N = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N - Ua_c.N + Ub_c.N

j((1/Ma.N +(Ra*N)*Ra/Ia).N -(-1 / Mb.N - (Rb*N)*Rb / Ib).N) = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N - Ua_c.N + Ub_c.N


j = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N - Ua_c.N + Ub_c.N
    ------------------------------------------------------------
    ((1/Ma.N +(Ra*N)*Ra/Ia).N -(-1 / Mb.N - (Rb*N)*Rb / Ib).N)

j = -e*(Ua.N-Ub.N) - (Wa*Ra).N + (Wb*Rb).N - Ua_c.N + Ub_c.N
    ------------------------------------------------------------
    1/Ma + 1/Mb + (((Ra*N)*Ra/Ia).N +((Rb*N)*Rb / Ib).N)


j = -e*(Ua.N-Ub.N) - Ua.N - Ub.N
    ------------------------------------------------------------
    1/Ma + 1/Mb + (((Ra*N)*Ra/Ia).N +((Rb*N)*Rb / Ib).N)

j = -(1+e)*(Ua.N-Ub.N)
    ------------------------------------------------------------
    1/Ma + 1/Mb + (((Ra*N)*Ra).N/Ia + ((Rb*N)*Rb).N)/Ib
