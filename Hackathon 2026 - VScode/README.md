# HeatSafe NYC (hackathon demo)

A click-through website demo for the NYC 2026 Climate + Health hackathon. It shows:

1. **How dangerous a past heat episode was across NYC**, as a neighborhood map.
2. **How each patient's own medicines and conditions** change which places are dangerous *for them*.
3. **How warnings flow between patient and care team**. A yellow warning lets the patient choose to report. A red warning goes to the care team automatically if the patient consented.

Everything is static: no server, no login, no live data. All patients are **synthetic** (made up).
The full product plan is in [PLAN.md](PLAN.md).

---

## How to view the website

### Option A: Double-click (quickest)
In Finder, open this folder and double-click **`index.html`**. It opens the site in your browser.

### Option B: Local web server (recommended when you change data)
1. In VS Code, open the terminal: menu **Terminal → New Terminal** (or press **Ctrl + `**).
2. Type this and press Enter:
   ```
   python3 -m http.server 8000
   ```
3. Open **http://localhost:8000/site/** in your browser.
4. To stop the server, click in the terminal and press **Ctrl + C**.

After changing a file, refresh the browser (**Cmd + R**).

> **Why two options?** Browsers block data files when you double-click. To work around this, the site also reads
> `site/js/data_bundle.js`, a copy of all data files. If you edit anything in `data/processed/`, either use
> Option B or rebuild the copy with `python3 scripts/bundle_data.py`.

---

## Demo walkthrough (about 3 minutes)

1. **Heat map** (home page): click **⚙ Demo controls** (top right) and pick a heat episode. The map changes color.
2. **Sign in** → choose **Maria Santos**. Her personal map looks different from the public one.
   Under *"Demo: pretend you are at…"*, click **Home**. You get a yellow warning. Tap **Report to my care team**.
3. **Switch account** (top right) → **Robert Hayes**. A red warning appears: *"your care team has been notified"*.
4. **Switch account** → **Care Team**. The inbox shows Maria's report and Robert's automatic red alert.
   Try **Acknowledge**, **Call patient**, **Add note**. Click a patient name to open their **chart** (9 tabs).
5. Show **Methods**, **Evidence** and **Ethics** in the top menu.
6. **⚙ Demo controls → Reset demo** clears all alerts before the next run.

Tip: select the **"Heat episode B — severe"** episode for the clearest contrast. Robert and Aisha live in the same
neighborhood, but Robert is red and Aisha is yellow.

---

## How to add or change things

### Ask Claude (easiest)
Edit [PLAN.md](PLAN.md) or just describe what you want, for example:
- "Read PLAN.md and update the website."
- "Patient 2 should have COPD and take furosemide. Update their chart."
- "Change the heat-temperature tiers to 88/93/98/103."

### Where things live

| I want to change… | Edit this file |
|---|---|
| A patient's conditions, medicines, places, or chart | `data/processed/patients/patient1.json` (2, 3) |
| Medication heat rules (from the CDC page) | `data/processed/med_rules.json` |
| Heat episodes (dates, temperatures) | `data/processed/episodes.json` |
| Patient tips, 211 link, disclaimer | `data/processed/tips.json` |
| Care team name / phone | `data/processed/care_team.json` |
| **Any scoring number or threshold** | `site/js/scoring.js` → the `CONFIG` object at the top |
| Colors, fonts, spacing | `site/css/style.css` (top section) |
| Page layouts | `site/js/pages/*.js` |

After editing anything in `data/processed/`, run `python3 scripts/bundle_data.py` so double-click mode stays up to date.

### Project layout

```
PLAN.md, README.md, DECISIONS.md
data/raw/              downloaded originals (NYC neighborhood boundaries)
data/processed/        small files the site reads
data/placeholders/     placeholder "scan" images (not real)
data/SOURCES.md        where each dataset comes from
scripts/prep_data.py   raw → processed
scripts/bundle_data.py processed → site/js/data_bundle.js
site/                  the website (index.html, css, js, vendor/leaflet)
tests/scoring.test.md  manual test table: input → expected color and alert
```

---

## Open TODOs

**Data (the map currently uses PLACEHOLDER numbers, shown by a striped banner on each page):**
- [ ] TODO_P1: real NYC Heat Vulnerability Index per neighborhood → `prep_data.py`
- [ ] TODO_P1: real CDC PLACES burden composite → `prep_data.py`
- [ ] TODO_P1: real heat episodes from NOAA (Central Park) → `episodes.json`
- [ ] TODO_P2: copy mechanism / clinician notes / risk levels from the CDC page into `med_rules.json`; clinician review
- [ ] TODO_P2: team to supply the 3 real patient personas (current ones are samples); clinician review of charts
- [ ] TODO_P7: validation against NYC heat-illness ED data → `validation.json`

**Decisions:** see [DECISIONS.md](DECISIONS.md).

**Later:** Spanish / Chinese tips, cooling-center finder, hosting (GitHub Pages or Netlify Drop).
