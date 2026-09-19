// map.js — draws NYC neighborhoods with Leaflet. No online map tiles: works offline.

window.NycMap = (function () {
  const FILL = { safe: "#8ccf96", moderate: "#ffd166", dangerous: "#e4572e", none: "#dcdcdc" };
  const openMaps = [];
  const savedViews = {}; // remember zoom/position per map so redraws don't jump

  // Call before drawing a new page.
  function clearAll() {
    while (openMaps.length) openMaps.pop().remove();
  }

  // el: container element
  // opts.key: name for remembering the view
  // opts.bandFor(props) → band object or null (grey)
  // opts.popupFor(props) → HTML shown when a neighborhood is clicked
  // opts.markers: [{ lat, lon, band, label, popup }]
  function draw(el, opts) {
    const data = State.getData();
    const map = L.map(el, { zoomSnap: 0.25, minZoom: 9, maxZoom: 15, scrollWheelZoom: false });
    openMaps.push(map);
    map.attributionControl.setPrefix(false).addAttribution("Boundaries: NYC DCP 2020 NTAs");

    const layer = L.geoJSON(data.neighborhoods, {
      style: (f) => {
        const band = opts.bandFor(f.properties);
        return { color: "#ffffff", weight: 0.8, fillColor: band ? FILL[band.id] : FILL.none, fillOpacity: opts.fillOpacity || 0.9 };
      },
      onEachFeature: (f, lyr) => {
        const band = opts.bandFor(f.properties);
        lyr.bindTooltip(`<strong>${UI.esc(f.properties.name)}</strong><br>${band ? band.icon + " " + band.label : "No data"}`, { sticky: true });
        lyr.bindPopup(opts.popupFor(f.properties), { maxWidth: 280 });
        lyr.on("mouseover", () => lyr.setStyle({ weight: 2.5, color: "#222" }));
        lyr.on("mouseout", () => layer.resetStyle(lyr));
      },
    }).addTo(map);

    const placed = []; // pins close together get stacked downward so none are hidden
    (opts.markers || []).forEach((m) => {
      const n = placed.filter((q) => Math.abs(q.lat - m.lat) < 0.03 && Math.abs(q.lon - m.lon) < 0.05).length;
      placed.push(m);
      const icon = L.divIcon({
        className: "",
        html: `<div class="map-pin band-${m.band ? m.band.id : "none"}" style="margin-top:${n * 30}px"><span aria-hidden="true">${m.band ? m.band.icon : "?"}</span> ${UI.esc(m.label)}</div>`,
        iconSize: null,
      });
      const marker = L.marker([m.lat, m.lon], { icon, keyboard: true, title: m.label }).addTo(map);
      if (m.popup) marker.bindPopup(m.popup);
    });

    const saved = savedViews[opts.key];
    if (saved) map.setView(saved.center, saved.zoom);
    else map.fitBounds(layer.getBounds(), { padding: [8, 8] });
    map.on("moveend", () => (savedViews[opts.key] = { center: map.getCenter(), zoom: map.getZoom() }));
    return map;
  }

  // Marker position for a saved place: its own lat/lon, or the neighborhood center.
  function placeLatLon(loc) {
    if (loc.lat && loc.lon) return [loc.lat, loc.lon];
    return State.place(loc.nta_id).centroid || [40.73, -73.95];
  }

  return { draw, clearAll, placeLatLon, FILL };
})();
