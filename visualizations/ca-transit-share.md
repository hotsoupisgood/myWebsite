---
title: California transit commuting
description: Share of workers who commuted by public transportation, by California county, 2020 to 2024.
date: 2026-10-29
layout: layouts/post.njk
---

<figure class="viz" id="ca-transit-viz">
  <div id="ca-map" role="img" aria-label="Map of California counties. Hover or tap a county to show bars for the share of workers who commuted by public transportation in that county and its neighbors."></div>
</figure>

## References

<div class="references">

U.S. Census Bureau. (2025). *Means of transportation to work* (American Community Survey 5-year estimates, 2020 to 2024, Table B08301) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08301.dat

U.S. Census Bureau. (2024). *Cartographic boundary files, counties* [Data set], via Bostock, M. *us-atlas* (Version 3). https://github.com/topojson/us-atlas

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1rem 0 1.5rem; max-width: 44rem; }
#ca-map { width: 100%; }
#ca-map svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
#ca-map .county { fill: #e3e3e0; stroke: #fff; stroke-width: 0.7; cursor: pointer; }
#ca-map .county.nb { fill: #d6dde4; }
#ca-map .county.on { fill: #c4d0dc; }
#ca-map .outline { fill: none; stroke: #082840; stroke-width: 1.6; pointer-events: none; }
#ca-map .bar { pointer-events: none; }
#ca-map .lbl { pointer-events: none; font-size: 11px; fill: #222; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
#ca-map .lbl.main { font-weight: 700; font-size: 12px; }
#ca-map .lead { stroke: #888; stroke-width: 0.6; pointer-events: none; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/topojson-client.min.js"></script>
<script>
(function () {
  var el = document.getElementById("ca-map");
  Promise.all([
    d3.json("/visualizations/data/ca-counties-10m.json"),
    d3.json("/visualizations/data/ca_transit_share_2020_2024.json")
  ]).then(function (res) {
    var topo = res[0], rows = res[1];
    var byFips = {};
    rows.forEach(function (r) { byFips[r.fips] = r; });
    var geoms = topo.objects.counties.geometries;
    var feats = topojson.feature(topo, topo.objects.counties).features;
    var nbrs = topojson.neighbors(geoms);
    var maxV = d3.max(rows, function (r) { return r.share_pct; });
    var state = { i: null };

    function draw() {
      el.innerHTML = "";
      var W = Math.max(300, el.clientWidth);
      var H = Math.round(Math.min(W * 1.1, Math.max(460, window.innerHeight * 0.92)));
      var small = W < 480;
      var proj = d3.geoConicEqualArea().parallels([34, 40.5]).rotate([120, 0])
        .fitExtent([[6, H * 0.12], [W - 6, H - 6]], { type: "FeatureCollection", features: feats });
      var path = d3.geoPath(proj);
      var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent").on("click", function () { clear(); });
      var pts = feats.map(function (f) {
        var c = path.centroid(f);
        if (!d3.geoContains(f, proj.invert(c))) {
          var b = path.bounds(f), best = null, bd = -1;
          for (var gx = 0; gx <= 12; gx++) for (var gy = 0; gy <= 12; gy++) {
            var p = [b[0][0] + (b[1][0] - b[0][0]) * gx / 12, b[0][1] + (b[1][1] - b[0][1]) * gy / 12];
            if (d3.geoContains(f, proj.invert(p))) { var d = -Math.hypot(p[0] - c[0], p[1] - c[1]); if (d > bd || best === null) { bd = d; best = p; } }
          }
          if (best) c = best;
        }
        return c;
      });
      var counties = svg.append("g").selectAll("path").data(feats).join("path").attr("class", "county").attr("d", path)
        .on("pointerenter", function (ev, f) { if (ev.pointerType === "mouse") show(feats.indexOf(f)); })
        .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") clear(); })
        .on("click", function (ev, f) { ev.stopPropagation(); var i = feats.indexOf(f); if (state.i === i && ev.pointerType !== "mouse") clear(); else show(i); });
      var outline = svg.append("path").attr("class", "outline");
      var layer = svg.append("g");
      var maxH = H * (small ? 0.24 : 0.27);
      var h = d3.scaleLinear().domain([0, maxV]).range([0, maxH]);
      var bw = small ? 7 : 9;

      function name(i) { return byFips[feats[i].id].county.replace(/ County$/, ""); }
      function val(i) { return byFips[feats[i].id].share_pct; }

      function show(i) {
        state.i = i;
        var set = [i].concat(nbrs[i]);
        counties.classed("on", function (f, k) { return k === i; }).classed("nb", function (f, k) { return k !== i && set.indexOf(k) >= 0; });
        outline.attr("d", path(feats[i]));
        layer.interrupt().selectAll("*").interrupt();
        layer.selectAll("*").remove();
        var t = d3.transition().duration(400).ease(d3.easeCubicOut);
        var items = set.map(function (k, n) {
          var p = pts[k];
          return { k: k, n: n, x: p[0], y: p[1], top: p[1] - h(val(k)), main: k === i,
            text: name(k) + " " + val(k).toFixed(1) + " of 100" };
        });
        items.forEach(function (d) {
          layer.append("rect").attr("class", "bar").attr("x", d.x - bw / 2).attr("width", bw)
            .attr("y", d.y).attr("height", 0).attr("fill", d.main ? "#082840" : "#7fa3c2")
            .transition(t).delay(d.n * 40).attr("y", d.top).attr("height", d.y - d.top);
        });
        // labels: place, then push apart and keep inside the SVG
        var placed = [];
        var barsBox = items.map(function (d) { return { k: d.k, x: d.x - bw / 2 - 1, y: d.y + 1, w: bw + 2, h: d.y - d.top + 2 }; });
        items.slice().sort(function (a, b) { return a.main ? -1 : b.main ? 1 : a.top - b.top; }).forEach(function (d) {
          var tx = layer.append("text").attr("class", "lbl" + (d.main ? " main" : "")).text(d.text).attr("opacity", 0);
          var bb = tx.node().getBBox();
          var lw = bb.width, lh = bb.height;
          var obs = placed.concat(barsBox.filter(function (q) { return q.k !== d.k; }));
          function free(x, y) {
            if (x < 2 || x + lw > W - 2 || y - lh < 1 || y > H - 2) return false;
            return !obs.some(function (q) { return x < q.x + q.w + 2 && x + lw + 2 > q.x && y - lh < q.y && y > q.y - q.h; });
          }
          var x = null, y = null, base = d.top - 4;
          var xs = [d.x - lw / 2, d.x + bw / 2 + 3, d.x - bw / 2 - 3 - lw];
          outer: for (var s = 0; s < 60; s++) {
            var dys = s === 0 ? [0] : [-s * 4, s * 4];
            for (var j = 0; j < dys.length; j++) for (var m = 0; m < xs.length; m++) {
              var cx = xs[m], cy = base + dys[j];
              if (m > 0) cy = Math.max(cy, d.top + lh - 2);
              cx = Math.max(2, Math.min(W - lw - 2, cx)); cy = Math.max(lh + 2, cy);
              if (free(cx, cy)) { x = cx; y = cy; break outer; }
            }
          }
          if (x === null) { x = Math.max(2, Math.min(W - lw - 2, xs[0])); y = Math.max(lh + 2, base); }
          placed.push({ x: x, y: y, w: lw, h: lh });
          if (Math.abs(y - (d.top - 4)) > 2 || Math.abs(x - (d.x - lw / 2)) > 2) {
            layer.insert("line", ":first-child").attr("class", "lead").attr("x1", d.x).attr("y1", d.top)
              .attr("x2", Math.max(x, Math.min(x + lw, d.x))).attr("y2", y + 2).attr("opacity", 0)
              .transition(t).delay(d.n * 40 + 250).attr("opacity", 1);
          }
          tx.attr("x", x).attr("y", y).transition(t).delay(d.n * 40 + 250).attr("opacity", 1);
        });
      }
      function clear() {
        state.i = null;
        counties.classed("on", false).classed("nb", false);
        outline.attr("d", null);
        layer.selectAll("text,line").interrupt().remove();
        layer.selectAll("rect").interrupt().transition().duration(250).ease(d3.easeCubicIn)
          .attr("y", function () { return +this.getAttribute("y") + +this.getAttribute("height"); }).attr("height", 0).remove();
      }
      if (state.i !== null) show(state.i);
      window.__caShow = function (fips) { show(feats.findIndex(function (f) { return f.id === fips; })); };
    }
    draw();
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); } });
  });
})();
</script>
