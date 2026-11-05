// Words near a word, across all coded meeting stretches. Data: bay_area_near.json, built by
// scripts/build_bay_near.py from the published, redacted transcripts (counts only).
(function () {
  const INK = "#2a1a10", BAR = "#c2410c";
  const tip = document.getElementById("bp-tip");
  const fmt1 = d3.format(".1f"), fmtInt = d3.format(",");
  function showTip(ev, html) {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad, y = ev.pageY - r.height - pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    if (y < window.scrollY + 4) y = ev.pageY + pad;
    tip.style.left = Math.max(window.scrollX + 4, x) + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  let V = null, qWord = "housing";

  function draw() {
    const el = document.getElementById("bn-chart"), q = document.getElementById("bn-q"), tabs = document.getElementById("bn-tabs");
    const head = document.getElementById("bn-h"), body = document.getElementById("bn-p");
    const lab = (w) => V.labels[w] || w;
    if (!q.dataset.ready) {
      q.dataset.ready = 1; q.value = qWord;
      const dl = document.getElementById("bn-list"), order = Object.keys(V.words).sort((a, b) => V.words[b][0] - V.words[a][0]);
      q.addEventListener("input", () => {
        const t = q.value.trim().toLowerCase().replace(/[’']s$/, ""); dl.innerHTML = "";
        if (t.length >= 2) order.filter((w) => w.startsWith(t)).slice(0, 12).forEach((w) => { dl.appendChild(document.createElement("option")).value = w; });
        qWord = t; draw();
      });
      V.presets.forEach((w) => { const b = tabs.appendChild(document.createElement("button")); b.type = "button"; b.setAttribute("role", "tab"); b.dataset.v = w; b.textContent = lab(w); });
      tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { qWord = b.dataset.v; q.value = qWord; draw(); } });
    }
    tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b.dataset.v === qWord));
    el.innerHTML = "";
    const w = qWord, e = V.words[w];
    if (!w) { head.textContent = "Type a word to see the words said near it"; body.textContent = ""; return; }
    if (!e) {
      head.textContent = `"${w}" was said fewer than ${V.min} times, or is left out`;
      body.textContent = `Only words said at least ${V.min} times are included. Common short words, words about running the meeting, and names of people and places are left out. Try another word.`;
      return;
    }
    const n = e[0], W = e[1].map(([x, k]) => ({ label: lab(x), n: k, share: 100 * k / n }));
    head.textContent = W.length ? `"${lab(w)}" was said ${fmtInt(n)} times. "${W[0].label}" came within ${V.window} words of it in ${Math.round(W[0].share)} of every 100 mentions`
      : `"${lab(w)}" was said ${fmtInt(n)} times`;
    body.textContent = `Across all coded meeting stretches, "${lab(w)}" was said ${fmt1(n / V.tokens * 1e4)} times per 10,000 words. Each bar shows how many of every 100 mentions had that word within ${V.window} words before or after it. A word counts once per mention. Common short words, words about running the meeting, and names of people and places are left out.`;
    const width = Math.max(300, el.clientWidth || 640), narrow = width < 480, lw = narrow ? 100 : 130, rowH = 26;
    const m = { t: 6, r: 74, b: 22, l: lw }, h = m.t + m.b + rowH * W.length, iw = width - m.l - m.r, ih = h - m.t - m.b;
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${width} ${h}`), g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
    const x = d3.scaleLinear([0, d3.max(W, (d) => d.share) || 1], [0, iw]).nice(), y = d3.scaleBand(W.map((d, i) => i), [0, ih]).padding(0.18);
    const ax = g.append("g").attr("class", "ax").attr("transform", `translate(0,${ih})`);
    x.ticks(4).forEach((v) => { ax.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", -ih).attr("stroke", "#efeae3");
      ax.append("text").attr("x", x(v)).attr("y", 14).attr("text-anchor", "middle").text(v); });
    g.selectAll(null).data(W).join("text").attr("class", "wl").attr("x", -8).attr("y", (d, i) => y(i) + y.bandwidth() / 2)
      .attr("dy", "0.35em").attr("text-anchor", "end").text((d) => d.label);
    g.selectAll(null).data(W).join("rect").attr("x", 0).attr("y", (d, i) => y(i)).attr("height", y.bandwidth()).attr("rx", 3)
      .attr("fill", BAR).attr("width", (d) => x(d.share))
      .on("pointermove click", (ev, d) => showTip(ev, `<b>"${d.label}" near "${lab(w)}"</b>${fmtInt(d.n)} of ${fmtInt(n)} mentions, ${fmt1(d.share)} of every 100`))
      .on("pointerleave", hideTip);
    g.selectAll(null).data(W).join("text").attr("x", (d) => x(d.share) + 6).attr("y", (d, i) => y(i) + y.bandwidth() / 2)
      .attr("dy", "0.35em").attr("font-size", 11).attr("fill", INK).text((d) => `${fmt1(d.share)} of 100`);
  }

  d3.json("/visualizations/data/bay_area_near.json?v=20261105a").then((v) => {
    V = v; draw();
    let wd = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== wd) { wd = window.innerWidth; draw(); } });
  });
})();
