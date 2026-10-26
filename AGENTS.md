# Agents working in this repo

1. Read `GUIDELINE.md` before you change a demo. It lists the shell, kit, states and rules you must reuse.
2. Start a new prototype with `npm run new -- <slug> "<Feature name>"`; never copy a demo folder by hand.
3. Edit only `demos/<slug>/` and that demo's card in `hub/data/registry.json`. The starter in `templates/demo/` changes only on purpose, in its own Pull Request.
4. Fake data only, no production code, no network calls, no secrets. `npm run check` enforces it; run it before every push.
5. Work on a branch and open a Pull Request; `main` is protected and only changes through a green PR.
