// Topic analysis: a 10-topic model of the public comments (bay_area_topics.json, built by
// scripts/build_bay_topics.py from the published, redacted transcripts). Three charts: share of each body's
// comments by topic, a map of the comments (hover or tap a dot to read it), and each topic's top words.
(function () {
  const INK = "#2a1a10", MUTED = "#6b5440";
  const COL = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
  const tip = document.getElementById("bp-tip");
  const fmtInt = d3.format(",");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function showTip(ev, html) {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad, y = ev.pageY - r.height - pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    if (y < window.scrollY + 4) y = ev.pageY + pad;
    tip.style.left = Math.max(window.scrollX + 4, x) + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  const short = (n) => n.replace(/ City Council$| Board of Directors$/, "");
  let D = null;

  function frame(el, h, m) {
    const w = Math.max(300, el.clientWidth || 640);
    el.innerHTML = "";
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    return { svg, w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`) };
  }

  function grid() {
    const el = document.getElementById("tp-grid"), T = D.topics, B = D.bodies;
    const narrow = (el.clientWidth || 640) < 560;
    const m = { t: narrow ? 128 : 112, r: narrow ? 70 : 90, b: 4, l: narrow ? 118 : 160 }, rh = 24;
    const f = frame(el, m.t + m.b + rh * B.length, m);
    const x = d3.scaleBand(T.map((t, i) => i), [0, f.iw]).padding(0.05), y = d3.scaleBand(B.map((b) => b.body), [0, f.ih]).padding(0.06);
    const vmax = d3.max(B, (b) => d3.max(b.share));
    const col = d3.scaleLinear([0, vmax], ["#fdf6ea", "#7a2e0a"]).interpolate(d3.interpolateLab);
    f.g.selectAll(null).data(T).join("text").attr("class", "wl")
      .attr("transform", (t, i) => `translate(${x(i) + x.bandwidth() / 2},-6) rotate(-55)`).attr("font-size", narrow ? 10 : 11).text((t) => t.name);
    f.g.selectAll(null).data(B).join("text").attr("class", "wl").attr("x", -8).attr("y", (b) => y(b.body) + y.bandwidth() / 2)
      .attr("dy", "0.35em").attr("text-anchor", "end").attr("font-size", narrow ? 10 : 11).text((b) => `${short(b.name).replace(" County Board of Supervisors", " County")} (${b.n})`);
    const cells = B.flatMap((b) => b.share.map((v, i) => ({ b, i, v })));
    f.g.selectAll(null).data(cells).join("rect").attr("x", (c) => x(c.i)).attr("y", (c) => y(c.b.body)).attr("width", x.bandwidth())
      .attr("height", y.bandwidth()).attr("rx", 2).attr("fill", (c) => col(c.v))
      .on("pointermove click", (ev, c) => showTip(ev, `<b>${esc(short(c.b.name))}: ${esc(T[c.i].name)}</b>${Math.round(c.v)} of every 100 parts of its ${fmtInt(c.b.n)} public comments`))
      .on("pointerleave", hideTip);
    if (!narrow) f.g.selectAll(null).data(cells).join("text").attr("x", (c) => x(c.i) + x.bandwidth() / 2).attr("y", (c) => y(c.b.body) + y.bandwidth() / 2)
      .attr("dy", "0.35em").attr("text-anchor", "middle").attr("font-size", 10).attr("pointer-events", "none")
      .attr("fill", (c) => (c.v > vmax * 0.55 ? "#fff" : INK)).text((c) => Math.round(c.v));
  }

  function map() {
    const el = document.getElementById("tp-map"), T = D.topics, Pt = D.points;
    const w = Math.max(300, el.clientWidth || 640), h = Math.min(560, Math.max(320, w * 0.75)), m = { t: 8, r: 8, b: 8, l: 8 };
    const f = frame(el, h, m);
    const x = d3.scaleLinear([0, 1], [0, f.iw]), y = d3.scaleLinear([0, 1], [f.ih, 0]);
    const r = w < 480 ? 2.6 : 3.2;
    let pinned = null;
    const dots = f.g.selectAll(null).data(Pt).join("circle").attr("cx", (p) => x(p[0])).attr("cy", (p) => y(p[1])).attr("r", r)
      .attr("fill", (p) => COL[p[2]]).attr("fill-opacity", 0.75)
      .on("pointerenter click", (ev, p) => {
        dots.attr("stroke", null); d3.select(ev.currentTarget).attr("stroke", INK).attr("stroke-width", 1.5).raise();
        showTip(ev, `<b>${esc(T[p[2]].name)} (${p[3]} of 100 parts)</b><span class="tp-meta">${esc(short(p[4]))}</span>"${esc(p[5])}"`);
      })
      .on("pointerleave", () => { dots.attr("stroke", null); hideTip(); });
    const lg = d3.select("#tp-legend").html("");
    T.forEach((t, i) => { const s = lg.append("span"); s.append("span").attr("class", "sw").style("background", COL[i]); s.append("span").text(`${t.name} (${t.n})`); });
  }

  function words() {
    const el = document.getElementById("tp-words"); el.innerHTML = "";
    D.topics.forEach((t, i) => {
      const box = el.appendChild(document.createElement("div")); box.className = "tp-w";
      const hd = box.appendChild(document.createElement("p")); hd.className = "tp-wh"; hd.style.color = COL[i]; hd.textContent = t.name;
      const W = t.words, w = 230, rh = 17, lw = 92, h = rh * W.length;
      const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
      const x = d3.scaleLinear([0, d3.max(W, (d) => d[1])], [0, w - lw - 4]);
      W.forEach((d, j) => {
        svg.append("text").attr("x", lw - 6).attr("y", j * rh + rh / 2).attr("dy", "0.35em").attr("text-anchor", "end").attr("font-size", 11).attr("fill", INK).text(d[0]);
        svg.append("rect").attr("x", lw).attr("y", j * rh + 3).attr("height", rh - 6).attr("width", x(d[1])).attr("rx", 2).attr("fill", COL[i]);
      });
    });
  }

  d3.json("/visualizations/data/bay_area_topics.json?v=20261105c").then((d) => {
    D = d; grid(); map(); words();
    let wd = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== wd) { wd = window.innerWidth; grid(); map(); } });
  });
})();
