# Agents working in this repo

1. Read `GUIDELINE.md` before you change a demo. It lists the shell, kit, states and rules you must reuse.
2. Start a new prototype with `npm run new -- <slug> "<Feature name>"`; never copy a demo folder by hand.
3. Before drawing, map the change to the REAL Joy admin screen on `avada/master` (menu → page → panel/field) and fill `demos/<slug>/REFERENCE.md`; put the change in that place with the same control type, never in a new parallel block. The card's `reviewUrl` opens straight on the changed screen (`#/<screen>`). `npm run check` fails a new demo without both (GUIDELINE §4).
4. Edit only `demos/<slug>/` and that demo's card in `hub/data/registry.json`. The starter in `templates/demo/` changes only on purpose, in its own Pull Request.
5. Fake data only, no production code, no network calls, no secrets. `npm run check` enforces it; run it before every push.
6. Work on a branch and open a Pull Request; `main` is protected and only changes through a green PR.
