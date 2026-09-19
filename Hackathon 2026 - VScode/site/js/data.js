// data.js — loads everything in data/processed/.
// On a web server it reads the JSON files. When index.html is double-clicked (file://),
// browsers block that, so it uses js/data_bundle.js instead (made by scripts/bundle_data.py).

window.Data = (function () {
  const PATIENT_IDS = ["patient1", "patient2", "patient3"];
  const FILES = {
    neighborhoods: "neighborhoods.geojson",
    metrics: "neighborhood_metrics.json",
    episodes: "episodes.json",
    medRules: "med_rules.json",
    tips: "tips.json",
    careTeam: "care_team.json",
    validation: "validation.json",
  };

  async function readFile(name) {
    if (location.protocol === "file:") {
      if (!window.DATA_BUNDLE || !window.DATA_BUNDLE[name]) throw new Error(`Missing ${name} in data_bundle.js — run: python3 scripts/bundle_data.py`);
      return window.DATA_BUNDLE[name];
    }
    const res = await fetch(`../data/processed/${name}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load ${name} (${res.status})`);
    return res.json();
  }

  async function load() {
    const data = {};
    await Promise.all(Object.entries(FILES).map(async ([key, file]) => (data[key] = await readFile(file))));
    data.patients = await Promise.all(PATIENT_IDS.map((id) => readFile(`patients/${id}.json`)));
    data.neighborhoodById = {};
    data.neighborhoods.features.forEach((f) => (data.neighborhoodById[f.properties.id] = f.properties));
    return data;
  }

  return { load };
})();
