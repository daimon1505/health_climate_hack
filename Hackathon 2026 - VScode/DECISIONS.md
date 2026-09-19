# Decisions log

Every **[DECISION]** / **[VERIFY]** item from PLAN.md is listed here. Record the answer as: date, choice, reason.

## Provisional choices made to start building (2026-09-19). Please confirm or change them.

| # | Item | Provisional choice | Why | Confirmed? |
|---|---|---|---|---|
| 1 | Unit of analysis | 2020 NTAs (262 areas, 197 residential) | First option in PLAN.md; boundaries downloaded from NYC Open Data. Easy to swap if HVI is published at another level. | ☐ |
| 2 | Weather metric | TMAX tiers | Daily summaries have no humidity | ☐ |
| 3 | PLACES measures | — (placeholder burden values) | Waiting for team | ☐ |
| 4 | Band cutoffs / env tiers | PLAN.md starter values (0–3 / 4–6 / 7–10; 85/90/95/100°F) | Not yet checked against NWS criteria | ☐ |
| 5 | Episodes | 4 placeholder episodes (84 / 92 / 97 / 101°F) | Waiting for NOAA data | ☐ |
| 6 | Patient personas | 3 SAMPLE personas: lithium (Maria), clozapine + anticholinergic, no AC (Robert), asthma with no heat-risk meds (Aisha) | Chosen to show contrast; team will replace | ☐ |
| 7 | Consent in demo | Maria = true, Robert = true, Aisha = **false** (shows the "degrade to prompt" flow) | PLAN.md recommendation | ☐ |
| 8 | Clinical sign-off | Nobody yet; all rules marked `UNREVIEWED` | — | ☐ |
| 9 | Patient view of own chart | Only medicines (with heat notes) | PLAN.md recommendation | ☐ |
| 10 | Hosting | Local for now | — | ☐ |
| 11 | Med-rule risk levels | Placeholder: lithium, clozapine, anticholinergic = high; antipsychotic, diuretic = moderate | Must be replaced from the CDC page | ☐ |
| 12 | Qualifying chronic conditions (vulnerability rule) | heart failure, coronary, COPD, chronic kidney, diabetes, stroke, dementia, schizophrenia | Placeholder list in `scoring.js` | ☐ |

## Questions found while building

- **The vulnerability rule has no temperature minimum in PLAN.md.** Robert (age 67, no AC) is therefore yellow even
  on an ordinary 84°F day. Is that intended, or should it also require heat points ≥ 2? (One setting:
  `vulnerability_rule.min_env_points` in `scoring.js`.)
- **Dedup key.** An alert is one per patient + episode + place. The level is upgraded yellow → red in place.
