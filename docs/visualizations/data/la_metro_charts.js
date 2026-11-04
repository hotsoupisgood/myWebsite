// LA Metro post, below the map: (1) average weekday boardings by line, fiscal years 2009 to 2026;
// (2) every station by opening date and average weekday boardings in fiscal year 2026.
(function () {
  const INK = "#2a1a10", MUTED = "#6b5440", GRID = "#ead9bd";
  const fmt = d3.format(","), tip = document.getElementById("lmc-tip");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function show(ev, html) {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad; if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    tip.style.left = Math.max(window.scrollX + 4, x) + "px"; tip.style.top = (ev.pageY - r.height - pad) + "px";
  }
  const hide = () => { tip.hidden = true; };
  function frame(el, h, m) {
    el.innerHTML = "";
    const w = Math.max(300, el.clientWidth || 640);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    return { w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`) };
  }

  function lines(D) {
    const el = document.getElementById("lmc-lines"), LR = D.line_ridership, FROM = LR.from || {};
    const NAME = { A: "A", BD: "B, D", C: "C", E: "E", K: "K" };
    const col = (q) => D.lines[q === "BD" ? "B" : q].color;
    const S = Object.keys(LR.fy).map((q) => ({ q, p: Object.keys(LR.fy[q]).map((y) => [+y, LR.fy[q][y]]).sort((a, b) => a[0] - b[0]) }));
    const narrow = (el.clientWidth || 640) < 480;
    const m = { t: 14, r: narrow ? 74 : 86, b: 34, l: 52 }, f = frame(el, narrow ? 260 : 300, m);
    const x = d3.scaleLinear([2009, 2026], [0, f.iw]);
    const y = d3.scaleLinear([0, d3.max(S, (s) => d3.max(s.p, (p) => p[1])) * 1.05], [f.ih, 0]).nice();
    const ax = f.g.append("g").attr("class", "lmc-ax");
    y.ticks(5).forEach((t) => {
      ax.append("line").attr("x2", f.iw).attr("y1", y(t)).attr("y2", y(t)).attr("stroke", GRID);
      ax.append("text").attr("x", -6).attr("y", y(t)).attr("dy", "0.32em").attr("text-anchor", "end").text(t >= 1000 ? `${t / 1000}k` : t);
    });
    (narrow ? [2010, 2014, 2018, 2022, 2026] : [2009, 2012, 2015, 2018, 2021, 2024, 2026]).forEach((t) => {
      ax.append("text").attr("x", x(t)).attr("y", f.ih + 16).attr("text-anchor", "middle").text(t);
    });
    ax.append("text").attr("x", f.iw / 2).attr("y", f.ih + 31).attr("text-anchor", "middle").text("Fiscal year, ending in June");
    // June 2023: the Regional Connector gave the A and E Lines their current routes
    ax.append("line").attr("x1", x(2023.5)).attr("x2", x(2023.5)).attr("y1", 0).attr("y2", f.ih).attr("stroke", MUTED).attr("stroke-dasharray", "3 3");
    ax.append("text").attr("x", x(2023.5) - 4).attr("y", 10).attr("text-anchor", "end").text("Regional Connector");
    const ln = d3.line().x((p) => x(p[0])).y((p) => y(p[1]));
    S.forEach((s) => {
      const cut = FROM[s.q] || 0;
      const before = s.p.filter((p) => p[0] <= cut), after = s.p.filter((p) => p[0] >= cut);
      if (cut && before.length > 1) f.g.append("path").attr("d", ln(before)).attr("fill", "none").attr("stroke", col(s.q)).attr("stroke-width", 1.6).attr("stroke-dasharray", "4 3").attr("opacity", 0.55);
      f.g.append("path").attr("d", ln(after)).attr("fill", "none").attr("stroke", col(s.q)).attr("stroke-width", 2.6);
      const l = s.p[s.p.length - 1];
      s.end = { x: x(l[0]) + 6, y: y(l[1]), t: `${NAME[s.q]} ${fmt(l[1])}`, c: col(s.q) };
    });
    // end labels, pushed apart vertically
    const E = S.map((s) => s.end).sort((a, b) => a.y - b.y);
    for (let i = 1; i < E.length; i++) if (E[i].y - E[i - 1].y < 13) E[i].y = E[i - 1].y + 13;
    E.forEach((e) => f.g.append("text").attr("class", "lmc-end").attr("x", e.x).attr("y", e.y).attr("dy", "0.32em").attr("fill", e.c).text(e.t));
    f.g.append("rect").attr("width", f.iw).attr("height", f.ih).attr("fill", "transparent")
      .on("pointermove click", (ev) => {
        const yr = Math.round(x.invert(d3.pointer(ev)[0])); if (yr < 2009 || yr > 2026) return hide();
        const rows = S.filter((s) => LR.fy[s.q][yr] !== undefined).map((s) => `${NAME[s.q]}: ${fmt(LR.fy[s.q][yr])}${FROM[s.q] && yr < FROM[s.q] ? " (old route)" : ""}`);
        show(ev, `<b>Fiscal year ${yr}</b>${rows.join("<br>")}`);
      }).on("pointerleave", hide);
  }

  function scatter(D) {
    const el = document.getElementById("lmc-scatter"), FY = "2026";
    const pts = D.stations.filter((r) => r.b && r.b[FY] !== undefined).map((r) => {
      const [yy, mm, dd] = r.opened.split("-").map(Number);
      return { r, t: yy + (mm - 1) / 12 + (dd - 1) / 365, v: r.b[FY], c: D.lines[r.lines[0]].color };
    });
    const narrow = (el.clientWidth || 640) < 480;
    const m = { t: 14, r: 12, b: 34, l: 52 }, f = frame(el, narrow ? 300 : 340, m);
    const x = d3.scaleLinear([1989.5, 2026.5], [0, f.iw]);
    const y = d3.scaleLinear([0, d3.max(pts, (p) => p.v) * 1.08], [f.ih, 0]).nice();
    const ax = f.g.append("g").attr("class", "lmc-ax");
    y.ticks(5).forEach((t) => {
      ax.append("line").attr("x2", f.iw).attr("y1", y(t)).attr("y2", y(t)).attr("stroke", GRID);
      ax.append("text").attr("x", -6).attr("y", y(t)).attr("dy", "0.32em").attr("text-anchor", "end").text(t >= 1000 ? `${t / 1000}k` : t);
    });
    (narrow ? [1990, 2000, 2010, 2020] : [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]).forEach((t) => {
      ax.append("text").attr("x", x(t)).attr("y", f.ih + 16).attr("text-anchor", "middle").text(t);
    });
    ax.append("text").attr("x", f.iw / 2).attr("y", f.ih + 31).attr("text-anchor", "middle").text("Year the station opened");
    const dots = f.g.selectAll(null).data(pts).join("circle").attr("cx", (p) => x(p.t)).attr("cy", (p) => y(p.v)).attr("r", narrow ? 3.6 : 4.4)
      .attr("fill", (p) => p.c).attr("fill-opacity", 0.85).attr("stroke", "#fff").attr("stroke-width", 1)
      .on("pointermove click", (ev, p) => {
        const [yy, mm, dd] = p.r.opened.split("-").map(Number);
        show(ev, `<b>${p.r.name}</b>${p.r.lines.join(", ")} Line · opened ${dd} ${MONTHS[mm - 1]} ${yy}<br>${fmt(p.v)} average weekday boardings, fiscal year ${FY}`);
      }).on("pointerleave", hide);
    // label the 5 busiest
    pts.slice().sort((a, b) => b.v - a.v).slice(0, 5).forEach((p, i) => {
      const left = x(p.t) > f.iw * 0.6;
      f.g.append("text").attr("class", "lmc-lbl").attr("x", x(p.t) + (left ? -7 : 7)).attr("y", y(p.v)).attr("dy", "0.32em")
        .attr("text-anchor", left ? "end" : "start").text(p.r.name);
    });
    // Map hover: highlight that station's dot (event from la_metro_viz.js)
    const hl = f.g.append("g").attr("pointer-events", "none");
    scatter.focus = (id) => {
      hl.selectAll("*").remove();
      dots.attr("fill-opacity", id ? 0.25 : 0.85);
      const p = pts.find((q) => q.r.id === id); if (!p) { dots.attr("fill-opacity", 0.85); return; }
      hl.append("circle").attr("cx", x(p.t)).attr("cy", y(p.v)).attr("r", narrow ? 7 : 8).attr("fill", p.c).attr("stroke", INK).attr("stroke-width", 2);
      const left = x(p.t) > f.iw * 0.6;
      hl.append("text").attr("class", "lmc-lbl").attr("x", x(p.t) + (left ? -11 : 11)).attr("y", y(p.v) - 2).attr("dy", "0.32em")
        .attr("text-anchor", left ? "end" : "start").style("font-weight", 700).text(`${p.r.name} ${fmt(p.v)}`);
    };
    if (scatter.cur) scatter.focus(scatter.cur);
    document.getElementById("lmc-scatter-note").textContent =
      `${pts.length} stations. Each dot is one station, colored by its first line. Stations that opened during fiscal year ${FY} have an average over the days they were open.`;
  }

  d3.json("/visualizations/data/la_metro_stations.json?v=20261029c").then((D) => {
    const all = () => { lines(D); scatter(D); };
    window.addEventListener("lam:station", (e) => { scatter.cur = e.detail; if (scatter.focus) scatter.focus(e.detail); });
    all();
    let w = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== w) { w = window.innerWidth; all(); } });
  });
})();
