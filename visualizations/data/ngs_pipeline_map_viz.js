// NGS Pipeline Map: sequencing-analysis options as columns of boxes, with toggleable route overlays.
// Data: ngs_pipeline_map.json (columns, nodes, routes), kept separate from the drawing code.
(function () {
  const INK = "#2a2340", SHARED = "#4a4360", MUTED = "#625a7a", BOX = "#fcfaff", EDGE = "#c9bce3", FAINT = "#ddd3ec";
  const COL = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
  const colW = 170, boxW = 128, boxH = 44, rowH = 60, head = 34, m = { t: 6, r: 4, b: 8, l: 4 };
  const tip = document.getElementById("ngs-tip");
  const mapEl = document.getElementById("ngs-map");
  const togEl = document.getElementById("ngs-routes");
  const detEl = document.getElementById("ngs-detail");
  const HINT = "Pick a route, or select any box to see what it does.";

  // First sentence of the description; "e.g." and "i.e." do not end a sentence.
  const firstSentence = (t) => { const m = t.match(/^.*?(?<!\be\.g|\bi\.e)[.?!](?=\s|$)/); return m ? m[0] : t; };
  const statEl = document.getElementById("ngs-status");

  // Tooltip at a pointer position, or under an element when there is no pointer (keyboard focus, tap).
  function tipAt(text, px, py, title) {
    tip.textContent = "";
    if (title) { const b = document.createElement("b"); b.textContent = title; tip.appendChild(b); }
    tip.appendChild(document.createTextNode(text));
    tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = px + pad, y = py - r.height - pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = px - r.width - pad;
    if (x < window.scrollX + 4) x = window.scrollX + 4;
    if (y < window.scrollY + 4) y = py + pad;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  const showTip = (ev, n) => tipAt(firstSentence(n.description), ev.pageX, ev.pageY);
  const tipUnder = (elm, text, title) => { const b = elm.getBoundingClientRect(); tipAt(text, b.left + window.scrollX, b.top + window.scrollY, title); };
  const hideTip = () => { tip.hidden = true; };
  document.addEventListener("touchstart", (e) => { if (!e.target.closest(".ngs-map, .ngs-gl")) hideTip(); }, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });

  fetch("/visualizations/data/ngs_pipeline_map.json?v=20261124f").then((r) => r.json()).then(draw);

  function draw(D) {
    const node = new Map(D.nodes.map((n) => [n.id, n]));
    const color = new Map(D.routes.map((r, i) => [r.id, COL[i % COL.length]]));
    const active = new Set(["ours"]);
    let selected = null;

    // Glossary: wrap the first use of each term in a container, matched at render time.
    const G = D.glossary || {}, terms = Object.keys(G).sort((a, b) => b.length - a.length);
    const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const termRe = new RegExp(`\\b(${terms.map(esc).join("|")})(s|es)?\\b`, "gi");
    const keyOf = new Map(terms.map((t) => [t.toLowerCase(), t]));
    function glossed(text, used) {
      const f = document.createDocumentFragment(); let last = 0;
      text.replace(termRe, (m, t, pl, i) => {
        const k = keyOf.get(t.toLowerCase());
        if (used.has(k)) return m;
        used.add(k);
        f.appendChild(document.createTextNode(text.slice(last, i)));
        const sp = el("span", "ngs-gl", m); sp.tabIndex = 0; sp.setAttribute("role", "button");
        sp.setAttribute("aria-label", `${m}: ${G[k]}`);
        const show = () => tipUnder(sp, G[k], k);
        sp.addEventListener("mouseenter", show); sp.addEventListener("mouseleave", hideTip);
        sp.addEventListener("focus", show); sp.addEventListener("blur", hideTip);
        sp.addEventListener("click", (e) => { e.stopPropagation(); show(); });
        f.appendChild(sp); last = i + m.length; return m;
      });
      f.appendChild(document.createTextNode(text.slice(last)));
      return f;
    }
    const gp = (tag, cls, text, used) => { const e = el(tag, cls); e.appendChild(glossed(text, used)); return e; };
    let rule = null; // column whose "how to choose" rule is pinned in the panel

    const maxRow = d3.max(D.nodes, (n) => n.row);
    const W = m.l + m.r + D.columns.length * colW, H = m.t + head + (maxRow + 1) * rowH + m.b;
    const X = (n) => m.l + n.col * colW + (colW - boxW) / 2, Y = (n) => m.t + head + n.row * rowH;

    // Each link appears once, with the routes that use it in data order.
    const links = new Map();
    D.routes.forEach((r) => r.path.slice(1).forEach((b, i) => {
      const k = r.path[i] + ">" + b;
      if (!links.has(k)) links.set(k, { a: node.get(r.path[i]), b: node.get(b), routes: [] });
      links.get(k).routes.push(r.id);
    }));
    const curve = (L, dy) => {
      const x1 = X(L.a) + boxW, y1 = Y(L.a) + boxH / 2 + dy, x2 = X(L.b), y2 = Y(L.b) + boxH / 2 + dy, mx = (x1 + x2) / 2;
      return `M${x1},${y1}C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    };
    // Same curve, shifted by `off` px along its normal at every point, so parallel routes stay apart on the bends.
    const line = d3.line().curve(d3.curveBasis);
    const offCurve = (L, off) => {
      const x1 = X(L.a) + boxW, y1 = Y(L.a) + boxH / 2, x2 = X(L.b), y2 = Y(L.b) + boxH / 2, mx = (x1 + x2) / 2, pts = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24, u = 1 - t;
        const x = u * u * u * x1 + 3 * u * t * (u + t) * mx + t * t * t * x2, y = (u * u * u + 3 * u * u * t) * y1 + (3 * u * t * t + t * t * t) * y2;
        const dx = 3 * u * u * (mx - x1) + 3 * t * t * (x2 - mx), dy = 6 * u * t * (y2 - y1), len = Math.hypot(dx, dy) || 1;
        pts.push([x - (dy / len) * off, y + (dx / len) * off]);
      }
      return line(pts);
    };

    const svg = d3.select(mapEl).append("svg").attr("viewBox", `0 0 ${W} ${H}`).style("min-width", `${W}px`)
      .attr("role", "group").attr("aria-label", "Map of sequencing-analysis options in 8 stages, left to right.");
    const rules = D.rules || [];
    svg.append("g").attr("class", "ax").selectAll("text").data(D.columns).join("text")
      .attr("x", (c, i) => m.l + i * colW + colW / 2).attr("y", m.t + 14).attr("text-anchor", "middle").attr("class", "ngs-colh").text((c) => c)
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", (c, i) => `${c}. How to choose: ${rules[i]}`)
      .on("mouseenter", function (ev, c) { tipUnder(this, rules[D.columns.indexOf(c)], "How to choose"); }).on("mouseleave", hideTip)
      .on("focus", function (ev, c) { tipUnder(this, rules[D.columns.indexOf(c)], "How to choose"); }).on("blur", hideTip)
      .on("click", function (ev, c) { const i = D.columns.indexOf(c); tipUnder(this, rules[i], "How to choose"); rule = rule === i ? null : i; update(); })
      .on("keydown", function (ev, c) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); const i = D.columns.indexOf(c); rule = rule === i ? null : i; update(); } });
    svg.append("g").selectAll("path").data([...links.values()]).join("path")
      .attr("d", (L) => curve(L, 0)).attr("fill", "none").attr("stroke", FAINT).attr("stroke-width", 1.2);
    const over = svg.append("g").attr("fill", "none"); // links stay behind the boxes, drawn before them

    const g = svg.append("g").selectAll("g").data(D.nodes).join("g").attr("class", "ngs-node")
      .attr("transform", (n) => `translate(${X(n)},${Y(n)})`).attr("tabindex", 0).attr("role", "button")
      .attr("aria-label", (n) => `${n.label}, ${n.tool}`)
      .on("click", (ev, n) => select(n.id))
      .on("keydown", (ev, n) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(n.id); } })
      .on("mousemove", (ev, n) => showTip(ev, n)).on("mouseleave", hideTip);
    g.append("rect").attr("class", "ngs-box").attr("width", boxW).attr("height", boxH).attr("rx", 8);
    g.append("text").attr("class", "ngs-lbl").attr("x", boxW / 2).attr("y", 18).attr("text-anchor", "middle").text((n) => n.label);
    g.append("text").attr("class", "ngs-tool").attr("x", boxW / 2).attr("y", 32).attr("text-anchor", "middle").text((n) => n.tool);
    // Shrink any label or tool line that would overflow its box.
    g.selectAll("text").each(function () {
      let fs = parseFloat(getComputedStyle(this).fontSize);
      while (this.getComputedTextLength() > boxW - 10 && fs > 8) { fs -= 0.5; this.style.fontSize = fs + "px"; }
    });
    const dots = g.append("g").attr("transform", `translate(${boxW / 2},${boxH - 4})`);

    // Route toggles above the map.
    D.routes.forEach((r) => {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.v = r.id;
      const sw = document.createElement("span"); sw.className = "sw"; sw.style.background = color.get(r.id);
      b.appendChild(sw); b.appendChild(el("span", "ngs-data", r.label));
      b.addEventListener("click", () => toggle(r.id));
      togEl.appendChild(b);
    });

    function toggle(id) { active.has(id) ? active.delete(id) : active.add(id); update(); }
    function select(id) { selected = selected === id ? null : id; update(); }
    const onRoutes = (id) => D.routes.filter((r) => active.has(r.id) && r.path.includes(id)).map((r) => r.id);

    function update() {
      togEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", active.has(b.dataset.v)));
      const segs = [];
      links.forEach((L) => {
        const on = L.routes.filter((id) => active.has(id));
        on.forEach((id, i) => segs.push({ L, id, dy: (i - (on.length - 1) / 2) * 3.6 }));
      });
      over.selectAll("path").data(segs).join("path").attr("d", (s) => offCurve(s.L, s.dy))
        .attr("stroke", (s) => color.get(s.id)).attr("stroke-width", 2.4).attr("stroke-linecap", "round");
      g.attr("aria-pressed", (n) => n.id === selected).classed("on", (n) => onRoutes(n.id).length > 0).classed("sel", (n) => n.id === selected);
      g.select("rect").attr("stroke", (n) => { const o = onRoutes(n.id); return n.id === selected ? INK : o.length > 1 ? SHARED : o.length ? color.get(o[0]) : EDGE; });
      dots.each(function (n) {
        const o = onRoutes(n.id);
        d3.select(this).selectAll("circle").data(o).join("circle").attr("r", 2.6)
          .attr("cx", (id, i) => (i - (o.length - 1) / 2) * 7).attr("fill", (id) => color.get(id));
      });
      detail();
      const on = D.routes.filter((r) => active.has(r.id)).length;
      statEl.textContent = `${on} of ${D.routes.length} routes on.` + (selected ? ` Selected: ${node.get(selected).label}.` : "");
    }

    function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function detail() {
      detEl.innerHTML = "";
      const used = new Set();
      if (rule != null) {
        detEl.appendChild(el("p", "ca-tabs-label", `How to choose: ${D.columns[rule]}`));
        detEl.appendChild(gp("p", "tw-p ngs-data", rules[rule], used));
      }
      if (selected) {
        const n = node.get(selected);
        detEl.appendChild(el("h3", "ngs-dh ngs-data", n.label));
        detEl.appendChild(el("p", "ngs-dtool ngs-data", n.tool));
        detEl.appendChild(gp("p", "tw-p ngs-data", n.description, used));
        if (n.io) detEl.appendChild(el("p", "ngs-io ngs-data", `Takes: ${n.io.takes}. Writes: ${n.io.writes}.`));
        const thru = D.routes.filter((r) => r.path.includes(n.id));
        if (thru.length) {
          detEl.appendChild(el("p", "ca-tabs-label", "Routes through this box"));
          const wrap = el("div", "ca-tabs ngs-tabs");
          thru.forEach((r) => {
            const b = el("button"); b.type = "button"; b.setAttribute("aria-pressed", active.has(r.id));
            const sw = el("span", "sw"); sw.style.background = color.get(r.id);
            b.appendChild(sw); b.appendChild(el("span", "ngs-data", r.label));
            b.addEventListener("click", () => { toggle(r.id); const f = detEl.querySelectorAll(".ngs-tabs button")[thru.indexOf(r)]; if (f) f.focus(); });
            wrap.appendChild(b);
          });
          detEl.appendChild(wrap);
        } else detEl.appendChild(el("p", "ngs-dtool", "No route passes through this box."));
      }
      const on = D.routes.filter((r) => active.has(r.id));
      if (on.length) {
        detEl.appendChild(el("p", "ca-tabs-label ngs-notes-h", "Active routes"));
        const ul = el("ul", "ngs-notes");
        on.forEach((r) => {
          const li = el("li", "ngs-data"); const sw = el("span", "sw"); sw.style.background = color.get(r.id);
          li.appendChild(sw); li.appendChild(el("b", null, r.label + ". ")); li.appendChild(glossed(r.note, used));
          if (r.pipeline) li.appendChild(el("span", "ngs-pipe", `Ready-made pipeline: ${r.pipeline}.`));
          ul.appendChild(li);
        });
        detEl.appendChild(ul);
      }
      if (!selected && !on.length) detEl.appendChild(el("p", "ngs-hint", HINT));
    }
    update();
  }
})();
