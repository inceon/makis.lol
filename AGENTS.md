# Makis.lol — contributor guide

## Project at a glance

- This is a **React + TypeScript + Vite** landing page for Makis, a Minecraft-inspired hero.
- It is intentionally a **single-screen interactive scene**. Do not introduce vertical scrolling, section stacks, or conventional dashboard/card layouts unless the user explicitly requests them.
- GitHub Pages publishes the production `dist/` directory after every push to `main`.

## Useful commands

```bash
npm install
npm run dev
npm run build
```

- Run `npm run build` after every code change. It type-checks TypeScript and produces the GitHub Pages artifact.
- For React changes, also run:

```bash
npx -y react-doctor@latest . --verbose --scope changed
```

## Code structure

- `src/App.tsx` contains the page composition and interaction logic.
- `src/styles.css` owns the complete visual scene and responsive behavior.
- `src/main.tsx` is the React entry point.
- `public/assets/` holds project images. Reference them from React using root paths, for example `/assets/makis-world.png`.
- `.github/workflows/deploy-pages.yml` builds with Vite and deploys `dist/` to GitHub Pages. Keep this workflow aligned with the package scripts.

## Interaction and visual rules

- Preserve the `100svh` / `overflow: hidden` layout: the experience must fit into one viewport.
- Makis is the main focal point. Keep the character visually centered and the left side calm enough for the title and join action.
- Keep cursor movement lightweight. Update CSS custom properties or use `requestAnimationFrame`; avoid expensive work during pointer events.
- Respect `prefers-reduced-motion` for new animation or parallax.
- Mobile is a distinct composition, not merely a scaled desktop layout. Check both narrow and short viewports.
- Keep copy sparse and purposeful. The visual world should do most of the storytelling.

## Assets

- Do not overwrite existing image assets without an explicit request. Add versioned sibling files instead.
- Use optimized PNG/WebP assets where practical. Keep large source or experiment files outside `public/` so Vite does not ship them.
- When creating new visual assets, make their composition serve the overlay: avoid embedded text, logos, or subjects competing with Makis in the centre.

## Deployment and custom domain

- Pages is deployed through GitHub Actions, not branch-based Pages publishing.
- The custom domain is `makis.lol`; its DNS is external to this repository. Do not alter `CNAME` or DNS assumptions unless the user asks.
- Verify a deployed site through the Pages workflow and `npm run build`; a DNS/HTTPS status change can take some time to appear in GitHub's settings UI.
