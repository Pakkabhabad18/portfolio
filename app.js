/* ==========================================================================
   app.js — draws the metro map and runs everything that moves.
   Plain JavaScript, no libraries, so it keeps working on GitHub Pages.

     1. Helpers
     2. The metro map (tracks, stations, trains, hover card, line filter)
     3. Arrivals board (with split-flap letters)
     4. Story player for the Spotify case study
     5. Slide viewer
     6. Station panel (details) and links like #station-trialguide
     7. Search, copy email, scroll effects
   ========================================================================== */
{
  /* ------------------------------------------------------------------
     1. Helpers
     ------------------------------------------------------------------ */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Make an SVG element with attributes
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  // Escape text before it goes into HTML strings
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bullets = lines => lines.map(l => `<b class="bul ${l}">${l}</b>`).join("");
  const isExternal = url => /^https?:/.test(url);
  const statusWord = s => s.status === "ongoing" ? "Running" : s.status === "recent" ? "Arrived" : "Departed";
  const kindWord = s => ({ project: "Project", work: "Job", study: "Study", milestone: "Milestone", next: "Next stop" }[s.kind]);

  /* ------------------------------------------------------------------
     2. The metro map
     ------------------------------------------------------------------ */
  const svg = $("#metro");
  const gGrid = el("g", { class: "ghost-grid" }, svg);
  const gTracks = el("g", {}, svg);
  const gPin = el("g", { class: "here-pin" }, svg);
  const gTrains = el("g", {}, svg);
  const gStations = el("g", {}, svg);
  const gEra = el("g", { class: "era" }, svg);

  // Faint grid, like the squares under a printed map
  for (let x = 0; x <= 1700; x += 50) el("line", { x1: x, y1: 0, x2: x, y2: 840 }, gGrid);
  for (let y = 0; y <= 840; y += 50) el("line", { x1: 0, y1: y, x2: 1700, y2: y }, gGrid);

  // Tracks: solid for what has happened, dotted for what is still being built
  const trackEls = {};
  const solidPaths = {};
  for (const [code, lp] of Object.entries(LINE_PATHS)) {
    const d = pts => "M" + pts.map(p => p.join(" ")).join(" L");
    const colour = LINES[code].colour;
    const solid = el("path", { d: d(lp.path), class: "trk", stroke: colour, "data-line": code }, gTracks);
    const fut = el("path", { d: d(lp.future), class: "trk fut", stroke: colour, "data-line": code }, gTracks);
    trackEls[code] = [solid, fut];
    solidPaths[code] = solid;
  }

  // "You are here" marker at November 2026
  el("line", { x1: 1447, y1: 150, x2: 1447, y2: 690 }, gPin);
  const here = el("text", { x: 1454, y: 712 }, gPin);
  here.textContent = "you are here (Nov 2026)";

  // Rough dates along the bottom so the map reads left to right in time
  [[60, "2019"], [660, "Aug 2025"], [880, "Jan 2026"], [1200, "Aug 2026"], [1600, "2027"]].forEach(([x, t]) => {
    const tx = el("text", { x, y: 828, "text-anchor": x === 60 ? "start" : "middle" }, gEra);
    tx.textContent = t;
  });

  // Stations
  const stationEls = {};
  STATIONS.forEach(s => {
    const g = el("g", { class: `stn ${s.status}`, tabindex: 0, role: "button", "aria-label": `${s.title}, ${s.when}`, "data-id": s.id }, gStations);
    const multi = s.lines.length > 1;
    if (s.y2) {
      // Interchange drawn as a long pill joining stacked lines
      el("rect", { x: s.x - 13, y: s.y - 13, width: 26, height: s.y2 - s.y + 26, rx: 13, class: "ix", ...(s.kind === "next" ? { "stroke-dasharray": "6 6" } : {}) }, g);
    } else if (multi) {
      el("circle", { cx: s.x, cy: s.y, r: 11, class: "ix" }, g);
    } else {
      if (s.status === "ongoing") el("circle", { cx: s.x, cy: s.y, r: 9, class: "ring", stroke: LINES[s.lines[0]].colour }, g);
      el("circle", { cx: s.x, cy: s.y, r: 8.5, class: "dot", stroke: LINES[s.lines[0]].colour }, g);
    }
    // Name: slanted above or below the line, like on a real metro map
    const bottom = s.y2 || s.y;
    const t = el("text", {}, g);
    t.textContent = s.title;
    if (s.label === "up") t.setAttribute("transform", `translate(${s.x + 6} ${s.y - 22}) rotate(-38)`);
    else if (s.label === "down") t.setAttribute("transform", `translate(${s.x + 6} ${bottom + 26}) rotate(38)`);
    else { t.setAttribute("x", s.x); t.setAttribute("y", bottom + 44); t.setAttribute("text-anchor", "middle"); t.style.fontSize = "22px"; t.style.fontWeight = 900; }
    // Bigger invisible target so stations are easy to hover
    el("rect", { x: s.x - 22, y: s.y - 22, width: 44, height: bottom - s.y + 44, fill: "transparent" }, g);
    stationEls[s.id] = g;

    g.addEventListener("mouseenter", () => showPop(s));
    g.addEventListener("mouseleave", hidePop);
    g.addEventListener("focus", () => showPop(s));
    g.addEventListener("blur", hidePop);
    g.addEventListener("click", () => openPanel(s.id));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPanel(s.id); } });
  });

  // Little trains running along each line
  const trains = Object.entries(solidPaths).map(([code, path], k) => {
    const g = el("g", { class: "train" }, gTrains);
    el("rect", { x: -13, y: -6, width: 26, height: 12, rx: 6, fill: LINES[code].colour, stroke: "#fff", "stroke-width": 2.5 }, g);
    el("rect", { x: 4, y: -3, width: 5, height: 6, rx: 1.5, fill: "#fff", opacity: .9 }, g);
    return { g, path, len: path.getTotalLength(), t: k * 0.23 };
  });
  let mapVisible = true, last = performance.now();
  function runTrains(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (mapVisible) trains.forEach(tr => {
      tr.t = (tr.t + dt * 70 / tr.len) % 1.15;            // 70 units a second, then a short wait
      const d = Math.min(tr.t, 1) * tr.len;
      const p = tr.path.getPointAtLength(d), q = tr.path.getPointAtLength(Math.min(tr.len, d + 1));
      const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      tr.g.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${ang})`);
      tr.g.style.opacity = tr.t > 1 ? 0 : 1;
    });
    requestAnimationFrame(runTrains);
  }
  if (!reduce) {
    new IntersectionObserver(([e]) => { mapVisible = e.isIntersecting; }).observe(svg);
    requestAnimationFrame(runTrains);
  } else trains.forEach(tr => tr.g.remove());

  // Hover card next to a station
  const pop = $("#pop"), frame = $(".map-frame");
  function showPop(s) {
    if (matchMedia("(max-width: 900px)").matches) return;
    Object.values(stationEls).forEach(g => g.classList.remove("hot"));
    stationEls[s.id].classList.add("hot");
    pop.innerHTML = `
      <div class="pop-top">${bullets(s.lines)}<span>${esc(s.title)}</span></div>
      <div class="pop-in"><span class="pop-meta">${esc(kindWord(s))}&ensp;·&ensp;${esc(s.when)}</span>${esc(s.short)}
      <span class="pop-go">${s.kind === "next" ? "Get in touch →" : "Click to open the station →"}</span></div>`;
    const r = svg.getBoundingClientRect(), f = frame.getBoundingClientRect(), k = r.width / 1700;
    const sx = r.left - f.left + s.x * k, sy = r.top - f.top + s.y * k;
    const left = sx + 300 + 24 < f.width ? sx + 24 : sx - 300 - 24;
    pop.style.left = left + "px";
    pop.style.top = Math.max(10, Math.min(sy - 30, f.height - 200)) + "px";
    pop.classList.add("show");
  }
  function hidePop() { pop.classList.remove("show"); Object.values(stationEls).forEach(g => g.classList.remove("hot")); }

  // Legend: click a line to see only that line; click again to see all
  let onlyLine = null;
  $$(".legend button").forEach(b => b.addEventListener("click", () => {
    onlyLine = onlyLine === b.dataset.line ? null : b.dataset.line;
    $$(".legend button").forEach(x => x.classList.toggle("off", !!onlyLine && x.dataset.line !== onlyLine));
    Object.entries(trackEls).forEach(([code, els]) => els.forEach(e => e.classList.toggle("dim", !!onlyLine && code !== onlyLine)));
    STATIONS.forEach(s => stationEls[s.id].classList.toggle("dim", !!onlyLine && !s.lines.includes(onlyLine)));
  }));

  // On phones the map scrolls sideways: start at the newest work, on the right
  const ms = $("#mapScroll");
  if (ms.scrollWidth > ms.clientWidth) ms.scrollLeft = ms.scrollWidth - ms.clientWidth;

  // All stations except the last stop, ongoing first, then newest first.
  // Used for next/previous in the panel and for search.
  const boardList = STATIONS.filter(s => s.kind !== "next")
    .sort((a, b) => (a.status === "ongoing" ? -1 : 0) - (b.status === "ongoing" ? -1 : 0) || b.sort.localeCompare(a.sort));

  /* ------------------------------------------------------------------
     4. Story player (tap right = next, tap left = back, hold = pause)
     ------------------------------------------------------------------ */
  const DECKS = {
    case: [
      { bg: "bg-green", html: `<span class="eyebrow">Product case study</span><h4>Impact of Spotify Wrapped</h4><p>Wrapped is predictable (it comes once a year) and organic (it spreads because people share it).</p><span class="foot">by Prakash Bhabad · tap to continue →</span>` },
      { bg: "bg-ink", html: `<span class="eyebrow">The problem</span><h4>Most products lose attention, then pay to rent it back.</h4><div class="stack"><div class="row"><b>01</b>Novelty wears off and usage leaks away</div><div class="row"><b>02</b>Getting new users costs more every year</div><div class="row"><b>03</b>Growth leans on ads and push notifications</div></div>` },
      { bg: "bg-violet", html: `<span class="eyebrow">The question</span><p class="quote">How does a once-a-year feature drive huge engagement without constant nudging?</p>` },
      { bg: "bg-blue", html: `<span class="eyebrow">Two different machines</span><h4>Engagement is not virality.</h4><div class="split"><div><h5>Engagement</h5>Inside the app. Runs on curiosity. Keeps people. Spotify controls it.</div><div><h5>Virality</h5>Outside the app. Runs on identity. Brings new people. Users control it.</div></div>` },
      { bg: "bg-ink", html: `<span class="eyebrow">A system, not a feature</span><h4>Four layers, each feeding the next.</h4><div class="stack"><div class="row"><b>04</b>Social: other apps do the distribution</div><div class="row"><b>03</b>UX: cards made to be screenshotted</div><div class="row"><b>02</b>Narrative: your data told as your story</div><div class="row"><b>01</b>Data: a full year of listening</div></div>` },
      { bg: "bg-green", id: "chain", html: `<span class="eyebrow">Design → behaviour → outcome</span><h4>Five choices, five outcomes.</h4><div class="stack"><div class="row" data-i="0"><b>01</b>Annual release → day-one spike</div><div class="row" data-i="1"><b>02</b>Personal insights → deep exploration</div><div class="row" data-i="2"><b>03</b>Story framing → memory</div><div class="row" data-i="3"><b>04</b>Share-ready cards → free reach</div><div class="row" data-i="4"><b>05</b>Comparison hooks → conversation loops</div></div>` },
      { bg: "bg-pink", html: `<span class="eyebrow">Why people share it</span><div class="big sm">Identity.</div><p>Wrapped says who you are. It signals taste, invites comparison, and feels safe to post because everyone else is posting too.</p><p><b>Identity spreads a product better than rewards do.</b></p>` },
      { bg: "bg-amber", html: `<span class="eyebrow">Where it stops working</span><h4>Don't copy it blindly.</h4><div class="split"><div><h5>Works for</h5>Expressive consumer products, months of personal data, low-risk sharing.</div><div><h5>Fails for</h5>Most B2B tools, dull utilities, young products with thin data, health and money data.</div></div>` },
      { bg: "bg-green", html: `<span class="eyebrow">The takeaway</span><p class="quote">Wrapped doesn't chase attention. It earns it by reflecting users back to themselves.</p><span class="foot">all 13 slides are on this page</span>` },
    ],
    mine: [
      { bg: "bg-red", html: `<span class="eyebrow">Prakash, 2025–26</span><div class="big sm">Wrapped</div><p>A year and a half of projects, played back the way Spotify would do it.</p><span class="foot">tap to continue →</span>` },
      { bg: "bg-violet", html: `<span class="eyebrow">Your top genre</span><div class="big sm">Health AI</div><p>An AI stethoscope at Anjani. TrialGuide for clinical trials. NourishCart for nutrition. StayFit for calories.</p>` },
      { bg: "bg-lime", html: `<span class="eyebrow">Most repeated move</span><div class="big">441</div><p>checks written for NourishCart's AI features, plus 107 hand-labelled test cases. 95.9% passed.</p>` },
      { bg: "bg-blue", html: `<span class="eyebrow">Biggest number</span><div class="big sm">40,000+</div><p>heart and lung recordings planned with 5 hospital partners, starting with NIMS Hyderabad.</p>` },
      { bg: "bg-pink", html: `<span class="eyebrow">Plot twist</span><h4>Our own hypothesis lost.</h4><p>We expected celebrity ads to win. They came last: p = 0.009 against creative ads.</p><p>Story and price did the work.</p>` },
      { bg: "bg-ink", html: `<span class="eyebrow">Built from scratch. Twice.</span><div class="big sm">24.9M</div><p>parameters in each of two language models, Marathi and Konkani. My own tokenizers, my own training loop.</p>` },
      { bg: "bg-green", html: `<span class="eyebrow">You listened to</span><div class="big">100</div><p>people testing NourishCart. Their confusion turned a long typed form into a spoken chat.</p>` },
      { bg: "bg-amber", html: `<span class="eyebrow">Safety bar held</span><div class="big">3.9%</div><p>harmful guesses in TrialGuide, under the 5% limit fixed before anything was tuned.</p>` },
      { bg: "bg-red", html: `<span class="eyebrow">On repeat right now</span><h4>DriverOS and card fraud research.</h4><p>Both are under construction, a little further down.</p><button class="cta" data-share>Copy link to this site</button>` },
    ],
  };

  const story = (() => {
    const root = $("#story"), bars = $(".story-bars", root), stage = $(".story-stage", root);
    const DUR = 5600;
    let deck = "case", i = 0, t0 = 0, elapsed = 0, paused = false, visible = false, holdT = 0, held = false;
    function load(name) {
      deck = name;
      bars.innerHTML = DECKS[name].map(() => "<span><i></i></span>").join("");
      stage.innerHTML = DECKS[name].map(c => `<div class="card ${c.bg}">${c.html}</div>`).join("");
      show(0);
    }
    function show(n) {
      const cards = $$(".card", stage), segs = $$("i", bars);
      i = (n + cards.length) % cards.length; elapsed = 0;
      cards.forEach((c, k) => c.classList.toggle("on", k === i));
      segs.forEach((s, k) => { s.style.width = k < i ? "100%" : "0%"; });
    }
    function tick(now) {
      if (visible && !paused && !document.hidden) {
        elapsed += now - t0;
        const seg = $$("i", bars)[i];
        if (seg) seg.style.width = Math.min(100, elapsed / DUR * 100) + "%";
        if (elapsed >= DUR) show(i + 1);
      }
      t0 = now; requestAnimationFrame(tick);
    }
    root.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; held = false; holdT = setTimeout(() => { held = true; paused = true; }, 220); });
    root.addEventListener("pointerup", e => {
      clearTimeout(holdT);
      if (e.target.closest("button")) return;
      if (held) { paused = false; return; }
      const r = root.getBoundingClientRect();
      show(e.clientX - r.left < r.width * 0.33 ? i - 1 : i + 1);
    });
    root.addEventListener("pointerleave", () => { clearTimeout(holdT); if (held) paused = false; });
    root.addEventListener("keydown", e => { if (e.key === "ArrowRight") show(i + 1); if (e.key === "ArrowLeft") show(i - 1); });
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-share]"); if (!b) return;
      navigator.clipboard?.writeText(location.href.split("#")[0]).then(() => { b.textContent = "Link copied ✓"; }, () => {});
    });
    $$(".story-switch button").forEach(b => b.addEventListener("click", () => {
      $$(".story-switch button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
      load(b.dataset.deck);
    }));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; t0 = performance.now(); }, { threshold: 0.4 }).observe(root);
    load("case"); requestAnimationFrame(tick);
    return {
      chain(k) {
        if (deck !== "case") $$(".story-switch button")[0].click();
        show(DECKS.case.findIndex(c => c.id === "chain")); paused = true;
        $$(".card.on .row", stage).forEach(r => r.classList.toggle("lit", +r.dataset.i === k));
      },
      resume() { paused = false; },
    };
  })();
  $$(".chain button").forEach(b => {
    const k = +b.dataset.k;
    b.addEventListener("mouseenter", () => { b.classList.add("lit"); story.chain(k); });
    b.addEventListener("mouseleave", () => { b.classList.remove("lit"); story.resume(); });
    b.addEventListener("click", () => story.chain(k));
  });

  /* ------------------------------------------------------------------
     5. Slide viewer
     ------------------------------------------------------------------ */
  const SLIDES = Array.from({ length: 13 }, (_, k) => `assets/slides/s-${String(k + 1).padStart(2, "0")}.jpg`);
  $("#slideStrip").innerHTML = SLIDES.map((src, k) => `<button data-k="${k}" aria-label="Open slide ${k + 1}"><img src="${src}" alt="Slide ${k + 1}" loading="lazy" /></button>`).join("");
  const lb = $("#lightbox"), lbImg = $("img", lb);
  let lbK = 0;
  const lbShow = k => { lbK = (k + SLIDES.length) % SLIDES.length; lbImg.src = SLIDES[lbK]; lbImg.alt = `Slide ${lbK + 1} of the Spotify Wrapped case study`; $(".lb-count", lb).textContent = `${lbK + 1} / ${SLIDES.length}`; };
  const lbClose = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };
  $("#slideStrip").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; lbShow(+b.dataset.k); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); });
  $(".lb-prev", lb).onclick = () => lbShow(lbK - 1);
  $(".lb-next", lb).onclick = () => lbShow(lbK + 1);
  $(".lb-close", lb).onclick = lbClose;
  lb.addEventListener("click", e => { if (e.target === lb) lbClose(); });

  /* ------------------------------------------------------------------
     6. Station panel
     ------------------------------------------------------------------ */
  const panel = $("#panel"), pBody = $(".panel-body", panel), scrim = $("#scrim");
  function openPanel(id) {
    const s = byId[id]; if (!s) return;
    if (s.kind === "next") { closePanel(); $("#contact").scrollIntoView({ behavior: "smooth" }); return; }
    hidePop();
    const k = boardList.indexOf(s);
    const prev = boardList[(k - 1 + boardList.length) % boardList.length], next = boardList[(k + 1) % boardList.length];
    const linkHTML = s.links.map(l => `<a href="${esc(l.url)}"${isExternal(l.url) ? ' target="_blank" rel="noopener"' : ""}><span>${esc(l.label)}</span><span>${isExternal(l.url) ? "↗" : "→"}</span></a>`).join("");
    pBody.innerHTML = `
      <div class="p-sign">
        <div class="row1">${bullets(s.lines)}<button class="close" aria-label="Close">×</button></div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.tag)}${s.role ? "&ensp;·&ensp;" + esc(s.role) : ""}</p>
      </div>
      <div class="p-strip">${s.lines.map(l => `<i style="background:${LINES[l].colour}"></i>`).join("")}</div>
      <div class="p-in">
        <div class="p-meta"><span>${esc(s.when)}</span><span class="${s.status}">${statusWord(s)}</span><span>${esc(kindWord(s))}</span><span>${s.lines.map(l => esc(LINES[l].name)).join(" + ")}</span></div>
        <p class="p-short">${esc(s.short)}</p>
        ${s.img ? `<figure class="p-img"><img src="${esc(s.img)}" alt="${esc(s.imgAlt || "")}" /></figure>` : ""}
        ${s.stats.length ? `<div class="p-stats">${s.stats.map(x => `<div><b>${esc(x.n)}</b><span>${esc(x.l)}</span></div>`).join("")}</div>` : ""}
        ${s.problem ? `<h4 class="p-h">${s.kind === "work" ? "The situation" : "Why it exists"}</h4><p>${esc(s.problem)}</p>` : ""}
        ${s.did.length ? `<h4 class="p-h">${s.status === "ongoing" && s.kind === "project" ? "What it will do" : "What I did"}</h4><ul class="p-list">${s.did.map(d => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
        ${s.stack.length ? `<h4 class="p-h">Tools and methods</h4><div class="p-tags">${s.stack.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        ${linkHTML ? `<div class="p-links">${linkHTML}</div>` : ""}
        <div class="p-nav">
          <button data-go="${prev.id}"><small>← previous</small>${esc(prev.title)}</button>
          <button data-go="${next.id}"><small>next →</small>${esc(next.title)}</button>
        </div>
      </div>`;
    panel.classList.add("open"); scrim.classList.add("on"); panel.setAttribute("aria-hidden", "false");
    panel.scrollTop = 0;
    history.replaceState(null, "", "#station-" + id);
    $(".close", pBody).focus({ preventScroll: true });
  }
  function closePanel() {
    if (!panel.classList.contains("open")) return;
    panel.classList.remove("open"); scrim.classList.remove("on"); panel.setAttribute("aria-hidden", "true");
    if (location.hash.startsWith("#station-")) history.replaceState(null, "", location.pathname + location.search);
  }
  scrim.addEventListener("click", closePanel);
  pBody.addEventListener("click", e => {
    if (e.target.closest(".close")) return closePanel();
    const go = e.target.closest("[data-go]"); if (go) return openPanel(go.dataset.go);
    if (e.target.closest('a[href^="#"]')) closePanel();
  });
  $$("[data-open]").forEach(b => b.addEventListener("click", () => openPanel(b.dataset.open)));
  // A shared link like .../#station-trialguide opens that station
  if (location.hash.startsWith("#station-") && byId[location.hash.slice(9)]) setTimeout(() => openPanel(location.hash.slice(9)), 250);

  /* ------------------------------------------------------------------
     7. Search, copy email, scroll effects
     ------------------------------------------------------------------ */
  const pal = $("#palette"), pIn = $("input", pal), pList = $(".palette-list", pal);
  const ITEMS = [
    ...boardList.map(s => ({ label: s.title, lines: s.lines, hint: kindWord(s), text: [s.short, s.tag, s.stack.join(" "), s.lines.map(l => LINES[l].name).join(" ")].join(" "), run: () => openPanel(s.id) })),
    ...[["about", "About me"], ["experience", "Experience"], ["projects", "Projects"], ["case-study", "Spotify Wrapped case study"], ["exploring", "What I'm looking for"], ["journey", "My journey (metro map)"], ["contact", "Contact"]]
      .map(([id, label]) => ({ label, lines: [], hint: "Section", text: "", run: () => $("#" + id).scrollIntoView({ behavior: "smooth" }) })),
    { label: "Resume (PDF)", lines: [], hint: "File", text: "cv", run: () => window.open("docs/Prakash_Bhabad_Resume.pdf", "_blank") },
  ];
  let sel = 0, shown = ITEMS;
  function renderPal() {
    const q = pIn.value.trim().toLowerCase();
    shown = ITEMS.filter(it => !q || (it.label + " " + it.text + " " + it.hint).toLowerCase().includes(q));
    sel = Math.max(0, Math.min(sel, shown.length - 1));
    pList.innerHTML = shown.map((it, k) => `<li class="${k === sel ? "sel" : ""}" data-k="${k}">${bullets(it.lines)}${esc(it.label)}<small>${esc(it.hint)}</small></li>`).join("") || `<li>Nothing found. Try "health", "RAG" or "Python".</li>`;
  }
  const openPal = () => { pal.classList.add("open"); pal.setAttribute("aria-hidden", "false"); pIn.value = ""; sel = 0; renderPal(); setTimeout(() => pIn.focus(), 10); };
  const closePal = () => { pal.classList.remove("open"); pal.setAttribute("aria-hidden", "true"); };
  const runPal = k => { const it = shown[k]; if (it) { closePal(); it.run(); } };
  $$("[data-open-palette]").forEach(b => b.addEventListener("click", openPal));
  pIn.addEventListener("input", () => { sel = 0; renderPal(); });
  pIn.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); renderPal(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderPal(); e.preventDefault(); }
    if (e.key === "Enter") runPal(sel);
  });
  pList.addEventListener("click", e => { const li = e.target.closest("li[data-k]"); if (li) runPal(+li.dataset.k); });
  pal.addEventListener("click", e => { if (e.target === pal) closePal(); });
  addEventListener("keydown", e => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); openPal(); }
    if (e.key === "Escape") { closePal(); closePanel(); lbClose(); }
    if (lb.classList.contains("open")) { if (e.key === "ArrowRight") lbShow(lbK + 1); if (e.key === "ArrowLeft") lbShow(lbK - 1); }
  });

  // Click the email to copy it; falls back to opening the mail app
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => {
    const small = $("small", b);
    const done = () => { small.textContent = "copied ✓"; setTimeout(() => (small.textContent = "click to copy"), 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, () => (location.href = "mailto:" + b.dataset.copy));
    else location.href = "mailto:" + b.dataset.copy;
  }));

  // Blocks fade up as they come into view; the bar chart grows
  const riseObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); riseObs.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$(".do, .fcard, .exp, .feature, .shipped, .case-text > *, .role, .tl, .city, .contact-grid > *").forEach(x => { x.classList.add("rise"); riseObs.observe(x); });
  $$(".gauges").forEach(x => riseObs.observe(x));

  // Underline the nav link of the section on screen
  const navObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) $$(".bar-links a").forEach(a => a.classList.toggle("here", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => navObs.observe(s));


  /* ------------------------------------------------------------------
     8. Key numbers that count up
     ------------------------------------------------------------------ */
  const projects = STATIONS.filter(s => s.kind === "project");
  $("#projCount").dataset.count = projects.length;
  $("#projCount").textContent = projects.length;
  function countUp(b) {
    const end = +b.dataset.count, suf = b.dataset.suffix || "";
    if (reduce) { b.textContent = end + suf; return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
      b.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  new IntersectionObserver((entries, obs) => entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$("b[data-count]", e.target).forEach(countUp);
    obs.disconnect();
  }), { threshold: 0.4 }).observe($(".kpis"));

  // Cards in "What fascinates me" that point at a project open its panel
  $$(".fcard[data-open]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); openPanel(a.dataset.open); }));

  /* ------------------------------------------------------------------
     9. Charts (small SVGs drawn from my own results)
     ------------------------------------------------------------------ */
  const C = { ink: "#171717", ink2: "#4b4b48", ink3: "#8b8a85", rule: "#e6e4de", H: "#e2231a", A: "#1666c5", P: "#0f9d58", B: "#f28c00", violet: "#7a5af8" };
  const txt = (parent, x, y, s, attrs = {}) => { const t = el("text", { x, y, ...attrs }, parent); t.textContent = s; return t; };

  // Orange Business: stockout index before vs after
  (function orangeChart() {
    const g = $("#orangeChart");
    const base = 180, h = 130;
    const bars = [{ l: "Before", v: 100, c: C.ink3 }, { l: "After", v: 85, c: C.A }];
    txt(g, 10, 18, "Stockouts (index, before = 100)", { "font-size": 13, "font-weight": 700, fill: C.ink });
    bars.forEach((b, i) => {
      const x = 30 + i * 90, bh = h * b.v / 100;
      el("rect", { x, y: base - bh, width: 60, height: bh, rx: 6, fill: b.c, class: "grow" }, g);
      txt(g, x + 30, base - bh - 8, String(b.v), { "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: C.ink });
      txt(g, x + 30, base + 20, b.l, { "text-anchor": "middle", "font-size": 13, fill: C.ink2 });
    });
    txt(g, 120 + 30, base - h * 0.85 - 26, "−15%", { "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: C.A });
    // The 14 hours, as a big number on the right
    txt(g, 270, 105, "14 h", { "text-anchor": "middle", "font-size": 44, "font-weight": 900, fill: C.ink });
    txt(g, 270, 130, "of manual work", { "text-anchor": "middle", "font-size": 13, fill: C.ink2 });
    txt(g, 270, 148, "removed every week", { "text-anchor": "middle", "font-size": 13, fill: C.ink2 });
    el("line", { x1: 220, y1: 40, x2: 220, y2: 190, stroke: C.rule, "stroke-width": 1 }, g);
  })();

  // Card fraud: PR-AUC as fraud gets rarer (numbers from the project README, mean of 5 seeds)
  (function fraudChart() {
    const g = $("#fraudChart");
    const rates = ["20%", "5%", "1%", "0.5%", "0.172%"];
    const series = [
      { n: "XGBoost, all training data", c: C.ink, dash: "6 5", v: [0.966, 0.930, 0.894, 0.881, 0.865] },
      { n: "XGBoost, same rows as the FM", c: C.B, v: [0.961, 0.932, 0.869, 0.826, 0.780] },
      { n: "TabICLv2 (random context)", c: C.A, v: [0.970, 0.944, 0.870, 0.820, 0.763] },
      { n: "TabPFN v2 (random context)", c: C.violet, v: [0.969, 0.932, 0.865, 0.831, 0.741] },
    ];
    const L = 50, R = 500, T = 74, Bt = 255, y0 = 0.70, y1 = 1.0;
    const X = i => L + i * (R - L) / (rates.length - 1), Y = v => Bt - (v - y0) / (y1 - y0) * (Bt - T);
    txt(g, L - 40, 18, "PR-AUC (higher is better)", { "font-size": 12.5, "font-weight": 700, fill: C.ink });
    [0.7, 0.8, 0.9, 1.0].forEach(v => {
      el("line", { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: C.rule }, g);
      txt(g, L - 8, Y(v) + 4, v.toFixed(1), { "text-anchor": "end", "font-size": 11, fill: C.ink3 });
    });
    rates.forEach((r, i) => txt(g, X(i), Bt + 20, r, { "text-anchor": "middle", "font-size": 11.5, fill: C.ink2 }));
    txt(g, (L + R) / 2, Bt + 38, "share of transactions that are fraud", { "text-anchor": "middle", "font-size": 11, fill: C.ink3 });
    // Legend in two rows
    series.forEach((s, k) => {
      const lx = L - 40 + (k % 2) * 250, ly = 36 + Math.floor(k / 2) * 16;
      el("line", { x1: lx, x2: lx + 18, y1: ly - 4, y2: ly - 4, stroke: s.c, "stroke-width": 3, "stroke-dasharray": s.dash || "" }, g);
      txt(g, lx + 24, ly, s.n, { "font-size": 11, fill: C.ink2 });
    });
    series.forEach(s => {
      const d = s.v.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v)}`).join(" ");
      const p = el("path", { d, fill: "none", stroke: s.c, "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-dasharray": s.dash || "", class: s.dash ? "" : "draw" }, g);
      s.v.forEach((v, i) => el("circle", { cx: X(i), cy: Y(v), r: 3.2, fill: "#fff", stroke: s.c, "stroke-width": 2 }, g));
    });
    // Animate the solid lines drawing in
    const paths = $$("path.draw", g);
    paths.forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = reduce ? 0 : len; });
    new IntersectionObserver((en, obs) => { if (!en[0].isIntersecting) return; paths.forEach(p => { p.style.transition = "stroke-dashoffset 1.6s ease"; p.style.strokeDashoffset = 0; }); obs.disconnect(); }, { threshold: 0.4 }).observe(g);
  })();

  // NourishCart: donut of checks passed
  (function donut() {
    const g = $("#ncDonut"), r = 48, c = 2 * Math.PI * r, pct = 0.959;
    el("circle", { cx: 60, cy: 60, r, fill: "none", stroke: "#ececec", "stroke-width": 14 }, g);
    const arc = el("circle", { cx: 60, cy: 60, r, fill: "none", stroke: C.P, "stroke-width": 14, "stroke-linecap": "round", transform: "rotate(-90 60 60)", "stroke-dasharray": `${c} ${c}`, "stroke-dashoffset": reduce ? c * (1 - pct) : c }, g);
    txt(g, 60, 60, "95.9%", { "text-anchor": "middle", "font-size": 20, "font-weight": 900, fill: C.ink });
    txt(g, 60, 78, "of 441 passed", { "text-anchor": "middle", "font-size": 10.5, fill: C.ink2 });
    new IntersectionObserver((en, obs) => { if (!en[0].isIntersecting) return; arc.style.transition = "stroke-dashoffset 1.4s ease"; arc.setAttribute("stroke-dashoffset", c * (1 - pct)); obs.disconnect(); }, { threshold: 0.5 }).observe(g);
  })();

  /* ------------------------------------------------------------------
     10. "More projects" cards with a filter
     ------------------------------------------------------------------ */
  const FEATURED = ["nourishcart", "trialguide", "driveros", "fraud", "spotify"];
  const more = projects.filter(s => !FEATURED.includes(s.id)).sort((a, b) => b.sort.localeCompare(a.sort));
  $("#cards").innerHTML = more.map(s => {
    const col = LINES[s.lines[0]].colour;
    const media = s.img
      ? `<img src="${esc(s.img)}" alt="${esc(s.imgAlt || "")}" loading="lazy" />`
      : `<span class="ph" style="color:${col}33">${esc(s.title)}</span>`;
    const st = s.stats[0];
    return `<button class="pcard" data-id="${s.id}" data-lines="${s.lines.join("")}">
      <div class="pc-img" style="background:${col}12">${media}</div>
      <div class="pc-body">
        <span class="meta">${s.lines.map(l => `<i class="dot ${l}"></i>`).join("")} ${esc(s.when)}</span>
        <h4>${esc(s.title)}</h4>
        <p>${esc(s.short)}</p>
        ${st ? `<span class="stat"><b>${esc(st.n)}</b>${esc(st.l)}</span>` : `<span class="stat">${esc(s.tag)}</span>`}
      </div>
    </button>`;
  }).join("");
  $$(".pcard").forEach(c => c.addEventListener("click", () => openPanel(c.dataset.id)));
  $$(".filters button").forEach(b => b.addEventListener("click", () => {
    $$(".filters button").forEach(x => x.classList.toggle("on", x === b));
    $$(".pcard").forEach(c => c.classList.toggle("hide", b.dataset.f !== "all" && !c.dataset.lines.includes(b.dataset.f)));
  }));

  /* ------------------------------------------------------------------
     11. Skills matrix: skills down the side, projects across the top
     ------------------------------------------------------------------ */
  const COLS = ["anjani", "orange", "nourishcart", "trialguide", "driveros", "fraud", "lm", "rag", "stayfit", "civicvoice", "campusconnect", "infokiosk", "adstudy", "spotify", "continuum", "carprice"];
  const SKILLS = [
    ["User research", "interviews, surveys, personas", ["anjani", "nourishcart", "driveros", "campusconnect", "infokiosk", "adstudy"]],
    ["Requirements and specs", "PRDs, acceptance criteria", ["anjani", "stayfit", "civicvoice", "nourishcart", "driveros"]],
    ["Prioritisation", "RICE, scoping v1", ["infokiosk", "nourishcart", "driveros"]],
    ["Stakeholder management", "clinicians, ops teams, 6 groups", ["anjani", "orange", "stayfit"]],
    ["Experiments and statistics", "randomised tests, regression, bootstrap", ["adstudy", "fraud"]],
    ["AI evaluation", "test sets, safety checks, risk limits", ["nourishcart", "trialguide", "fraud", "rag"]],
    ["LLMs and RAG", "retrieval, agents, fine-tuning", ["trialguide", "nourishcart", "rag", "civicvoice"]],
    ["ML modelling", "PyTorch, XGBoost, scikit-learn", ["fraud", "lm", "trialguide", "carprice"]],
    ["System design and APIs", "services, queues, REST", ["stayfit", "civicvoice"]],
    ["Data and dashboards", "SQL, Python, Power BI", ["orange", "adstudy"]],
    ["Product strategy", "teardowns, business models", ["spotify", "continuum", "driveros"]],
  ];
  const mx = $("#matrix");
  mx.style.gridTemplateColumns = `220px repeat(${COLS.length}, minmax(30px, 1fr)) 44px`;
  let html = `<span></span>` + COLS.map(id => `<span class="hd" data-id="${id}">${esc(byId[id].title)}</span>`).join("") + `<span></span>`;
  SKILLS.forEach(([name, sub, ids]) => {
    html += `<span class="sk">${esc(name)}<small>${esc(sub)}</small></span>`;
    html += COLS.map(id => {
      if (!ids.includes(id)) return `<span class="cell"></span>`;
      const s = byId[id];
      return `<span class="cell"><button title="${esc(s.title)}" aria-label="${esc(name)}: ${esc(s.title)}" data-id="${id}" style="background:${LINES[s.lines[0]].colour}"></button></span>`;
    }).join("");
    html += `<span class="count">${ids.length}</span>`;
  });
  mx.innerHTML = html;
  $$("[data-id]", mx).forEach(b => b.addEventListener("click", () => openPanel(b.dataset.id)));
  new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { mx.classList.add("in"); obs.disconnect(); } }, { threshold: 0.3 }).observe(mx);
  // Stagger the dots popping in
  $$(".cell button", mx).forEach((b, i) => { b.style.transitionDelay = (i * 0.025) + "s"; });
}
