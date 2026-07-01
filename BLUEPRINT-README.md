# Spirit Strikers — Blueprint System (AI Handoff Spec, v1)

This file is the contract between **blueprint.html** (Blu's planning tool) and any AI model
asked to apply a blueprint. Read this fully before touching the site. Follow it exactly.

## The system

| File | Role |
|---|---|
| `index.html` | THE live site (spiritstriker.app). ~5 MB single-file monolith. Edit surgically — grep for anchors, never rewrite wholesale. Always back up first: `cp index.html index.html.bak-<tag>-$(date +%Y%m%d-%H%M%S)` |
| `blueprint.html` | Planning tool. Loads `index.html` in a same-origin iframe, overlays outlines/notes/animation paths/drawings. Persists to `localStorage['ss-blueprint-v1']`, exports the JSON below. |
| `radio-plan.html` | Simpler drag-editor for the radio view only (emits `body.radioview` CSS). |
| `plan.html` | Floor-plan editor for the 3D observatory room (emits `models/layout.js`). |
| `BLUEPRINT-README.md` | This spec. |

Local preview: `python3 -m http.server 8803 --directory /Users/blu/gm-site` → http://localhost:8803/blueprint.html

## Site architecture facts you must know

- The site has two main states: **book view** (default; wooden desk + open book) and
  **radio view** (`body.radioview` class; book & desk objects hidden, Wise Rock Fish Radio player on bare wood).
- The radio tab is created dynamically by `ensureTab()`; the radio UI is injected by `mountRadio()`
  into `#book .majorsheet` as `.wrfradio.wrf-studio`. Its CSS lives in a `<style>` appended by that same
  IIFE (search anchor: `st.textContent=`).
- **Radio-view positioning is controlled exclusively by `body.radioview …` override rules** inside that
  style string. To move/resize a radio element, edit those rules (they use `left/top/width` in `%` with
  `!important`). Do not add competing rules elsewhere.
- Radio elements: `.wrf-turn` (painted turntable composite: `.wrf-pslab` metal slab, `.wrf-pbase`,
  `.wrf-precord` record — JS-rotated, `.wrf-ptone` tonearm, `.wrf-pbtn-off/.wrf-pbtn-on` red/green button
  states, `.wrf-power` hotspot), `.wrf-tape` (painted cassette), `.wrf-grid` (drag-scroll album row),
  `.wrf-title` (title — being replaced by the TRACE logo video at `assets/logo/TRACE-loop-60s.mp4`),
  `.wrf-backbook` (book icon → returns to book view).
- Record spin is a JS physics loop (momentum + friction), NOT a CSS animation. Power state class:
  `.wrf-painted.power-on`.
- Book-view desk objects: `#book/.bookframe`, `#jars`, `#scissors`, `#polaroid`, `#radio` (desk radio),
  `.siderail`, `#tabs`, `#notepad` (vote box), `.loupe`, `.topbar`.
- Assets: `assets/turntable/*.png` (painted pieces), `assets/logo/*` (wordmark video/gif/still),
  `images/cover-<sid>.png` (album covers). Reference as external files — never base64-inline (file-size
  causes 502s on cPanel).

## Blueprint JSON schema (v2)

```json
{
  "version": 2,
  "site": "index.html",
  "elements": {
    "<css-selector>": {
      "label": "human name (Blu may rename — refer to elements by this label)",
      "view": "radioview" | "book",
      "plan": { "x": 0, "y": 0, "w": 0, "h": 0 } | null,
      "applied": null,
      "notes": ["free text, one instruction per entry"],
      "anims": [{
        "name": "spin-up",
        "trigger": "click|hover|power-on|power-off|always|scroll|drag",
        "dur": "2s", "ease": "ease-out | friction | cubic-bezier(...)",
        "desc": "prose description of the intended motion",
        "path": [[x,y], ...]
      }]
    }
  },
  "drawings": { "<view>": [{ "tool": "pen|arrow", "color": "#hex", "points": [[x,y], ...] }] }
}
```

- All coordinates (`plan`, `path`, `points`) are **percent of the site viewport** (0–100, 1 decimal),
  captured at the viewport noted in the handoff header.
- **EXISTING vs PLANNED (the core concept):** the handoff text lists two rects per element.
  `existing` = the element's current live geometry (cyan box in the tool). `plan`/`PLANNED` = the target
  geometry Blu dragged/resized to (gold box). **Apply rule:** make PLANNED real by editing the element's
  own CSS system (`body.radioview …` rules for radio elements; the element's normal rule otherwise) using
  `left/top/width` in `%`. If `plan` is null or equals existing, the element is tracked for notes only.
- `applied` is tool-internal (live-preview undo state). Ignore it.
- The tool can plan ANY same-origin page: `blueprint.html?site=<page>.html`. Data is stored per-site
  under localStorage key `ss-blueprint-v2:<site>`.
- `anims` are **specifications to implement**, not existing code. Implement with CSS animations or the
  Web Animations API, matching trigger/duration/easing/description. `ease: "friction"` means momentum
  decay (see the record's JS physics loop for the house style). A `path` is the motion trajectory in
  viewport %, relative motion = subtract the first point.
- `drawings` are Blu's freehand annotations (arrows = directional intent). Read them as design notes.

## Apply procedure (checklist)

1. Back up `index.html`.
2. For each element with `dx/dy` or notes: locate its rule via grep (radio: inside `st.textContent`),
   update `left/top/width` percentages. Keep `!important` where already present.
3. Implement each `anims[]` entry near the existing radio JS (the `mountRadio` IIFE) or as CSS in the
   same style string. Match names — Blu refers to them by `name`.
4. Honor every `notes[]` line — they are direct instructions from Blu.
5. Verify in a real browser at http://localhost:8803 (radio tab: 📻). Screenshot before/after.
6. Never touch: Krita `.kra` files (never save over them), the live FTP deploy (separate explicit step).
