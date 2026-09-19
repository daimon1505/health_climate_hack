// state.js — one place that remembers what's going on in the demo:
// who is signed in, which heat episode is selected, where each patient is, and the alerts.
// Saved to sessionStorage so a page reload keeps the demo (closing the tab clears it).
// No localStorage, no cookies (PLAN.md §4).

window.State = (function () {
  const KEY = "heatsafe-demo-v1";
  const listeners = [];
  let data = null; // loaded data files (read-only)
  let s = null; // the changeable demo state

  function fresh() {
    const locations = {};
    data.patients.forEach((p) => (locations[p.id] = p.current_location_id));
    return {
      account: null, // { type: "patient", id } or { type: "care" }
      episodeId: data.episodes.episodes[1].id,
      locations,
      alerts: [],
    };
  }

  function init(loaded) {
    data = loaded;
    s = fresh();
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY));
      if (saved) s = { ...s, ...saved };
    } catch (e) { /* storage blocked — start fresh */ }
  }

  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  function get() { return s; }
  function getData() { return data; }

  // Change state, save it, and tell the page to redraw.
  function set(patch) {
    Object.assign(s, patch);
    save();
    listeners.forEach((fn) => fn());
  }

  function subscribe(fn) { listeners.push(fn); }

  function reset() {
    const account = s.account;
    s = fresh();
    s.account = account;
    set({});
  }

  // Handy lookups
  const patient = (id) => data.patients.find((p) => p.id === id);
  const episode = () => data.episodes.episodes.find((e) => e.id === s.episodeId);
  const currentLocation = (p) => p.locations.find((l) => l.id === s.locations[p.id]) || p.locations[0];
  const place = (ntaId) => data.neighborhoodById[ntaId] || { name: ntaId, borough: "" };

  return { init, get, getData, set, save, subscribe, reset, patient, episode, currentLocation, place };
})();
