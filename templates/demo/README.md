# Golden starter (templates/demo)

This folder is what `npm run new -- <slug> "<Feature name>"` copies into `demos/<slug>/`. It is also built and served at
https://joy-prototypes.web.app/starter/ so anyone can click through it first.

How to build on it (shell, kit, nine states, tokens, rules): [`GUIDELINE.md`](../../GUIDELINE.md).

Change the starter itself only in a Pull Request of its own: every future demo inherits it, and `npm run check` runs its
browser test (`test/starter-check.mjs`) on every PR.
