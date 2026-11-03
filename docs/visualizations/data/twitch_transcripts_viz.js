// Dashboard for Twitch Transcripts: hours, topic rates and top words by stream.
// Data: twitch_transcripts.json, built by scripts/build_twitch_transcripts.py (aggregates only).
(function () {
  const INK = "#2a2340", MUTED = "#625a7a", LIGHT = "#cfe3f7", BAR = "#f4a6c0", FOCUS = "#7461c4";
  const tip = document.getElementById("tw-tip");
  const fmt1 = d3.format(".1f"), fmtInt = d3.format(",");
  const short = (s) => s.label.replace(/^\w+ /, "");          // "Oct 26"
  const tick = (s, narrow) => (narrow ? +s.date.slice(5, 7) + "/" + +s.date.slice(8) : short(s));
  const hm = (sec) => `${Math.floor(sec / 3600)} h ${String(Math.round(sec % 3600 / 60)).padStart(2, "0")} min`;
  const day = (s) => s.label.slice(0, 3);                     // "Mon"

  function showTip(ev, html) {
    tip.innerHTML = html;
    tip.hidden = false;
    const r = tip.getBoundingClientRect(), pad = 12;
    let x = ev.pageX + pad, y = ev.pageY - r.height - pad;
    if (x + r.width > window.scrollX + document.documentElement.clientWidth - 4) x = ev.pageX - r.width - pad;
    if (x < window.scrollX + 4) x = window.scrollX + 4;
    if (y < window.scrollY + 4) y = ev.pageY + pad;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  document.addEventListener("touchstart", (e) => { if (!e.target.closest(".tw-chart")) hideTip(); }, { passive: true });

  function frame(el, h, m) {
    const w = Math.max(300, el.clientWidth || 640);
    el.innerHTML = "";
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    return { svg, w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`) };
  }

  function xAxis(g, x, S, ih) {
    const narrow = x.step() < 56;
    const ax = g.append("g").attr("class", "ax").attr("transform", `translate(0,${ih})`);
    ax.append("line").attr("x2", x.range()[1]);
    S.forEach((s) => {
      const t = ax.append("text").attr("x", x(s.label) + x.bandwidth() / 2).attr("text-anchor", "middle");
      t.append("tspan").attr("x", x(s.label) + x.bandwidth() / 2).attr("dy", "1.3em").text(day(s));
      t.append("tspan").attr("x", x(s.label) + x.bandwidth() / 2).attr("dy", "1.2em").text(tick(s, narrow));
    });
  }

  function yAxis(g, y, iw, title) {
    const ax = g.append("g").attr("class", "ax grid");
    y.ticks(5).forEach((v) => {
      ax.append("line").attr("x2", iw).attr("y1", y(v)).attr("y2", y(v));
      ax.append("text").attr("x", -6).attr("y", y(v)).attr("dy", "0.32em").attr("text-anchor", "end").text(v);
    });
    g.append("text").attr("class", "axt").attr("x", -34).attr("y", -12).text(title);
  }

  function bars(g, x, y, S, val, color, ih) {
    return g.selectAll(null).data(S).join("path").attr("fill", color)
      .attr("d", (s) => roundTop(x(s.label), y(val(s)), x.bandwidth(), ih - y(val(s))));
  }

  function roundTop(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function hours(D) {
    const S = D.streams, T = D.totals, el = document.getElementById("tw-hours");
    const share = Math.round(T.speech_h / T.stream_h * 100);
    const longest = S.reduce((a, b) => (b.stream_h > a.stream_h ? b : a));
    document.getElementById("tw-h1").textContent =
      `${S.length} streams had ${fmt1(T.speech_h)} hours of speech in ${fmt1(T.stream_h)} hours of stream time.`;
    const tiles = [[S.length, "streams, " + short(S[0]) + " to " + short(S[S.length - 1]) + ", 2026"],
      [fmt1(T.stream_h), "hours of stream audio transcribed"], [fmt1(T.speech_h), "hours of speech"],
      [fmtInt(T.words), "words transcribed"]];
    const tl = document.getElementById("tw-tiles");
    tl.innerHTML = "";
    tiles.forEach(([v, l]) => {
      const d = tl.appendChild(document.createElement("div"));
      d.className = "tw-tile";
      d.appendChild(document.createElement("b")).textContent = v;
      d.appendChild(document.createElement("span")).textContent = l;
    });
    const per = S.map((s) => s.speech_h / s.stream_h);
    document.getElementById("tw-p1").textContent =
      `Speech filled ${share} of every 100 minutes of stream time. By stream, it ranged from ${Math.round(d3.min(per) * 100)} to ${Math.round(d3.max(per) * 100)} of every 100 minutes. ` +
      `The longest stream ran ${fmt1(longest.stream_h)} hours, on ${longest.label}.`;

    const m = { t: 26, r: 8, b: 40, l: 34 };
    const f = frame(el, 250, m);
    const x = d3.scaleBand(S.map((s) => s.label), [0, f.iw]).padding(0.28);
    const y = d3.scaleLinear([0, Math.ceil(d3.max(S, (s) => s.stream_h) / 2) * 2], [f.ih, 0]);
    yAxis(f.g, y, f.iw, "Hours");
    bars(f.g, x, y, S, (s) => s.stream_h, LIGHT, f.ih);
    const inset = Math.min(6, x.bandwidth() * 0.18);
    f.g.selectAll(null).data(S).join("path").attr("fill", FOCUS)
      .attr("d", (s) => roundTop(x(s.label) + inset, y(s.speech_h), x.bandwidth() - 2 * inset, f.ih - y(s.speech_h)));
    xAxis(f.g, x, S, f.ih);
    f.g.selectAll(null).data(S).join("rect").attr("class", "hit")
      .attr("x", (s) => x(s.label) - x.step() * x.paddingInner() / 2).attr("width", x.step()).attr("y", 0).attr("height", f.ih)
      .on("pointermove click", (ev, s) => showTip(ev, `<b>${s.label}, 2026</b>Stream length: ${hm(s.stream_s)}<br>Speech: ${hm(s.speech_s)} (${Math.round(s.speech_s / s.stream_s * 100)} of every 100 minutes)<br>Words: ${fmtInt(s.words)}`))
      .on("pointerleave", hideTip);
  }

  function topics(D) {
    const S = D.streams, el = document.getElementById("tw-topics"), tabs = document.getElementById("tw-topic");
    let cur = D.topics[0].key;
    D.topics.forEach((t, i) => {
      const b = tabs.appendChild(document.createElement("button"));
      b.type = "button"; b.setAttribute("role", "tab"); b.dataset.v = t.key; b.textContent = t.label;
      b.setAttribute("aria-selected", i === 0); b.tabIndex = i === 0 ? 0 : -1;
    });
    const btns = [...tabs.querySelectorAll("button")];
    function select(k, focus) {
      cur = k;
      btns.forEach((b) => { const on = b.dataset.v === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      draw();
    }
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.v); });
    tabs.addEventListener("keydown", (e) => {
      const i = btns.findIndex((b) => b.dataset.v === cur);
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      select(btns[(j + btns.length) % btns.length].dataset.v, true);
    });
    const yMax = d3.max(S, (s) => d3.max(D.topics, (t) => s.topics[t.key]));
    function draw() {
      const t = D.topics.find((d) => d.key === cur), v = (s) => s.topics[cur];
      const hi = S.reduce((a, b) => (v(b) > v(a) ? b : a)), lo = S.reduce((a, b) => (v(b) < v(a) ? b : a));
      document.getElementById("tw-h2").textContent =
        `${t.noun} came up most often on ${hi.label}, ${fmt1(v(hi))} times per 10,000 words.`;
      document.getElementById("tw-p2").textContent =
        `The lowest rate was on ${lo.label}, ${fmt1(v(lo))} times per 10,000 words. All tabs share one scale. Words counted: ${t.words.join(", ")}.`;
      const m = { t: 26, r: 8, b: 40, l: 34 };
      const f = frame(el, 250, m);
      const x = d3.scaleBand(S.map((s) => s.label), [0, f.iw]).padding(0.28);
      const y = d3.scaleLinear([0, Math.ceil(yMax / 10) * 10], [f.ih, 0]);
      yAxis(f.g, y, f.iw, "Times per 10,000 words");
      bars(f.g, x, y, S, v, (s) => (s === hi ? FOCUS : BAR), f.ih);
      f.g.append("text").attr("class", "val").attr("x", x(hi.label) + x.bandwidth() / 2).attr("y", y(v(hi)) - 5)
        .attr("text-anchor", "middle").text(fmt1(v(hi)));
      xAxis(f.g, x, S, f.ih);
      f.g.selectAll(null).data(S).join("rect").attr("class", "hit")
        .attr("x", (s) => x(s.label) - x.step() * x.paddingInner() / 2).attr("width", x.step()).attr("y", 0).attr("height", f.ih)
        .on("pointermove click", (ev, s) => showTip(ev, `<b>${s.label}, 2026: ${t.label}</b>${fmtInt(s.topics_n[cur])} times, ${fmt1(v(s))} per 10,000 words`))
        .on("pointerleave", hideTip);
    }
    return draw;
  }

  // The grid has two views: word pairs (default) and single words. Both share the drawing code.
  const VIEWS = {
    pairs: { tab: "Word pairs", list: "top_pairs", rate: "pairs", count: "pairs_n",
      head: (W, S) => `"${W[0].label}" was the most frequent word pair over the ${S.length} streams, spoken ${fmtInt(W[0].n)} times.`,
      body: (W) => `The grid shows the ${W.length} most frequent word pairs. A word pair is two words spoken one after the other, neither of them a common English word. ` +
        `Each cell gives how often the pair was spoken per 10,000 words in that stream. Haley Stevens and Mike Rogers are Michigan politicians. A hype train is a Twitch feature that viewers start by subscribing or donating.`,
      aria: "Grid of the 12 most frequent word pairs by stream. Darker cells mean the pair was spoken more often per 10,000 words." },
    words: { tab: "Single words", list: "top_words", rate: "top", count: "top_n",
      head: (W, S) => `"${W[0].label}" was the most frequent word over the ${S.length} streams, spoken ${fmtInt(W[0].n)} times.`,
      body: (W) => `The grid shows the ${W.length} most frequent words after common English words were removed. Each cell gives how often the word was spoken per 10,000 words in that stream. ` +
        `El-Sayed, Rogers and Stevens are the Michigan politicians Abdul El-Sayed, Mike Rogers and Haley Stevens.`,
      aria: "Grid of the 12 most frequent words by stream. Darker cells mean the word was spoken more often per 10,000 words." },
  };

  function wordTabs(redraw) {
    const tabs = document.getElementById("tw-wview");
    if (tabs.childElementCount) return;
    Object.entries(VIEWS).forEach(([k, v], i) => {
      const b = tabs.appendChild(document.createElement("button"));
      b.type = "button"; b.setAttribute("role", "tab"); b.dataset.v = k; b.textContent = v.tab;
      b.setAttribute("aria-selected", i === 0); b.tabIndex = i === 0 ? 0 : -1;
    });
    const btns = [...tabs.querySelectorAll("button")];
    const select = (k, focus) => {
      wordView = k;
      btns.forEach((b) => { const on = b.dataset.v === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      redraw();
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.v); });
    tabs.addEventListener("keydown", (e) => {
      const i = btns.findIndex((b) => b.dataset.v === wordView);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        select(btns[(i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length].dataset.v, true);
      }
    });
  }

  let wordView = "pairs";
  function words(D) {
    wordTabs(() => words(D));
    const V = VIEWS[wordView], S = D.streams, W = D[V.list], el = document.getElementById("tw-words");
    el.innerHTML = "";
    el.setAttribute("aria-label", V.aria);
    document.getElementById("tw-h3").textContent = V.head(W, S);
    document.getElementById("tw-p3").textContent = V.body(W);
    const narrow = (el.clientWidth || 640) < 480;
    const lw = wordView === "pairs" ? (narrow ? 136 : 150) : (narrow ? 74 : 96);
    const m = { t: 34, r: 4, b: 4, l: lw };
    const rowH = narrow ? 26 : 28;
    const f = frame(el, m.t + m.b + rowH * W.length, m);
    const x = d3.scaleBand(S.map((s) => s.label), [0, f.iw]).padding(0.06);
    const y = d3.scaleBand(W.map((w) => w.key), [0, f.ih]).padding(0.08);
    const vmax = d3.max(S, (s) => d3.max(W, (w) => s[V.rate][w.key]));
    const col = d3.scaleLinear([0, vmax], ["#f6f1fb", FOCUS]).interpolate(d3.interpolateLab);
    const hx = f.g.append("g").attr("class", "ax");
    S.forEach((s) => {
      const t = hx.append("text").attr("text-anchor", "middle");
      t.append("tspan").attr("x", x(s.label) + x.bandwidth() / 2).attr("y", -20).text(day(s));
      t.append("tspan").attr("x", x(s.label) + x.bandwidth() / 2).attr("y", -7).text(tick(s, narrow));
    });
    f.g.selectAll(null).data(W).join("text").attr("class", "wl").attr("x", -8)
      .attr("y", (w) => y(w.key) + y.bandwidth() / 2).attr("dy", "0.35em").attr("text-anchor", "end").text((w) => w.label);
    const cells = S.flatMap((s) => W.map((w) => ({ s, w, v: s[V.rate][w.key], n: s[V.count][w.key] })));
    f.g.selectAll(null).data(cells).join("rect")
      .attr("x", (c) => x(c.s.label)).attr("y", (c) => y(c.w.key)).attr("width", x.bandwidth()).attr("height", y.bandwidth())
      .attr("rx", 3).attr("fill", (c) => col(c.v))
      .on("pointermove click", (ev, c) => showTip(ev, `<b>"${c.w.label}", ${c.s.label}, 2026</b>${fmtInt(c.n)} times, ${fmt1(c.v)} per 10,000 words`))
      .on("pointerleave", hideTip);
    if (!narrow) {
      f.g.selectAll(null).data(cells).join("text").attr("class", "cell-lbl")
        .attr("x", (c) => x(c.s.label) + x.bandwidth() / 2).attr("y", (c) => y(c.w.key) + y.bandwidth() / 2)
        .attr("dy", "0.35em").attr("text-anchor", "middle").attr("fill", (c) => (c.v > vmax * 0.55 ? "#fff" : INK))
        .text((c) => fmt1(c.v));
    }
    legend(col, vmax);
  }

  function legend(col, vmax) {
    const el = document.getElementById("tw-wlegend"), n = 5;
    el.innerHTML = "";
    el.appendChild(document.createTextNode("Times per 10,000 words: "));
    for (let i = 0; i < n; i++) {
      const v = vmax * i / (n - 1), sw = el.appendChild(document.createElement("span"));
      sw.className = "sw"; sw.style.background = col(v);
      el.appendChild(document.createTextNode(Math.round(v)));
    }
  }

  d3.json("/visualizations/data/twitch_transcripts.json?v=20261103d").then((D) => {
    let drawTopics;
    const all = () => { hours(D); if (!drawTopics) drawTopics = topics(D); else drawTopics(); words(D); };
    all();
    drawTopics();
    let w = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== w) { w = window.innerWidth; all(); } });
  });
})();
