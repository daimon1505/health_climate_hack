# Scoring manual test table

Expected results with the **current placeholder data** and CONFIG in `site/js/scoring.js`.
When real data or rules change, re-check each row in the app (Demo controls → episode + location) and update this table.

| # | Patient | Location | Episode | Area band (score) | Rules fired | Expected personal band | Expected alert | Checked in app |
|---|---|---|---|---|---|---|---|---|
| 1 | Maria Santos (patient1) | Home — MN0702 | Ordinary summer day (placeholder) (84°F) | Safe (0) | none | **Safe** | none | ☐ |
| 2 | Maria Santos (patient1) | Home — MN0702 | Heat episode B — severe (placeholder) (97°F) | Safe (3) | medication | **Moderate** | yellow (patient may report) | ☐ |
| 3 | Maria Santos (patient1) | Work — MN0203 | Heat episode A — moderate (placeholder) (92°F) | Moderate (4) | medication | **Dangerous** | red (auto-sent) | ☐ |
| 4 | Maria Santos (patient1) | Work — MN0203 | Heat episode B — severe (placeholder) (97°F) | Moderate (5) | medication | **Dangerous** | red (auto-sent) | ☐ |
| 5 | Robert Hayes (patient2) | Home — BX0402 | Ordinary summer day (placeholder) (84°F) | Safe (2) | vulnerability | **Moderate** | yellow (patient may report) | ☐ |
| 6 | Robert Hayes (patient2) | Home — BX0402 | Heat episode B — severe (placeholder) (97°F) | Moderate (5) | medication, stacking, vulnerability | **Dangerous** | red (auto-sent) | ☐ |
| 7 | Robert Hayes (patient2) | Pharmacy — BX0301 | Heat episode A — moderate (placeholder) (92°F) | Safe (3) | medication, stacking, vulnerability | **Dangerous** | red (auto-sent) | ☐ |
| 8 | Aisha Khan (patient3) | Home — BX0402 | Heat episode B — severe (placeholder) (97°F) | Moderate (5) | none | **Moderate** | yellow (patient may report) | ☐ |
| 9 | Aisha Khan (patient3) | Work — MN1001 | Heat episode B — severe (placeholder) (97°F) | Dangerous (7) | none | **Dangerous** | red (no consent → patient prompted) | ☐ |
| 10 | Aisha Khan (patient3) | Family — MN0702 | Heat episode B — severe (placeholder) (97°F) | Safe (3) | none | **Safe** | none | ☐ |
| 11 | Aisha Khan (patient3) | Family — MN0702 | Heat episode C — extreme (placeholder) (101°F) | Moderate (4) | none | **Moderate** | yellow (patient may report) | ☐ |
| 12 | Maria Santos (patient1) | Clinic — MN0603 | Heat episode C — extreme (placeholder) (101°F) | Moderate (5) | medication | **Dangerous** | red (auto-sent) | ☐ |

Also check:
- [ ] Yellow alert reaches the care-team inbox **only** after the patient taps "Report to my care team".
- [ ] Red alert (consent = true) appears in the care-team inbox **without** opening the patient account.
- [ ] Moving yellow → red at the same place/episode upgrades the one alert (no duplicate).
- [ ] Reset demo clears all alerts.
