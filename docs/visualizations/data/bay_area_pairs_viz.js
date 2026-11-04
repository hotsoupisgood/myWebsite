// Word-pair grid for the Bay Area Transit Analysis post: the 12 most frequent word pairs, by month, one tab per body.
(function () {
  const INK = "#2a1a10", MUTED = "#6b5440", FOCUS = "#c2410c", EMPTY = "#efeae3";
  const fmtInt = d3.format(","), fmt1 = d3.format(".1f");
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const short = (l) => l.replace(/ City Council$/, "").replace(/ Board of Directors$/, "").replace(/ Board of Supervisors$/, " County");
  const tip = document.getElementById("bp-tip");

  function showTip(ev, html) {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad, y = ev.pageY + pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    tip.style.left = Math.max(window.scrollX + 4, x) + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };

  let cur = "all";
  function draw(D) {
    const T = D.tabs.find((t) => t.key === cur), P = T.pairs, M = T.months, el = document.getElementById("bp-grid");
    el.innerHTML = "";
    const where = cur === "all" ? `across all ${D.bodies_total} bodies` : `at the ${T.label}`;
    document.getElementById("bp-h").textContent = `"${P[0].label}" was the most frequent word pair ${where}, said ${fmtInt(P[0].n)} times.`;
    const narrow = (el.clientWidth || 640) < 480;
    const m = { t: 34, r: 4, b: 4, l: narrow ? 150 : 160 }, rowH = narrow ? 26 : 28;
    const W = el.clientWidth || 640, H = m.t + m.b + rowH * P.length;
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`);
    const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const x = d3.scaleBand(M.map((c) => c.m), [0, iw]).padding(0.06);
    const y = d3.scaleBand(P.map((p) => p.key), [0, ih]).padding(0.08);
    const vmax = d3.max(M, (c) => (c.rate ? d3.max(P, (p) => c.rate[p.key]) : 0)) || 1;
    const col = d3.scaleLinear([0, vmax], ["#fdf6ea", FOCUS]).interpolate(d3.interpolateLab);
    const hx = g.append("g").attr("class", "ax");
    M.forEach((c, i) => {
      const [yr, mo] = c.m.split("-").map(Number);
      const t = hx.append("text").attr("text-anchor", "middle");
      const cx = x(c.m) + x.bandwidth() / 2;
      t.append("tspan").attr("x", cx).attr("y", -20).text(narrow ? MON[mo - 1][0] : MON[mo - 1]);
      if (i === 0 || mo === 1) t.append("tspan").attr("x", cx).attr("y", -7).text(narrow ? `'${String(yr).slice(2)}` : yr);
    });
    g.selectAll(null).data(P).join("text").attr("class", "wl").attr("x", -8)
      .attr("y", (p) => y(p.key) + y.bandwidth() / 2).attr("dy", "0.35em").attr("text-anchor", "end").text((p) => p.label);
    const cells = M.flatMap((c) => P.map((p) => ({ c, p, v: c.rate ? c.rate[p.key] : null, n: c.n ? c.n[p.key] : 0 })));
    const lab = (c) => { const [yr, mo] = c.m.split("-").map(Number); return `${MON[mo - 1]} ${yr}`; };
    g.selectAll(null).data(cells).join("rect")
      .attr("x", (d) => x(d.c.m)).attr("y", (d) => y(d.p.key)).attr("width", x.bandwidth()).attr("height", y.bandwidth())
      .attr("rx", 3).attr("fill", (d) => (d.v === null ? EMPTY : col(d.v)))
      .on("pointermove click", (ev, d) => showTip(ev, d.v === null
        ? `<b>${lab(d.c)}</b>No coded meetings this month`
        : `<b>"${d.p.label}", ${lab(d.c)}</b>${fmtInt(d.n)} times, ${fmt1(d.v)} per 10,000 words`))
      .on("pointerleave", hideTip);
    if (!narrow) {
      g.selectAll(null).data(cells.filter((d) => d.v !== null)).join("text").attr("class", "cell-lbl")
        .attr("x", (d) => x(d.c.m) + x.bandwidth() / 2).attr("y", (d) => y(d.p.key) + y.bandwidth() / 2)
        .attr("dy", "0.35em").attr("text-anchor", "middle").attr("fill", (d) => (d.v > vmax * 0.55 ? "#fff" : INK))
        .text((d) => fmt1(d.v));
    }
    const lg = document.getElementById("bp-legend");
    lg.innerHTML = "";
    lg.appendChild(document.createTextNode("Times per 10,000 words: "));
    for (let i = 0; i < 5; i++) {
      const v = vmax * i / 4, sw = lg.appendChild(document.createElement("span"));
      sw.className = "sw"; sw.style.background = col(v);
      lg.appendChild(document.createTextNode(Math.round(v)));
    }
    const sw = lg.appendChild(document.createElement("span"));
    sw.className = "sw"; sw.style.background = EMPTY;
    lg.appendChild(document.createTextNode("no coded meetings"));
  }

  d3.json("/visualizations/data/bay_area_pairs.json?v=20261103a").then((D) => {
    const tabs = document.getElementById("bp-tabs");
    D.tabs.forEach((t, i) => {
      const b = tabs.appendChild(document.createElement("button"));
      b.type = "button"; b.setAttribute("role", "tab"); b.dataset.v = t.key; b.textContent = t.key === "all" ? "All" : short(t.label);
      b.setAttribute("aria-selected", i === 0); b.tabIndex = i === 0 ? 0 : -1;
    });
    const btns = [...tabs.querySelectorAll("button")];
    const select = (k, focus) => {
      cur = k;
      btns.forEach((b) => { const on = b.dataset.v === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) { b.focus(); b.scrollIntoView({ block: "nearest", inline: "nearest" }); } });
      draw(D);
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.v); });
    tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const i = btns.findIndex((b) => b.dataset.v === cur);
      select(btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].dataset.v, true);
    });
    draw(D);
    let w = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== w) { w = window.innerWidth; draw(D); } });
  });
})();
