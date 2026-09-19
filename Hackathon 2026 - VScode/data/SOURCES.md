# Data sources

| Dataset | URL | Accessed | Used for | Status / caveats |
|---|---|---|---|---|
| NYC Open Data — 2020 Neighborhood Tabulation Areas (NTAs) | https://data.cityofnewyork.us/d/9nt8-h7nd | 2026-09-19 | Map shapes (`neighborhoods.geojson`) | ✅ Loaded. Simplified (~20 m tolerance) for speed. Non-residential areas (parks, airports, cemeteries) shown grey. |
| NYC Heat Vulnerability Index | NYC Environment & Health Data Portal | — | `hvi` in `neighborhood_metrics.json` | ⏳ TODO_P1. **Placeholder values in use.** [VERIFY] granularity and vintage. |
| CDC PLACES | https://www.cdc.gov/places/ | — | `burden_index` in `neighborhood_metrics.json` | ⏳ TODO_P1. **Placeholder values in use.** Modeled estimates; tract → NTA via NYC equivalency table (`hm78-6dwm`). |
| NOAA NCEI Daily Summaries (Central Park, USW00094728) | https://www.ncei.noaa.gov/ | — | `episodes.json` | ⏳ TODO_P1. **Placeholder episodes in use.** [VERIFY] station ID. |
| NYC Heat-Related Illness (syndromic surveillance) | NYC Environment & Health Data Portal | — | `validation.json` | ⏳ TODO_P7. |
| CDC — Heat and Medications: Guidance for Clinicians | CDC website | — | `med_rules.json` | ⏳ TODO_P2. Class list from team tracker; text/risk levels are placeholders. |
| Leaflet 1.9.4 | https://leafletjs.com | 2026-09-19 | Map library (vendored in `site/vendor/leaflet/`) | ✅ BSD-2 license. No online map tiles used. |
