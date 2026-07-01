# Site Blueprint — visual plan-and-code tool for any website

Load your **real, running website** inside the tool and plan changes **on top of it** — then export
a spec precise enough that a human or an AI model can apply it exactly.

No framework, no build, no dependencies. **Two files.** Works on any page served from the same origin.

## What it does

- **The real site runs in an iframe** — so the "mockup" is always 100% accurate, because it *is* the site.
- **Existing vs Planned** — every tracked element shows a cyan box (where it is now, read live from the
  DOM) and a gold box (where you want it). Drag the gold box, resize it with the corner grip, rename it.
  A connector line shows the move.
- **Apply / revert live** — push the planned rect onto the real element to preview it in place, one
  click to undo.
- **Notes** — attach instructions to any element.
- **Animation mode** — per element: name, trigger (click / hover / power-on / scroll / …), duration,
  easing, description — and **draw the motion path with a pen** right on the page. ▶ previews the real
  element along your drawn path (Web Animations API).
- **Draw mode** — freehand pen / arrows / eraser over the whole page, per view.
- **Blueprint look** — blue-tint + engineering grid toggle.
- **AI HANDOFF export** — one click copies a spec (existing rect, planned rect, notes, animation specs,
  motion-path coordinates, raw JSON) written so a future AI model can apply the plan with zero guessing.
  The schema and apply-rules contract lives in `BLUEPRINT-README.md`.

## Use

```bash
# serve your site folder, drop the two files in it
python3 -m http.server 8803
# open:
#   http://localhost:8803/blueprint.html                 → plans index.html
#   http://localhost:8803/blueprint.html?site=other.html → plans any same-origin page
```

Everything auto-saves to `localStorage` per site. Exports: **AI handoff spec** (clipboard), **JSON**
(download), **CSS** (planned rects as rules).

## Files

| File | Role |
|---|---|
| `blueprint.html` | The tool. Single file, zero deps. |
| `BLUEPRINT-README.md` | The handoff contract: JSON schema v2 + how an AI must apply a blueprint. |
| `radio-plan.html` | Smaller sibling: asset-based drag editor purpose-built for the Wise Rock Fish Radio view. |

## Limits

Same-origin only (browser security — the tool must be served from the same folder/domain as the page
it plans). Cross-origin sites can't be loaded.

---
Built for [spiritstriker.app](https://spiritstriker.app) (see the *spirit-strikers-site* repo);
extracted here because it works on any site. Sibling: *observatory-planner* (3D room layout editor).
