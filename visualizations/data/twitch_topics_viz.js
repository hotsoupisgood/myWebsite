// Topic analysis: a 12-topic model of ~3-minute stream chunks (twitch_topics.json, built by
// scripts/build_twitch_topics.py). Three charts: each stream's topic shares, a map of the chunks, and each topic's
// top words. No transcript text is shown.
(function () {
  const INK = "#2a2340";
  const COL = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#393b79", "#ad494a"];
  const tip = document.getElementById("tw-tip");
  const fmtInt = d3.format(",");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const day = d3.timeFormat("%b %-d"), parse = d3.timeParse("%Y-%m-%d");
  function showTip(ev, html) {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad, y = ev.pageY - r.height - pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    if (y < window.scrollY + 4) y = ev.pageY + pad;
    tip.style.left = Math.max(window.scrollX + 4, x) + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  let D = null;

  function frame(el, h, m, minW) {
    const w = Math.max(minW || 300, el.clientWidth || 640);
    el.innerHTML = "";
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    if (w > (el.clientWidth || 0)) svg.style("width", w + "px").style("max-width", "none");
    return { svg, w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`) };
  }

  function timeline(E) {
    const el = document.getElementById("tt-events"), Dd = D.days.map((b) => parse(b.month));
    const rowsN = 4, rh = 30, m = { t: 6, r: 16, b: 22, l: 16 };
    const f = frame(el, m.t + m.b + rh * rowsN + 10, m, 600);
    const x = d3.scaleTime([d3.timeDay.offset(Dd[0], -1), d3.timeDay.offset(Dd[Dd.length - 1], 1)], [0, f.iw]);
    const base = rh * rowsN + 4;
    // stretches with no stream, so an event there has no data under it
    for (let i = 1; i < Dd.length; i++) if (d3.timeDay.count(Dd[i - 1], Dd[i]) > 3)
      f.g.append("rect").attr("x", x(Dd[i - 1]) + 4).attr("width", x(Dd[i]) - x(Dd[i - 1]) - 8).attr("y", 0).attr("height", base)
        .attr("fill", "#f1edf7").append("title").text("No streams in this period");
    f.g.append("line").attr("x1", 0).attr("x2", f.iw).attr("y1", base).attr("y2", base).attr("stroke", "#c9bce3");
    f.g.append("g").attr("class", "ax").attr("transform", `translate(0,${base})`)
      .call(d3.axisBottom(x).ticks(d3.timeWeek.every(1)).tickFormat(day).tickSize(4));
    E.events.forEach((e, i) => {
      const xd = x(parse(e.date)), r = i % rowsN, y = r * rh + 14, c = { mi: "#1f77b4", vote: "#2ca02c" }[e.kind] || "#7461c4";
      const g = f.g.append("g").style("cursor", "pointer")
        .on("pointerenter click", (ev) => showTip(ev, `<b>${day(parse(e.date))}: ${esc(e.label)}</b>${esc(e.text)}`)).on("pointerleave", hideTip);
      g.append("line").attr("x1", xd).attr("x2", xd).attr("y1", y + 4).attr("y2", base).attr("stroke", c).attr("stroke-dasharray", "2,2");
      g.append("circle").attr("cx", xd).attr("cy", base).attr("r", 3.5).attr("fill", c);
      const anchor = xd > f.iw - 90 ? "end" : xd < 90 ? "start" : "middle";
      g.append("text").attr("x", xd).attr("y", y).attr("text-anchor", anchor).attr("font-size", 11).attr("fill", e.kind === "world" ? INK : c).attr("font-weight", e.kind === "world" ? 400 : 600)
        .attr("paint-order", "stroke").attr("stroke", "#fff").attr("stroke-width", 3).text(e.label);
    });
  }

  function grid() {
    const el = document.getElementById("tt-grid"), T = D.topics, B = D.days;
    const narrow = false;
    const m = { t: 150, r: 110, b: 4, l: 60 }, rh = 18;
    const f = frame(el, m.t + m.b + rh * B.length, m, 600);   // phones scroll sideways
    const x = d3.scaleBand(T.map((t, i) => i), [0, f.iw]).padding(0.05), y = d3.scaleBand(B.map((b) => b.month), [0, f.ih]).padding(0.06);
    const vmax = d3.max(B, (b) => d3.max(b.share));
    const col = d3.scaleLinear([0, vmax], ["#fcfaff", "#4b3a99"]).interpolate(d3.interpolateLab);
    f.g.selectAll(null).data(T).join("text").attr("class", "wl")
      .attr("transform", (t, i) => `translate(${x(i) + x.bandwidth() / 2},-6) rotate(-55)`).attr("font-size", narrow ? 10 : 11).text((t) => t.name);
    f.g.selectAll(null).data(B).join("text").attr("class", "wl").attr("x", -6).attr("y", (b) => y(b.month) + y.bandwidth() / 2)
      .attr("dy", "0.35em").attr("text-anchor", "end").attr("font-size", narrow ? 9.5 : 11).text((b) => day(parse(b.month)));
    const cells = B.flatMap((b) => b.share.map((v, i) => ({ b, i, v })));
    f.g.selectAll(null).data(cells).join("rect").attr("x", (c) => x(c.i)).attr("y", (c) => y(c.b.month)).attr("width", x.bandwidth())
      .attr("height", y.bandwidth()).attr("rx", 2).attr("fill", (c) => col(c.v))
      .on("pointermove click", (ev, c) => showTip(ev, `<b>${day(parse(c.b.month))}: ${esc(T[c.i].name)}</b>${Math.round(c.v)} of every 100 parts of the stream's ${fmtInt(c.b.n)} chunks`))
      .on("pointerleave", hideTip);
  }

  function map() {
    const el = document.getElementById("tt-map"), T = D.topics, Pt = D.points;
    const w = Math.max(300, el.clientWidth || 640), h = Math.min(560, Math.max(320, w * 0.75)), m = { t: 8, r: 8, b: 8, l: 8 };
    const f = frame(el, h, m);
    const x = d3.scaleLinear([0, 1], [0, f.iw]), y = d3.scaleLinear([0, 1], [f.ih, 0]);
    const r = w < 480 ? 2.2 : 2.8;
    const dots = f.g.selectAll(null).data(Pt).join("circle").attr("cx", (p) => x(p[0])).attr("cy", (p) => y(p[1])).attr("r", r)
      .attr("fill", (p) => COL[p[2]]).attr("fill-opacity", 0.7)
      .on("pointerenter click", (ev, p) => {
        dots.attr("stroke", null); d3.select(ev.currentTarget).attr("stroke", INK).attr("stroke-width", 1.5).raise();
        showTip(ev, `<b>${esc(T[p[2]].name)}</b>${p[3]} of 100 parts of this chunk. Stream of ${day(parse(p[4]))}.`);
      })
      .on("pointerleave", () => { dots.attr("stroke", null); hideTip(); });
    T.forEach((t, k) => {   // each topic's name at the middle of its dots
      const P = Pt.filter((p) => p[2] === k); if (P.length < 15) return;
      const cx = x(d3.median(P, (p) => p[0])), cy = y(d3.median(P, (p) => p[1]));
      f.g.append("text").attr("x", cx).attr("y", cy).attr("text-anchor", "middle").attr("dy", "0.35em").attr("pointer-events", "none")
        .attr("font-size", w < 480 ? 10 : 12).attr("font-weight", 600).attr("fill", INK)
        .attr("paint-order", "stroke").attr("stroke", "#fff").attr("stroke-width", 3.5).text(t.name.replace(/, mixed with TV talk$/, ""));
    });
    const lg = d3.select("#tt-legend").html("");
    T.forEach((t, i) => { const s = lg.append("span").style("white-space", "nowrap"); s.append("span").attr("class", "sw").style("background", COL[i]); s.append("span").text(`${t.name} (${fmtInt(t.n)}) `); });
  }

  function words() {
    const el = document.getElementById("tt-words"); el.innerHTML = "";
    D.topics.forEach((t, i) => {
      const box = el.appendChild(document.createElement("div")); box.className = "tt-w";
      const hd = box.appendChild(document.createElement("p")); hd.className = "tt-wh"; hd.style.color = COL[i]; hd.textContent = t.name;
      const W = t.words, w = 230, rh = 17, lw = 92, h = rh * W.length;
      const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
      const x = d3.scaleLinear([0, d3.max(W, (d) => d[1])], [0, w - lw - 4]);
      W.forEach((d, j) => {
        svg.append("text").attr("x", lw - 6).attr("y", j * rh + rh / 2).attr("dy", "0.35em").attr("text-anchor", "end").attr("font-size", 11).attr("fill", INK).text(d[0]);
        svg.append("rect").attr("x", lw).attr("y", j * rh + 3).attr("height", rh - 6).attr("width", x(d[1])).attr("rx", 2).attr("fill", COL[i]);
      });
    });
  }

  Promise.all([d3.json("/visualizations/data/twitch_topics.json?v=20261109a"), d3.json("/visualizations/data/twitch_events.json?v=20261109c")]).then(([d, E]) => {
    D = d; timeline(E); grid(); map(); words();
    let wd = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== wd) { wd = window.innerWidth; timeline(E); grid(); map(); } });
  });
})();
