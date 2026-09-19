// Care-team home (#/care) — alert inbox, patient list, patient locations map.

(function () {
  const esc = UI.esc;
  const showPhone = new Set(); // alerts where "Call patient" was clicked
  const STATUS_LABEL = { new: "New", acknowledged: "Acknowledged", contacted: "Contacted", resolved: "Resolved" };

  function alertCard(a) {
    const p = State.patient(a.patientId);
    const phone = p.chart.demographics.phone;
    const typeLabel = a.type === "auto_red" ? "Auto-sent (red)" : "Patient-reported";
    const levelIcon = a.level === "red" ? "⚠" : "!";
    return `
      <li class="inbox-item level-${a.level} ${a.status === "resolved" ? "is-resolved" : ""}">
        <div class="row-between">
          <div>
            <span class="pill level-pill-${a.level}"><span aria-hidden="true">${levelIcon}</span> ${a.level === "red" ? "Red" : "Yellow"}</span>
            <span class="tag">${typeLabel}</span>
            <span class="tag status-${a.status}">${STATUS_LABEL[a.status]}</span>
          </div>
          <span class="muted small">${esc(a.createdAt)}</span>
        </div>
        <h3><a href="#/care/patient/${p.id}">${esc(p.display_name)}</a> <span class="muted small">at ${esc(a.locationLabel)} — ${esc(a.neighborhood)}</span></h3>
        <p class="small muted">${esc(a.episodeLabel)}</p>
        <details><summary>Why (rules that fired)</summary><ul class="why">${a.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></details>
        ${a.heatMedClasses.length ? `<p class="small"><strong>Heat-risk medicines:</strong> ${a.heatMedClasses.map(esc).join(", ")}</p>` : ""}
        ${a.symptoms.length ? `<p class="small"><strong>Patient says:</strong> ${a.symptoms.map(esc).join(", ")}</p>` : ""}
        ${a.note ? `<p class="small"><strong>Patient note:</strong> “${esc(a.note)}”</p>` : ""}
        ${a.notes.length ? `<ul class="notes">${a.notes.map((n) => `<li><span class="muted small">${esc(n.at)}</span> ${esc(n.text)}</li>`).join("")}</ul>` : ""}
        ${showPhone.has(a.id) ? `<p class="phone-box">📞 Call <strong>${esc(p.display_name)}</strong>: <a href="tel:${esc(phone)}">${esc(phone)}</a> · Proxy: ${esc(p.chart.healthcare_proxy.name)} ${esc(p.chart.healthcare_proxy.phone)}</p>` : ""}
        <div class="action-row">
          <button class="button button-small" data-action="ack" data-arg="${a.id}" ${a.status !== "new" ? "disabled" : ""}>Acknowledge</button>
          <button class="button button-small button-ghost" data-action="call" data-arg="${a.id}">Call patient</button>
          <button class="button button-small button-ghost" data-action="contacted" data-arg="${a.id}" ${a.status === "contacted" || a.status === "resolved" ? "disabled" : ""}>Mark contacted</button>
          <button class="button button-small button-ghost" data-action="resolve" data-arg="${a.id}" ${a.status === "resolved" ? "disabled" : ""}>Resolve</button>
        </div>
        <form class="note-form" data-alert="${a.id}"><label class="visually-hidden" for="note-${a.id}">Add note</label>
          <input id="note-${a.id}" name="note" placeholder="Add a note…"><button class="button button-small button-ghost">Add note</button></form>
      </li>`;
  }

  Router.add("/care", (app) => {
    const data = State.getData();
    const alerts = State.get().alerts;
    const open = alerts.filter((a) => a.status !== "resolved");
    const done = alerts.filter((a) => a.status === "resolved");
    const ep = State.episode();

    const rows = data.patients
      .map((p) => ({ p, sit: Alerts.situation(p) }))
      .sort((a, b) => (b.sit.risk.bandIndex ?? -1) - (a.sit.risk.bandIndex ?? -1));

    app.innerHTML = `
      <section class="page">
        ${UI.placeholderBanner()}
        <div class="page-head">
          <div>
            <p class="eyebrow">${esc(data.careTeam.display_name)} · ${UI.synthBadge()}</p>
            <h1>Heat alert inbox</h1>
            <p class="lead">${esc(ep.label)}, ${ep.tmax}°F · <strong>${open.length}</strong> open alert${open.length === 1 ? "" : "s"}</p>
          </div>
          <button class="button button-ghost" data-action="controls">⚙ Simulate patient locations</button>
        </div>

        <div class="grid-2 grid-care">
          <div>
            ${open.length ? `<ul class="inbox">${open.map(alertCard).join("")}</ul>`
              : `<div class="card empty">No open alerts. Red alerts appear here automatically. Yellow ones appear only when a patient reports.</div>`}
            ${done.length ? `<details class="card"><summary>Resolved (${done.length})</summary><ul class="inbox">${done.map(alertCard).join("")}</ul></details>` : ""}
          </div>
          <div>
            <div class="card">
              <h2 class="h3">Patients by current risk</h2>
              <ul class="patient-list">
                ${rows.map(({ p, sit }) => `
                  <li><a href="#/care/patient/${p.id}" class="patient-row">
                    <span class="avatar">${esc(UI.initials(p.display_name))}</span>
                    <span class="grow"><strong>${esc(p.display_name)}</strong><br><span class="small muted">${esc(sit.loc.label)} · ${esc(State.place(sit.loc.nta_id).name)}</span></span>
                    ${UI.bandPill(sit.risk.band)}
                  </a></li>`).join("")}
              </ul>
            </div>
            <div class="card map-card">
              <h2 class="h3">Where patients are now</h2>
              <p class="small muted">Only the care team can see this map. Pin color = personal risk. Areas = risk for everyone.</p>
              <div id="care-map" class="map map-short" role="img" aria-label="Map of patient locations. The patient list above gives the same information."></div>
              ${UI.legend()}
            </div>
          </div>
        </div>
      </section>`;

    NycMap.draw(document.getElementById("care-map"), {
      key: "care",
      fillOpacity: 0.45,
      bandFor: (n) => { const r = Scoring.neighborhood(n.id, ep); return r.hasData ? r.band : null; },
      popupFor: (n) => `<strong>${esc(n.name)}</strong>`,
      markers: rows.map(({ p, sit }, i) => {
        const [lat, lon] = NycMap.placeLatLon(sit.loc);
        return { lat, lon, band: sit.risk.band, label: p.display_name.split(" ")[0], popup: `<a href="#/care/patient/${p.id}">${esc(p.display_name)}</a><br>${esc(sit.loc.label)}` };
      }),
    });

    UI.onActions(app, {
      controls: () => UI.toggleDrawer(true),
      ack: (id) => Alerts.setStatus(id, "acknowledged"),
      contacted: (id) => Alerts.setStatus(id, "contacted"),
      resolve: (id) => Alerts.setStatus(id, "resolved"),
      call: (id) => { showPhone.has(id) ? showPhone.delete(id) : showPhone.add(id); Router.render(); },
    });
    app.querySelectorAll(".note-form").forEach((f) => {
      f.onsubmit = (e) => { e.preventDefault(); Alerts.addNote(f.dataset.alert, f.note.value); };
    });
  }, "care");
})();
