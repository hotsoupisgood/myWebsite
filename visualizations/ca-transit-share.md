---
title: California transit commuting
description: Share of workers who commuted by public transportation, by California county, 2020 to 2024.
date: 2026-10-03
layout: layouts/post.njk
---

<figure class="viz" id="ca-transit-viz">
  <div class="ca-card">
    <div class="ca-tabs-wrap"><span class="ca-tabs-label" id="ca-tabs-label">Statistic</span>
      <div class="ca-tabs" id="ca-metric" role="tablist" aria-labelledby="ca-tabs-label">
        <button type="button" role="tab" data-v="transit" aria-selected="true" tabindex="0">Transit</button>
        <button type="button" role="tab" data-v="novehicle" aria-selected="false" tabindex="-1">No car</button>
        <button type="button" role="tab" data-v="commute" aria-selected="false" tabindex="-1">Commute</button>
        <button type="button" role="tab" data-v="lowwage" aria-selected="false" tabindex="-1">Low earners</button>
        <button type="button" role="tab" data-v="renter" aria-selected="false" tabindex="-1">Renters</button>
      </div>
    </div>
  </div>
  <p class="ca-note" id="ca-note"></p>
  <div class="ca-mapwrap">
  <div id="ca-map" role="img" aria-label="Map of California counties. Hover or tap a county to show bars for the selected statistic in that county and its neighbors."></div>
    <div class="ca-checks ca-checks-below ca-checks-in">
      <label class="viz-toggle"><input type="checkbox" id="ca-top5" checked> Always show the 5 highest counties</label>
      <label class="viz-toggle"><input type="checkbox" id="ca-bottom5" checked> Always show the 5 lowest counties</label>
    </div>
  </div>
</figure>

<div class="ca-tables">
  <table id="ca-top"><caption>Highest 5 counties</caption><thead><tr><th>County</th><th class="vh">Of 100 workers</th><th class="nh">Workers</th></tr></thead><tbody></tbody></table>
  <table id="ca-bottom"><caption>Lowest 5 counties</caption><thead><tr><th>County</th><th class="vh">Of 100 workers</th><th class="nh">Workers</th></tr></thead><tbody></tbody></table>
</div>

## References

<div class="references">

U.S. Census Bureau. (2025). *Means of transportation to work* (American Community Survey 5-year estimates, 2020 to 2024, Table B08301) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08301.dat

U.S. Census Bureau. (2025). *Household size by vehicles available* (American Community Survey 5-year estimates, 2020 to 2024, Table B08201) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08201.dat

U.S. Census Bureau. (2025). *Aggregate travel time to work (in minutes) of workers by sex* (American Community Survey 5-year estimates, 2020 to 2024, Table B08013) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08013.dat

U.S. Census Bureau. (2025). *Travel time to work* (American Community Survey 5-year estimates, 2020 to 2024, Table B08303) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08303.dat

U.S. Census Bureau. (2025). *Means of transportation to work by workers' earnings in the past 12 months (in 2024 inflation-adjusted dollars)* (American Community Survey 5-year estimates, 2020 to 2024, Table B08119) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08119.dat

U.S. Census Bureau. (2025). *Tenure* (American Community Survey 5-year estimates, 2020 to 2024, Table B25003) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b25003.dat

U.S. Census Bureau. (2024). *Cartographic boundary files, counties* [Data set], via Bostock, M. *us-atlas* (Version 3). https://github.com/topojson/us-atlas

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1rem auto 1.5rem; max-width: 44rem; }
#ca-map { width: 100%; }
.ca-card { background: #fdf6ea; border: 1px solid #ead9bd; border-radius: 12px; padding: .9rem 1.1rem; margin-bottom: .6rem; display: flex; flex-wrap: wrap; align-items: flex-end; gap: .5rem 1.5rem; }
.ca-tabs-wrap { display: flex; flex-direction: column; gap: .3rem; flex: 1 1 100%; min-width: 0; max-width: 100%; }
.ca-card { min-width: 0; max-width: 100%; box-sizing: border-box; }
.ca-card > * { min-width: 0; }
.ca-tabs-label { font-size: .8rem; font-weight: 600; color: #6b5440; }
.ca-tabs { display: flex; justify-content: space-between; gap: .4rem; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 2px; }
.ca-tabs::-webkit-scrollbar { display: none; }
.ca-tabs button { flex: none; font: inherit; font-size: .92rem; min-height: 40px; padding: .35rem .95rem; border: 1px solid #d4b483; border-radius: 999px; background: #fffaf3; color: #2a1a10; cursor: pointer; white-space: nowrap; }
.ca-tabs button:hover { background: #f8e6cc; }
.ca-tabs button[aria-selected="true"] { background: #c2410c; border-color: #c2410c; color: #fff; font-weight: 600; }
.ca-tabs button:focus-visible { outline: 2px solid #8a2d08; outline-offset: 2px; }
.ca-checks { display: flex; flex-direction: column; flex: 0 1 auto; }
.ca-checks-below { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 0 1.5rem; margin: .4rem 0 0; }
.ca-checks-below .viz-toggle { font-size: .85rem; color: #6b5440; }
.ca-mapwrap { position: relative; }
@media (min-width: 560px) {
  .ca-checks-in { position: absolute; left: .4rem; bottom: .6rem; flex-direction: column; align-items: flex-start; gap: 0; margin: 0; padding: .3rem .7rem; background: rgba(253, 246, 234, .92); border: 1px solid #ead9bd; border-radius: 10px; }
  .ca-checks-in .viz-toggle { min-height: 32px; font-size: .8rem; }
}
.viz-toggle { display: flex; align-items: center; gap: .55rem; min-height: 40px; font-size: .9rem; cursor: pointer; color: #2a1a10; }
.viz-toggle input { accent-color: #c2410c; width: 1.15rem; height: 1.15rem; margin: 0; flex: none; }
.ca-note { font-size: .85rem; color: #6b5440; margin: 0 0 .4rem; }
@media (max-width: 480px) { .ca-card { flex-direction: column; align-items: stretch; padding: .8rem .9rem; } }
#ca-map svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
#ca-map .county { fill: #f1e3c8; stroke: #fffaf0; stroke-width: 0.6; stroke-linejoin: round; cursor: pointer; }
#ca-map .county.nb { fill: #f5d6aa; }
#ca-map .county.on { fill: #efbe8a; }
#ca-map .slab { fill: #d4b483; }
#ca-map .shadow { fill: #5a3a1a; opacity: 0.18; }
#ca-map .outline { fill: none; stroke: #b8400e; stroke-width: 1.6; stroke-linejoin: round; pointer-events: none; }
#ca-map .bar { pointer-events: none; }
#ca-map .lbl { pointer-events: none; font-size: 11px; fill: #2a1a10; paint-order: stroke; stroke: #fffaf3; stroke-width: 3.5px; stroke-linejoin: round; }
#ca-map .lbl.main { font-weight: 700; font-size: 12px; }
#ca-map .lead { stroke: #6b5440; stroke-width: 0.7; pointer-events: none; }
.ca-tables { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1.5rem; max-width: 44rem; margin: 0 auto 2rem; }
.ca-tables table { flex: 1 1 16rem; border-collapse: collapse; font-size: .9rem; margin: 0 !important; }
.ca-tables caption { text-align: left; font-weight: 700; padding-bottom: .4rem; }
.ca-tables th, .ca-tables td { padding: .3rem .5rem; border-bottom: 1px solid #ead9bd; text-align: left; }
.ca-tables th { font-weight: 600; color: #6b5440; border-bottom: 2px solid #d4b483; }
.ca-tables td:nth-child(n+2), .ca-tables th:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/topojson-client.min.js"></script>
<script>
(function () {
  var el = document.getElementById("ca-map");
  Promise.all([
    d3.json("/visualizations/data/ca-counties-10m.json"),
    d3.json("/visualizations/data/ca_commute_metrics_2020_2024.json")
  ]).then(function (res) {
    var topo = res[0], rows = res[1];
    var byFips = {};
    rows.forEach(function (r) { byFips[r.fips] = r; });
    var METRICS = {
      transit: { unit: " of 100", head: "Of 100 workers", count: "Workers", what: "transit commuters",
        note: "Workers age 16 and over who commuted by public transportation, of every 100 workers. Taxis are not counted." },
      novehicle: { unit: " of 100", head: "Of 100 households", count: "Households", what: "households with no vehicle",
        note: "Households with no car, van or truck available, of every 100 households." },
      commute: { unit: " minutes", head: "Minutes, one way", count: "Workers", what: "one-way commute time",
        note: "Average one-way travel time to work in minutes, for workers who did not work from home." },
      lowwage: { unit: " of 100", head: "Of 100 workers", count: "Workers", what: "transit commuters earning under $25,000",
        note: "Workers who earned under $25,000 in the past 12 months and commuted by public transportation, of every 100 such workers." },
      renter: { unit: " of 100", head: "Of 100 households", count: "Households", what: "households that rent",
        note: "Occupied homes where the household rents rather than owns, of every 100 occupied homes." }
    };
    var tabsEl = document.getElementById("ca-metric");
    var tabBtns = Array.prototype.slice.call(tabsEl.querySelectorAll("button"));
    var sel = { value: "transit", onchange: null };
    function pickTab(b, focus) {
      tabBtns.forEach(function (x) { var on = x === b; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; });
      if (focus) b.focus();
      var l = b.offsetLeft - tabsEl.offsetLeft, r = l + b.offsetWidth;
      if (l < tabsEl.scrollLeft) tabsEl.scrollLeft = l - 8; else if (r > tabsEl.scrollLeft + tabsEl.clientWidth) tabsEl.scrollLeft = r - tabsEl.clientWidth + 8;
      if (sel.value === b.dataset.v) return;
      sel.value = b.dataset.v;
      if (sel.onchange) sel.onchange();
    }
    tabBtns.forEach(function (b, k) {
      b.addEventListener("click", function () { pickTab(b, false); });
      b.addEventListener("keydown", function (ev) {
        var n = ev.key === "ArrowRight" ? k + 1 : ev.key === "ArrowLeft" ? k - 1 : ev.key === "Home" ? 0 : ev.key === "End" ? tabBtns.length - 1 : null;
        if (n === null) return;
        ev.preventDefault(); pickTab(tabBtns[(n + tabBtns.length) % tabBtns.length], true);
      });
    });
    var metric = sel.value;
    function mv(r) { return r[metric].value; }
    function fmt(v) { return v.toFixed(1) + METRICS[metric].unit; }
    function fill(id, list) {
      d3.select("#" + id + " tbody").selectAll("tr").data(list).join("tr").html(function (r) {
        return "<td>" + r.county.replace(/ County$/, "") + "</td><td>" + fmt(mv(r)) + "</td><td>" + d3.format(",")(r[metric].den) + "</td>";
      });
    }
    function tables() {
      var M = METRICS[metric];
      var sorted = rows.slice().sort(function (a, b) { return mv(b) - mv(a) || b[metric].den - a[metric].den; });
      fill("ca-top", sorted.slice(0, 5));
      fill("ca-bottom", sorted.slice(-5).reverse());
      d3.select("#ca-top caption").text("Highest 5 counties, " + M.what);
      d3.select("#ca-bottom caption").text("Lowest 5 counties, " + M.what);
      d3.selectAll(".ca-tables .vh").text(M.head);
      d3.selectAll(".ca-tables .nh").text(M.count);
      document.getElementById("ca-note").textContent = M.note;
    }
    tables();
    var geoms = topo.objects.counties.geometries;
    var feats = topojson.feature(topo, topo.objects.counties).features;
    var nbrs = topojson.neighbors(geoms);
    var maxV;
    var state = { i: null };
    var box = document.getElementById("ca-top5");
    var box2 = document.getElementById("ca-bottom5");
    var top5, bottom5;
    function rank() {
      maxV = d3.max(rows, mv);
      var ranked = feats.map(function (f, k) { return k; })
        .sort(function (a, b) { var A = byFips[feats[a].id], Bq = byFips[feats[b].id]; return mv(Bq) - mv(A) || Bq[metric].den - A[metric].den; });
      top5 = ranked.slice(0, 5); bottom5 = ranked.slice(-5);
    }
    rank();
    // vertical room is sized for the tallest bar of any statistic, so the map does not move on a switch
    var maxAll = {};
    Object.keys(METRICS).forEach(function (m) { maxAll[m] = d3.max(rows, function (r) { return r[m].value; }); });
    function relMax(f) { var r = byFips[f.id]; return d3.max(Object.keys(METRICS), function (m) { return r[m].value / maxAll[m]; }); }

    var TILT = 50 * Math.PI / 180; // camera elevation above the table
    var land = topojson.merge(topo, geoms);
    function draw() {
      el.innerHTML = "";
      var W = Math.max(300, el.clientWidth);
      var small = W < 480;
      var fc = { type: "FeatureCollection", features: feats };
      var B = 1000;
      var base = d3.geoConicEqualArea().parallels([34, 40.5]).rotate([120, 0]).fitSize([B, B], fc);
      var bb0 = d3.geoPath(base).bounds(fc), front = bb0[1][1], cx0 = (bb0[0][0] + bb0[1][0]) / 2;
      var D = 1.4 * B, sinT = Math.sin(TILT), cosT = Math.cos(TILT);
      function tiltRaw(x, y) {
        var back = front - y;            // distance from the near edge, on the table
        var sc = D / (D + back * cosT);  // farther points are smaller
        return [cx0 + (x - cx0) * sc, front - back * sinT * sc];
      }
      var k = 1, tx = 0, ty = 0;
      function tiltPt(x, y) { var q = tiltRaw(x, y); return [q[0] * k + tx, q[1] * k + ty]; }
      var tf = d3.geoTransform({ point: function (x, y) { var q = tiltPt(x, y); this.stream.point(q[0], q[1]); } });
      var proj = { stream: function (st) { return base.stream(tf.stream(st)); } };
      var path = d3.geoPath(proj);
      var rb = path.bounds(fc);
      var edge = small ? 5 : 7, pad = 6;
      var maxH = W * (small ? 0.36 : 0.30);
      k = (W - 2 * pad) / (rb[1][0] - rb[0][0]);
      tx = pad - rb[0][0] * k;
      ty = -rb[0][1] * k;
      var bpath = d3.geoPath(base);
      var pts = feats.map(function (f) {
        var c = bpath.centroid(f);
        if (!d3.geoContains(f, base.invert(c))) {
          var b = bpath.bounds(f), best = null, bd = -1;
          for (var gx = 0; gx <= 12; gx++) for (var gy = 0; gy <= 12; gy++) {
            var p = [b[0][0] + (b[1][0] - b[0][0]) * gx / 12, b[0][1] + (b[1][1] - b[0][1]) * gy / 12];
            if (d3.geoContains(f, base.invert(p))) { var d = -Math.hypot(p[0] - c[0], p[1] - c[1]); if (d > bd || best === null) { bd = d; best = p; } }
          }
          if (best) c = best;
        }
        return tiltPt(c[0], c[1]);
      });
      // room above the map: enough for the tallest bar plus a label at each county
      var top = 12;
      pts.forEach(function (q, i) { top = Math.max(top, maxH * relMax(feats[i]) + 34 - q[1]); });
      ty += top;
      pts.forEach(function (q) { q[1] += top; });
      var H = Math.ceil(top + (rb[1][1] - rb[0][1]) * k + edge + 10);
      var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      var defs = svg.append("defs");
      defs.append("filter").attr("id", "ca-blur").attr("x", "-10%").attr("y", "-10%").attr("width", "120%").attr("height", "120%")
        .append("feGaussianBlur").attr("stdDeviation", 5);
      svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent").on("click", function () { clear(); });
      var landD = path(land);
      svg.append("path").attr("class", "shadow").attr("d", landD).attr("transform", "translate(5," + (edge + 6) + ")").attr("filter", "url(#ca-blur)");
      for (var e = edge; e > 0; e--) svg.append("path").attr("class", "slab").attr("d", landD).attr("transform", "translate(0," + e + ")");
      var counties = svg.append("g").selectAll("path").data(feats).join("path").attr("class", "county").attr("data-fips", function (f) { return f.id; }).attr("d", path)
        .on("pointerenter", function (ev, f) { if (ev.pointerType === "mouse") show(feats.indexOf(f)); })
        .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") clear(); })
        .on("click", function (ev, f) { ev.stopPropagation(); var i = feats.indexOf(f); if (state.i === i && ev.pointerType !== "mouse") clear(); else show(i); });
      var outline = svg.append("path").attr("class", "outline");
      var layer = svg.append("g");
      var h = function (v) { return maxH * v / maxV; };
      var bw = small ? 7 : 9;

      function name(i) { return byFips[feats[i].id].county.replace(/ County$/, ""); }
      function val(i) { return mv(byFips[feats[i].id]); }

      function show(i) {
        state.i = i;
        var hov = i === null ? [] : [i].concat(nbrs[i]);
        var set = hov.slice();
        if (box.checked) top5.forEach(function (k) { if (set.indexOf(k) < 0) set.push(k); });
        if (box2.checked) bottom5.forEach(function (k) { if (set.indexOf(k) < 0) set.push(k); });
        counties.classed("on", function (f, k) { return k === i; }).classed("nb", function (f, k) { return k !== i && hov.indexOf(k) >= 0; });
        outline.attr("d", i === null ? null : path(feats[i]));
        var had = {};
        // current height of every bar on screen, so standing or rising bars resize from where they are
        layer.selectAll("g.bar").each(function () { if (this.__k !== undefined && +d3.select(this).datum() > 0) had[this.__k] = +d3.select(this).datum(); });
        layer.interrupt().selectAll("*").interrupt();
        layer.selectAll("*").remove();
        var t = d3.transition().duration(400).ease(d3.easeCubicOut);
        var items = set.map(function (k, n) {
          var p = pts[k];
          return { k: k, n: n, x: p[0], y: p[1], top: p[1] - h(val(k)), main: k === i,
            text: name(k) + " " + fmt(val(k)) };
        });
        var dx = bw * 0.5, dy = bw * 0.35;
        var COL = { main: ["#c2410c", "#8a2d08", "#e56a32"], nb: ["#f28c38", "#c4661c", "#f9b277"] };
        function barPaths(g, d, hh) {
          var x0 = d.x - bw / 2, x1 = d.x + bw / 2, y0 = d.y, y1 = d.y - hh;
          g.select(".f").attr("d", "M" + x0 + "," + y0 + "H" + x1 + "V" + y1 + "H" + x0 + "Z");
          g.select(".s").attr("d", "M" + x1 + "," + y0 + "L" + (x1 + dx) + "," + (y0 - dy) + "V" + (y1 - dy) + "L" + x1 + "," + y1 + "Z");
          g.select(".c").attr("d", "M" + x0 + "," + y1 + "H" + x1 + "L" + (x1 + dx) + "," + (y1 - dy) + "H" + (x0 + dx) + "Z");
        }
        items.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (d) {
          var col = d.main ? COL.main : COL.nb;
          var g = layer.append("g").attr("class", "bar").datum(0);
          g.append("path").attr("class", "s").attr("fill", col[1]);
          g.append("path").attr("class", "f").attr("fill", col[0]);
          g.append("path").attr("class", "c").attr("fill", col[2]);
          var full = d.y - d.top, node = g.node();
          node.__k = d.k;
          var start = had[d.k] || 0;
          d.keep = start > 0;
          d.grow = d.keep && Math.abs(start - full) > 0.5;
          if (d.keep && !d.grow) { g.datum(full); barPaths(g, d, full); node.__done = true; }
          else {
            g.datum(start); barPaths(g, d, start);
            g.transition(t).duration(d.keep ? 300 : 400).delay(d.keep ? 0 : d.n * 40).tween("h", function () {
              var ip = d3.interpolateNumber(start, full);
              return function (u) { var v = ip(u); g.datum(v); barPaths(g, d, v); };
            }).on("end", function () { node.__done = true; });
          }
          d.g = g;
        });
        // labels: place, then push apart and keep inside the SVG
        var placed = [];
        var barsBox = items.map(function (d) { return { k: d.k, x: d.x - bw / 2 - 1, y: d.y + 1, w: bw + dx + 2, h: d.y - d.top + dy + 2 }; });
        items.slice().sort(function (a, b) { return a.main ? -1 : b.main ? 1 : a.top - b.top; }).forEach(function (d) {
          var tx = layer.append("text").attr("class", "lbl" + (d.main ? " main" : "")).text(d.text).attr("opacity", 0);
          var bb = tx.node().getBBox();
          var lw = bb.width, lh = bb.height;
          var obs = placed.concat(barsBox);
          function free(x, y) {
            if (x < 2 || x + lw > W - 2 || y - lh < 1 || y > H - 2) return false;
            return !obs.some(function (q) { return x < q.x + q.w + 3 && x + lw + 3 > q.x && y - lh < q.y + 3 && y + 1 > q.y - q.h - 3; });
          }
          var x = null, y = null, base = d.top - dy - 7;
          var xs = [d.x - lw / 2, d.x + bw / 2 + dx + 4, d.x - bw / 2 - 4 - lw];
          outer: for (var s = 0; s < 60; s++) {
            var dys = s === 0 ? [0] : [-s * 4, s * 4];
            for (var j = 0; j < dys.length; j++) for (var m = 0; m < xs.length; m++) {
              var cx = xs[m], cy = base + dys[j];
              if (m > 0) cy = Math.max(cy, d.top + lh - 2);
              cx = Math.max(2, Math.min(W - lw - 2, cx)); cy = Math.max(lh + 2, cy);
              if (free(cx, cy)) { x = cx; y = cy; break outer; }
            }
          }
          if (x === null) {
            // no spot near the bar: take the nearest free spot anywhere, joined by a leader line
            var bd2 = Infinity;
            for (var gy2 = lh + 2; gy2 <= H - 2; gy2 += 4) for (var gx2 = 2; gx2 <= W - lw - 2; gx2 += 6) {
              var dd = Math.hypot(gx2 + lw / 2 - d.x, gy2 - base);
              if (dd < bd2 && free(gx2, gy2)) { bd2 = dd; x = gx2; y = gy2; }
            }
          }
          if (x === null) { console.warn('ca-map label fallback', d.text); x = Math.max(2, Math.min(W - lw - 2, xs[0])); y = Math.max(lh + 2, base); }
          placed.push({ x: x, y: y, w: lw, h: lh });
          if (Math.abs(y - base) > 2 || Math.abs(x - (d.x - lw / 2)) > 2) {
            var ln = layer.insert("line", ":first-child").attr("class", "lead").attr("x1", d.x + dx / 2).attr("y1", d.top - dy)
              .attr("x2", Math.max(x, Math.min(x + lw, d.x))).attr("y2", y + 2).attr("opacity", d.keep && !d.grow ? 1 : 0);
            if (!d.keep || d.grow) ln.transition().duration(200).delay(d.grow ? 220 : d.n * 40 + 80).attr("opacity", 1);
          }
          tx.attr("x", x).attr("y", y);
          if (d.keep && !d.grow) tx.attr("opacity", 1);
          else tx.transition().duration(200).delay(d.grow ? 220 : d.n * 40 + 80).attr("opacity", 1);
        });
      }
      function clear() {
        if (box.checked || box2.checked) { show(null); return; }
        state.i = null;
        counties.classed("on", false).classed("nb", false);
        outline.attr("d", null);
        layer.selectAll("text,line").interrupt().remove();
        layer.selectAll("g.bar").interrupt().transition().duration(200).attr("opacity", 0).remove();
      }
      if (state.i !== null || box.checked || box2.checked) show(state.i);
      box.onchange = box2.onchange = function () {
        if (state.i !== null || box.checked || box2.checked) show(state.i);
        else { layer.selectAll("text,line").interrupt().remove(); layer.selectAll("g.bar").interrupt().transition().duration(200).attr("opacity", 0).remove(); }
      };
      sel.onchange = function () {
        metric = sel.value; rank(); tables();
        if (state.i !== null || box.checked || box2.checked) show(state.i);
      };
      window.__caShow = function (fips) { show(feats.findIndex(function (f) { return f.id === fips; })); };
    }
    draw();
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); } });
  });
})();
</script>
