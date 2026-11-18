# Golden starter (templates/demo)

This folder is what `npm run new -- <slug> "<Feature name>"` copies into `demos/<slug>/`. It is also built and served at
https://joy-prototypes.web.app/starter/ so anyone can click through it first.

Components are Polaris 12 React; their look is Polaris 2 / the new Shopify admin through `src/styles/polaris2.css`. New demos copy this template and inherit the dark full-height navigation, inset page panel, pill buttons, and round cards. Do not bring back the old grey canvas, top bar, or beveled buttons.

How to build on it (shell, kit, nine states, tokens, rules): [`GUIDELINE.md`](../../GUIDELINE.md).

Change the starter itself only in a Pull Request of its own: every future demo inherits it, and `npm run check` runs its
browser test (`test/starter-check.mjs`) on every PR.
