// Patient pages: #/patient/:id (home) and #/patient/:id/meds

(function () {
  const esc = UI.esc;
  let reportOpen = false; // is the "report to care team" form showing?

  const SYMPTOMS = ["Dizzy or light-headed", "Headache", "Nausea or vomiting", "Very tired or weak", "Muscle cramps", "Confused", "Fast heartbeat", "Shaking more than usual"];

  function statusText(alert) {
    if (!alert) return "";
    const s = alert.status === "new" ? "Waiting for your care team to see it" : Alerts.STATUS_TEXT[alert.status];
    return `<p class="alert-status"><strong>Status:</strong> ${esc(s)}</p>`;
  }

  function reportForm() {
    return `
      <form class="report-form" id="report-form">
        <fieldset><legend>How do you feel? (optional)</legend>
          <div class="checks">${SYMPTOMS.map((s) => `<label><input type="checkbox" name="sym" value="${esc(s)}"> ${esc(s)}</label>`).join("")}</div>
        </fieldset>
        <label class="field">Anything else? (optional)<textarea name="note" rows="2" placeholder="For example: my apartment is very hot"></textarea></label>
        <div class="row"><button class="button" type="submit">Send to my care team</button><button class="button button-ghost" type="button" data-action="cancel-report">Cancel</button></div>
      </form>`;
  }

  // The yellow / red warning box (PLAN.md §4).
  function alertArea(p, sit, tips, team) {
    const level = sit.risk.alertLevel;
    if (level === "none") return "";
    const tipList = (list) => `<ul>${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    const reportButton = sit.alert
      ? `<p class="sent">✓ Sent to your care team at ${esc(sit.alert.createdAt)}.</p>${statusText(sit.alert)}`
      : reportOpen ? reportForm()
      : `<button class="button" data-action="open-report">Report to my care team</button>`;

    if (level === "yellow") {
      return `<div class="alert-box alert-yellow" role="alert">
        <h2><span aria-hidden="true">!</span> Yellow warning: take care in the heat</h2>
        <p>This place is riskier for you than for most people today. You can tell your care team if you want to. It's your choice.</p>
        ${tipList(tips.general)}
        ${reportButton}
      </div>`;
    }
    // Red
    if (sit.consent) {
      return `<div class="alert-box alert-red" role="alert">
        <h2><span aria-hidden="true">⚠</span> Red warning: your care team has been notified</h2>
        <p>This place is dangerous for you right now. Because you agreed to share red alerts, we told <strong>${esc(team.display_name)}</strong> automatically.</p>
        ${tipList(tips.urgent)}
        <p>Care team phone: <a href="tel:${esc(team.phone)}"><strong>${esc(team.phone)}</strong></a></p>
        ${statusText(sit.alert)}
      </div>`;
    }
    return `<div class="alert-box alert-red" role="alert">
      <h2><span aria-hidden="true">⚠</span> Red warning: this is dangerous for you</h2>
      <p>You chose <strong>not</strong> to share alerts automatically, so your care team does not know yet. <strong>We strongly recommend telling them now.</strong></p>
      ${tipList(tips.urgent)}
      ${reportButton}
    </div>`;
  }

  function home(app, { id }) {
    const data = State.getData();
    const p = State.patient(id);
    const ep = State.episode();
    const sit = Alerts.situation(p);
    const place = State.place(sit.loc.nta_id);
    const tips = data.tips;
    const team = data.careTeam;
    const band = sit.risk.band;

    const places = p.locations
      .map((l) => ({ l, r: Scoring.personal(p, l.nta_id, ep) }))
      .sort((a, b) => (b.r.bandIndex ?? -1) - (a.r.bandIndex ?? -1));

    app.innerHTML = `
      <section class="page">
        ${UI.placeholderBanner()}
        <div class="page-head">
          <div>
            <p class="eyebrow">Your heat safety · ${UI.synthBadge()}</p>
            <h1>Hi, ${esc(p.display_name.split(" ")[0])}</h1>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div class="status-card band-${band ? band.id : "none"}">
              <div class="status-icon" aria-hidden="true">${band ? band.icon : "–"}</div>
              <div>
                <p class="status-label">${band ? band.label : "No data"} for you</p>
                <p>at <strong>${esc(sit.loc.label)}</strong> (${esc(place.name)}) · ${esc(ep.label)}, ${ep.tmax}°F</p>
              </div>
            </div>
            <details class="card why-card" open>
              <summary><strong>Why this color?</strong></summary>
              <ul class="why">${sit.risk.reasons.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            </details>
            <div class="card">
              <p class="small muted">Demo: pretend you are at…</p>
              <div class="chip-row">
                ${p.locations.map((l) => `<button class="chip ${l.id === sit.loc.id ? "chip-on" : ""}" data-action="move" data-arg="${l.id}" aria-pressed="${l.id === sit.loc.id}">${esc(l.label)}</button>`).join("")}
              </div>
            </div>
          </div>
          <div>
            ${alertArea(p, sit, tips, team)}
            <p class="consent-line">🔒 ${p.consent.share_red_alerts_with_care_team
              ? `You agreed (${esc(p.consent.date)}) that <strong>red</strong> alerts are shared with your care team automatically. Shared: your name, neighborhood, risk color, the reasons, and your heat-risk medicine types. Nothing else.`
              : `You chose <strong>not</strong> to share red alerts automatically. You can still report to your care team yourself.`}</p>
          </div>
        </div>

        <h2>Your personal heat map</h2>
        <p class="muted">Colors show how risky each neighborhood would be <em>for you</em> during this episode, based on your medicines and health. Your places are pinned.</p>
        <div class="grid-map">
          <div class="card map-card">
            <div id="patient-map" class="map" role="img" aria-label="Map of NYC colored by your personal heat risk. The list beside it ranks your places."></div>
            ${UI.legend()}
          </div>
          <aside class="card">
            <h2 class="h3">Risky places for you</h2>
            <ol class="rank-list">
              ${places.map(({ l, r }) => `<li><span class="rank-name">${esc(l.label)}<small>${esc(State.place(l.nta_id).name)}</small></span>${UI.bandPill(r.band)}</li>`).join("")}
            </ol>
            <p class="small"><a href="#/patient/${p.id}/meds">My medicines and heat →</a></p>
          </aside>
        </div>

        <div class="grid-2">
          <div class="card">
            <h2 class="h3">Staying safe in the heat</h2>
            <ul>${tips.general.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
          <div class="card">
            <h2 class="h3">Help and resources</h2>
            <ul>${tips.resources.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></li>`).join("")}
              <li>Your care team: <a href="tel:${esc(team.phone)}">${esc(team.phone)}</a></li>
              <li>Emergency: call <strong>911</strong></li></ul>
          </div>
        </div>
        <p class="disclaimer">${esc(tips.disclaimer)}</p>
      </section>`;

    NycMap.draw(document.getElementById("patient-map"), {
      key: "patient-" + p.id,
      bandFor: (n) => { const r = Scoring.personal(p, n.id, ep); return r.hasData ? r.band : null; },
      popupFor: (n) => {
        const r = Scoring.personal(p, n.id, ep);
        return `<strong>${esc(n.name)}</strong><br>${r.hasData ? `For you: ${UI.bandPill(r.band)}<ul class="why">${r.reasons.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : esc(r.reasons[0])}`;
      },
      markers: p.locations.map((l, i) => {
        const [lat, lon] = NycMap.placeLatLon(l);
        const r = Scoring.personal(p, l.nta_id, ep);
        return { lat, lon, band: r.band, label: l.label + (l.id === sit.loc.id ? " (you)" : ""), popup: `<strong>${esc(l.label)}</strong><br>${esc(l.address || "")}` };
      }),
    });

    UI.onActions(app, {
      move: (locId) => { reportOpen = false; UI.setLocation(p.id, locId); },
      "open-report": () => { reportOpen = true; home(app, { id }); },
      "cancel-report": () => { reportOpen = false; home(app, { id }); },
    });
    const form = document.getElementById("report-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const symptoms = [...form.querySelectorAll("input[name=sym]:checked")].map((c) => c.value);
        reportOpen = false;
        Alerts.submitReport(p, symptoms, form.note.value);
      };
    }
  }

  function meds(app, { id }) {
    const p = State.patient(id);
    const hm = Scoring.heatMeds(p);
    const ruleFor = (med) => (hm.find((x) => x.med === med) || {}).rule;
    app.innerHTML = `
      <section class="page narrow">
        <p class="eyebrow">${UI.synthBadge()}</p>
        <h1>My medicines and heat</h1>
        ${UI.unreviewedBanner(hm.map((x) => x.rule))}
        <ul class="med-list">
          ${p.medications.map((m) => {
            const r = ruleFor(m);
            return `<li class="card">
              <div class="row-between"><h2 class="h3">${esc(m.name)}</h2>${r ? `<span class="pill band-moderate"><span aria-hidden="true">!</span> Heat note</span>` : `<span class="pill band-safe"><span aria-hidden="true">✓</span> No heat rule</span>`}</div>
              <p class="muted">${esc(m.dose)}</p>
              ${r ? `<p>${esc(r.patient_advice)}</p>` : ""}
            </li>`;
          }).join("")}
        </ul>
        <p class="disclaimer">Never stop or change a medicine on your own. Talk to your care team first.</p>
        <p><a href="#/patient/${p.id}">← Back to my status</a></p>
      </section>`;
  }

  Router.add("/patient/:id", home, "patient");
  Router.add("/patient/:id/meds", meds, "patient");
})();
