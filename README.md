# Aura Skin — landing page

Built from the Figma Make file "eCommerce Landing Page Structure". React 19 + Vite + TypeScript.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production
```bash
npm run build      # outputs static site to /dist
npm run preview    # check the production build locally
```

## Deploy
The `dist` folder is a plain static site — any static host works.

- **Vercel:** push this folder to GitHub, import the repo at vercel.com/new. It auto-detects Vite (build `npm run build`, output `dist`).
- **Netlify:** import the repo at app.netlify.com, or drag the `dist` folder onto app.netlify.com/drop.
- **Cloudflare Pages / GitHub Pages:** same settings — build `npm run build`, output `dist`.

## Before going live
- Images load from Unsplash URLs; swap in your own product photos in `src/App.tsx`.
- "Add to ritual" and the email form are visual only — connect them to your store (e.g. Shopify, Stripe) and mailing list provider.
