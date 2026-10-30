---
title: San Mateo was the one Bay Area body with significantly more YIMBY than NIMBY public speakers
description: Public speakers and officials at Bay Area city councils, a county board and transit boards, coded YIMBY or NIMBY on housing and transit proposals, by body, 2025 to 2026.
date: 2026-10-12
layout: layouts/post.njk
---

San Mateo City Council had 56 of 100 public speakers coded YIMBY against 17 of 100 coded NIMBY. In the other 14 bodies drawn, public speakers showed no significant difference. Officials had significantly more YIMBY than NIMBY speakers in 11 of the 24 bodies drawn.

<figure class="viz" id="bay-viz">
  <div class="ca-card">
    <label class="ca-select" for="bay-metric"><span>Statistic</span>
      <select id="bay-metric">
        <option value="pub" selected>Public speakers, YIMBY minus NIMBY, of 100</option>
        <option value="off">Officials, YIMBY minus NIMBY, of 100</option>
        <option value="npub">Public speakers with a stance, speakers</option>
        <option value="noff">Officials with a stance, speakers</option>
        <option value="meetings">Meetings found, meetings</option>
        <option value="hours">Video transcribed, hours</option>
      </select>
    </label>
    <div class="ca-checks">
      <label class="viz-toggle"><input type="checkbox" id="bay-all" checked> Always show all bodies</label>
    </div>
  </div>
  <p class="ca-note" id="bay-note"></p>
  <p class="bay-legend" id="bay-legend"></p>
  <div id="bay-map" role="img" aria-label="Tilted map of the nine Bay Area counties. A bar rises from the place each public body represents. Hover or tap a county or a bar to show its numbers."></div>
  <p class="bay-detail" id="bay-detail" aria-live="polite">Hover or tap a county or a bar for its numbers.</p>
</figure>

<div class="ca-tables">
  <table id="bay-t1"><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
  <table id="bay-t2"><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
</div>
<p class="bay-few" id="bay-few"></p>

**Methods.** A speaker is one voice at one stretch of a meeting. Each statement was scored from -2, opposing more housing or transit, to +2, supporting more of it. A speaker is YIMBY when their statements average +0.5 or higher and NIMBY at -0.5 or lower. The likely range is a 90 in 100 interval from 2,000 resamples of meeting stretches. Significantly means the likely range excludes zero. A body is drawn when it has at least 10 speakers with a stance in that group. Transit boards are placed at their headquarters city and the county board at the county's center. Exploratory analysis. Stance and tone were coded by a large language model and have not been validated against human coders. All figures are copied from the project's published data of 2026-10-25.

## References

<div class="references">

Henry, L. (2026). *Bay Area Transit Analysis* [Data set and dashboard]. https://hotsoupisgood.github.io/baytransitanalysis/

Henry, L. (2026). *baytransitanalysis* [Computer software]. GitHub. https://github.com/hotsoupisgood/baytransitanalysis

Granicus. (2026). *Public meeting video archives of Bay Area city councils and boards* [Video archive]. https://granicus.com/

Swagit. (2026). *Public meeting video archives of Bay Area city councils* [Video archive]. https://www.swagit.com/

YouTube. (2026). *Public meeting video channels of Bay Area city councils, county boards and transit boards* [Video archive]. https://www.youtube.com/

U.S. Census Bureau. (2024). *Cartographic boundary files, counties* [Data set], via Bostock, M. *us-atlas* (Version 3). https://github.com/topojson/us-atlas

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1rem auto 1.5rem; max-width: 44rem; }
#bay-map { width: 100%; }
.ca-card { background: #fdf6ea; border: 1px solid #ead9bd; border-radius: 12px; padding: .9rem 1.1rem; margin-bottom: .6rem; display: flex; flex-wrap: wrap; align-items: flex-end; gap: .5rem 1.5rem; }
.ca-select { display: flex; flex-direction: column; gap: .25rem; flex: 1 1 18rem; min-width: 0; font-size: .8rem; font-weight: 600; color: #6b5440; }
.ca-select select { font: inherit; font-size: .95rem; font-weight: 400; color: #2a1a10; min-height: 44px; width: 100%; padding: .4rem 2rem .4rem .7rem; border: 1px solid #d4b483; border-radius: 8px; background: #fffaf3 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23b8400e' stroke-width='2'/%3E%3C/svg%3E") no-repeat right .75rem center; appearance: none; -webkit-appearance: none; cursor: pointer; text-overflow: ellipsis; }
.ca-select select:focus-visible { outline: 2px solid #c2410c; outline-offset: 1px; }
.ca-checks { display: flex; flex-direction: column; flex: 0 1 auto; }
.viz-toggle { display: flex; align-items: center; gap: .55rem; min-height: 40px; font-size: .9rem; cursor: pointer; color: #2a1a10; }
.viz-toggle input { accent-color: #c2410c; width: 1.15rem; height: 1.15rem; margin: 0; flex: none; }
.ca-note { font-size: .85rem; color: #6b5440; margin: 0 0 .3rem; }
.bay-legend { font-size: .8rem; color: #6b5440; margin: 0 0 .3rem; display: flex; flex-wrap: wrap; gap: .2rem 1rem; }
.bay-legend .sw { display: inline-block; width: .7rem; height: .7rem; border-radius: 2px; margin-right: .3rem; vertical-align: -1px; }
.bay-detail { font-size: .9rem; color: #2a1a10; background: #fffaf3; border-left: 3px solid #c2410c; padding: .45rem .7rem; margin: .4rem 0 0; min-height: 2.6em; }
.bay-few { font-size: .85rem; color: #6b5440; max-width: 44rem; margin: -1rem auto 1.5rem; }
@media (max-width: 480px) { .ca-card { flex-direction: column; align-items: stretch; padding: .8rem .9rem; } .ca-select { flex: none; } }
#bay-map svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
#bay-map .ctx { fill: #f6ecdb; stroke: #fffaf0; stroke-width: 0.6; opacity: .55; pointer-events: none; }
#bay-map .county { fill: #f1e3c8; stroke: #fffaf0; stroke-width: 0.8; stroke-linejoin: round; cursor: pointer; }
#bay-map .county.on { fill: #efbe8a; }
#bay-map .slab { fill: #d4b483; }
#bay-map .shadow { fill: #5a3a1a; opacity: 0.18; }
#bay-map .outline { fill: none; stroke: #b8400e; stroke-width: 1.6; stroke-linejoin: round; pointer-events: none; }
#bay-map .cname { font-size: 10px; fill: #9a7b5a; font-style: italic; pointer-events: none; text-anchor: middle; }
#bay-map .bar { pointer-events: none; }
#bay-map .hit { fill: transparent; cursor: pointer; }
#bay-map .dot { fill: #6b5440; pointer-events: none; }
#bay-map .lbl { pointer-events: none; font-size: 11px; fill: #2a1a10; paint-order: stroke; stroke: #fffaf3; stroke-width: 3.5px; stroke-linejoin: round; }
#bay-map .lbl.main { font-weight: 700; font-size: 12px; }
#bay-map .lbl.grey { fill: #8a7a6a; }
#bay-map .lead { stroke: #6b5440; stroke-width: 0.7; pointer-events: none; }
.ca-tables { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1rem; max-width: 46rem; margin: 0 auto 2rem; }
.ca-tables table { flex: 1 1 19rem; border-collapse: collapse; font-size: .9rem; margin: 0 !important; }
.ca-tables caption { text-align: left; font-weight: 700; padding-bottom: .4rem; }
.ca-tables th, .ca-tables td { padding: .3rem .25rem; border-bottom: 1px solid #ead9bd; text-align: left; }
.ca-tables th { font-weight: 600; color: #6b5440; border-bottom: 2px solid #d4b483; }
.ca-tables td:nth-child(n+2), .ca-tables th:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ca-tables td:nth-child(n+2) { font-size: .8rem; }
.ca-tables td:first-child { font-size: .85rem; }
.ca-tables th { font-size: .8rem; }
.ca-tables tr.sig td:first-child { font-weight: 700; }
.ca-tables .mk { color: #c2410c; font-weight: 700; font-size: 1rem; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/topojson-client.min.js"></script>
<script>
(function () {
  var el = document.getElementById("bay-map");
  var BAY = ["06001", "06013", "06041", "06055", "06075", "06081", "06085", "06095", "06097"];
  Promise.all([
    d3.json("/visualizations/data/ca-counties-10m.json"),
    d3.json("/visualizations/data/bay_area_bodies.json")
  ]).then(function (res) {
    var topo = res[0], rows = res[1].bodies;
    var COUNTY_FIPS = { "Alameda": "06001", "Contra Costa": "06013", "Marin": "06041", "Napa": "06055", "San Francisco": "06075", "San Mateo": "06081", "Santa Clara": "06085", "Solano": "06095", "Sonoma": "06097" };
    function sign(v) { var r = Math.round(v); return (r > 0 ? "+" : "") + r; }
    function label(r) { return r.kind === "transit" ? r.short + " (HQ " + r.site.replace(/^HQ \(|\)$/g, "") + ")" : r.kind === "county" ? r.short + " (county board)" : r.short; }
    var M = {
      pub: { net: true, key: "pub", who: "public speakers", head: "Of 100", cnt: "Speakers",
        note: "Public speakers coded YIMBY minus those coded NIMBY, of every 100 public speakers with a stance." },
      off: { net: true, key: "off", who: "officials", head: "Of 100", cnt: "Officials",
        note: "Officials coded YIMBY minus those coded NIMBY, of every 100 officials with a stance. Officials are council and board members and staff." },
      npub: { net: false, unit: " speakers", head: "Speakers", cnt: "Meetings", cv: function (r) { return r.meetings; }, cu: " meetings",
        v: function (r) { return r.pub ? r.pub.n : null; }, few: true,
        note: "Public speakers with a stance, counted once per stretch of meeting." },
      noff: { net: false, unit: " officials", head: "Officials", cnt: "Meetings", cv: function (r) { return r.meetings; }, cu: " meetings",
        v: function (r) { return r.off ? r.off.n : null; }, few: true,
        note: "Officials with a stance, counted once per stretch of meeting." },
      meetings: { net: false, unit: " meetings", head: "Meetings", cnt: "Hours transcribed", cv: function (r) { return r.hours_transcribed; }, cu: " hours",
        v: function (r) { return r.meetings; },
        note: "Meetings with video found online for each body." },
      hours: { net: false, unit: " hours", head: "Hours", cnt: "Meetings", cv: function (r) { return r.meetings; }, cu: " meetings",
        v: function (r) { return r.hours_transcribed; },
        note: "Hours of meeting video transcribed for each body." }
    };
    var sel = document.getElementById("bay-metric"), box = document.getElementById("bay-all");
    var metric = sel.value;
    function g(r) { var m = M[metric]; return m.net ? r[m.key] : null; }
    function val(r) { var m = M[metric]; if (m.net) return r[m.key] ? r[m.key].net : null; return m.v(r); }
    function drawn(r) { var v = val(r); return v !== null && v !== undefined && v > 0 || (M[metric].net && v !== null); }
    function sig(r) { var s = g(r); return !!(s && s.sig); }
    function fmtv(r) {
      var m = M[metric], v = val(r);
      if (m.net) return v === null ? "too few speakers" : sign(v) + " of 100";
      if (v === null) return "too few speakers";
      return d3.format(",")(v) + m.unit;
    }
    function detail(r) {
      var m = M[metric], s = g(r), t = "<b>" + r.name + "</b>";
      if (r.kind === "transit") t += ", placed at its headquarters in " + r.site.replace(/^HQ \(|\)$/g, "");
      if (r.kind === "county") t += ", placed at the county's center";
      t += ". ";
      if (m.net) {
        if (!s) return t + "Too few " + m.who + " with a stance to draw, under 10 speakers.";
        return t + "YIMBY minus NIMBY " + sign(s.net) + " of 100 " + m.who + ", likely range " + sign(s.lo) + " to " + sign(s.hi) + ". "
          + "YIMBY " + Math.round(s.yimby) + " of 100, NIMBY " + Math.round(s.nimby) + " of 100, of " + s.n + " " + m.who + " with a stance. "
          + (s.sig ? "The likely range excludes zero: significant." : "The likely range includes zero: not significant.");
      }
      var v = val(r);
      if (v === null) return t + "Too few speakers with a stance to draw, under 10 speakers.";
      return t + d3.format(",")(v) + m.unit + ", " + d3.format(",")(m.cv(r)) + m.cu + ".";
    }
    var det = document.getElementById("bay-detail");
    function legend() {
      var m = M[metric], L = document.getElementById("bay-legend");
      L.innerHTML = m.net
        ? '<span><i class="sw" style="background:#e56a32"></i>More YIMBY</span><span><i class="sw" style="background:#2b8f86"></i>More NIMBY</span><span><i class="sw" style="background:#2a1a10"></i>* and dark top: significant, likely range excludes zero</span><span><i class="sw" style="background:#cfc6bb"></i>Grey: too few speakers</span>'
        : '<span><i class="sw" style="background:#e56a32"></i>Bar height: ' + m.head.toLowerCase() + '</span>' + (m.few ? '<span><i class="sw" style="background:#cfc6bb"></i>Grey: too few speakers</span>' : '<span><i class="sw" style="background:#cfc6bb"></i>Grey: 0' + m.unit + '</span>');
      document.getElementById("bay-note").textContent = m.note;
    }
    function tables() {
      var m = M[metric];
      var ok = rows.filter(function (r) { var v = val(r); return v !== null && (m.net || v > 0); });
      ok.sort(function (a, b) { return val(b) - val(a) || a.short.localeCompare(b.short); });
      var half = Math.ceil(ok.length / 2);
      var heads = m.net ? ["Body", m.head, "Likely range", m.cnt] : ["Body", m.head, m.cnt];
      function fill(id, list, from) {
        d3.select("#" + id + " thead tr").selectAll("th").data(heads).join("th").text(function (d) { return d; });
        d3.select("#" + id + " caption").text("Ranks " + from + " to " + (from + list.length - 1) + ", " + sel.options[sel.selectedIndex].text.replace(/, [a-z]+$/, "").replace(/, of 100$/, ""));
        d3.select("#" + id + " tbody").selectAll("tr").data(list).join("tr").attr("class", function (r) { return sig(r) ? "sig" : null; }).html(function (r) {
          if (m.net) { var s = g(r); return "<td>" + label(r) + "</td><td>" + sign(s.net) + " of 100" + (s.sig ? ' <span class="mk" title="likely range excludes zero">*</span>' : "") + "</td><td>" + sign(s.lo) + " to " + sign(s.hi) + "</td><td>" + s.n + " " + (m.key === "off" ? "officials" : "speakers") + "</td>"; }
          return "<td>" + label(r) + "</td><td>" + d3.format(",")(val(r)) + m.unit + "</td><td>" + d3.format(",")(m.cv(r)) + m.cu + "</td>";
        });
      }
      fill("bay-t1", ok.slice(0, half), 1);
      fill("bay-t2", ok.slice(half), half + 1);
      var rest = rows.filter(function (r) { return ok.indexOf(r) < 0; }).map(label).sort();
      var why = m.net || m.few ? "Too few speakers with a stance to draw, under 10 speakers: " : (metric === "hours" ? "No hours transcribed: " : "No meetings found: ");
      document.getElementById("bay-few").textContent = (m.net ? "* marks a significant result: the likely range excludes zero. " : "") + (rest.length ? why + rest.join(", ") + "." : "");
    }
    legend(); tables();

    var all = topojson.feature(topo, topo.objects.counties).features;
    var feats = all.filter(function (f) { return BAY.indexOf(f.id) >= 0; });
    var ctx = all.filter(function (f) { return BAY.indexOf(f.id) < 0; });
    var cname = { "06001": "Alameda", "06013": "Contra Costa", "06041": "Marin", "06055": "Napa", "06075": "San Francisco", "06081": "San Mateo", "06085": "Santa Clara", "06095": "Solano", "06097": "Sonoma" };
    var maxAll = {};
    Object.keys(M).forEach(function (k) { var o = metric; metric = k; maxAll[k] = d3.max(rows, function (r) { var v = val(r); return v === null ? 0 : Math.abs(v); }); metric = o; });
    var TILT = 50 * Math.PI / 180;
    var land = topojson.merge(topo, topo.objects.counties.geometries.filter(function (g) { return BAY.indexOf(g.id) >= 0; }));
    var state = { i: null, c: null };
    function draw() {
      el.innerHTML = "";
      var W = Math.max(300, el.clientWidth), small = W < 480;
      var fc = { type: "FeatureCollection", features: feats };
      var B = 1000;
      var base = d3.geoConicEqualArea().parallels([37, 38.5]).rotate([122.2, 0]).fitSize([B, B], fc);
      var bb0 = d3.geoPath(base).bounds(fc), front = bb0[1][1], cx0 = (bb0[0][0] + bb0[1][0]) / 2;
      var D = 1.4 * B, sinT = Math.sin(TILT), cosT = Math.cos(TILT);
      function tiltRaw(x, y) { var back = front - y; var sc = D / (D + back * cosT); return [cx0 + (x - cx0) * sc, front - back * sinT * sc]; }
      var k = 1, tx = 0, ty = 0;
      function tiltPt(x, y) { var q = tiltRaw(x, y); return [q[0] * k + tx, q[1] * k + ty]; }
      var tf = d3.geoTransform({ point: function (x, y) { var q = tiltPt(x, y); this.stream.point(q[0], q[1]); } });
      var proj = { stream: function (st) { return base.stream(tf.stream(st)); } };
      var path = d3.geoPath(proj);
      var rb = path.bounds(fc);
      var edge = small ? 5 : 7, pad = 6;
      var maxH = W * (small ? 0.30 : 0.24);
      k = (W - 2 * pad) / (rb[1][0] - rb[0][0]);
      tx = pad - rb[0][0] * k; ty = -rb[0][1] * k;
      var bpath = d3.geoPath(base);
      var pts = rows.map(function (r) {
        var c;
        if (r.kind === "county") c = bpath.centroid(feats.filter(function (f) { return f.id === COUNTY_FIPS[r.county]; })[0]);
        else c = base([r.lon, r.lat]);
        return tiltPt(c[0], c[1]);
      });
      var bw = small ? 6 : 8;
      // bodies that share a spot (BART and Oakland, SFMTA and San Francisco) stand side by side
      var order = pts.map(function (p, i) { return i; }).sort(function (a, b) { return pts[a][0] - pts[b][0]; });
      for (var a = 0; a < order.length; a++) for (var b2 = 0; b2 < a; b2++) {
        var P = pts[order[a]], Q = pts[order[b2]];
        if (Math.abs(P[0] - Q[0]) < bw + 3 && Math.abs(P[1] - Q[1]) < bw) P[0] = Q[0] + bw + 3;
      }
      function relMax(i) { return d3.max(Object.keys(M), function (m) { var o = metric; metric = m; var v = val(rows[i]); metric = o; return v === null ? 0 : Math.abs(v) / maxAll[m]; }); }
      var top = 12;
      pts.forEach(function (q, i) { top = Math.max(top, maxH * relMax(i) + 34 - q[1]); });
      ty += top;
      pts.forEach(function (q) { q[1] += top; });
      var H = Math.ceil(top + (rb[1][1] - rb[0][1]) * k + edge + 10);
      var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      var defs = svg.append("defs");
      defs.append("filter").attr("id", "bay-blur").attr("x", "-10%").attr("y", "-10%").attr("width", "120%").attr("height", "120%").append("feGaussianBlur").attr("stdDeviation", 5);
      defs.append("clipPath").attr("id", "bay-clip").append("rect").attr("width", W).attr("height", H);
      svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent").on("click", function () { clear(); });
      svg.append("g").attr("clip-path", "url(#bay-clip)").selectAll("path").data(ctx).join("path").attr("class", "ctx").attr("d", path);
      var landD = path(land);
      svg.append("path").attr("class", "shadow").attr("d", landD).attr("transform", "translate(5," + (edge + 6) + ")").attr("filter", "url(#bay-blur)");
      for (var e = edge; e > 0; e--) svg.append("path").attr("class", "slab").attr("d", landD).attr("transform", "translate(0," + e + ")");
      var counties = svg.append("g").selectAll("path").data(feats).join("path").attr("class", "county").attr("d", path)
        .on("pointerenter", function (ev, f) { if (ev.pointerType === "mouse") showCounty(f.id); })
        .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") clear(); })
        .on("click", function (ev, f) { ev.stopPropagation(); if (state.c === f.id && state.i === null && ev.pointerType !== "mouse") clear(); else showCounty(f.id); });
      var cnames = svg.append("g").selectAll("text").data(feats).join("text").attr("class", "cname").each(function (f) {
        var c = bpath.centroid(f), q = tiltPt(c[0], c[1]);
        if (f.id === "06075") q = tiltPt(c[0] - 40, c[1] + 10);
        d3.select(this).attr("x", q[0]).attr("y", q[1] + 14);
      }).text(function (f) { return small && f.id === "06075" ? "SF" : cname[f.id]; });
      var outline = svg.append("path").attr("class", "outline");
      svg.append("g").selectAll("circle").data(pts).join("circle").attr("class", "dot").attr("cx", function (p) { return p[0]; }).attr("cy", function (p) { return p[1]; }).attr("r", 1.6);
      var layer = svg.append("g");
      var hits = svg.append("g");
      var h = function (v) { return maxH * Math.abs(v) / maxAll[metric]; };
      var COL = { pos: { main: ["#c2410c", "#8a2d08", "#e56a32"], nb: ["#f28c38", "#c4661c", "#f9b277"] },
        neg: { main: ["#14736b", "#0b4f49", "#2b8f86"], nb: ["#3fa69c", "#2a7d75", "#7fc8c0"] },
        grey: ["#cfc6bb", "#aea398", "#e2dbd2"] };

      function show(i, c) {
        state.i = i; state.c = c === undefined ? (i === null ? null : null) : c;
        var hov = [];
        if (state.c) rows.forEach(function (r, j) { if (COUNTY_FIPS[r.county] === state.c && pts[j]) hov.push(j); });
        if (i !== null && hov.indexOf(i) < 0) hov.push(i);
        var set = box.checked ? rows.map(function (r, j) { return j; }) : hov.slice();
        var lab = hov.slice();
        if (!hov.length) {
          // with nothing hovered, name the bodies the takeaway rests on
          var cand = rows.map(function (r, j) { return j; }).filter(function (j) { var v = val(rows[j]); return v !== null && v !== 0; });
          if (M[metric].net) lab = cand.filter(function (j) { return sig(rows[j]); });
          else lab = cand.sort(function (a, b) { return val(rows[b]) - val(rows[a]); }).slice(0, 3);
        }
        counties.classed("on", function (f) { return f.id === state.c; });
        outline.attr("d", state.c ? path(feats.filter(function (f) { return f.id === state.c; })[0]) : null);
        if (i !== null) det.innerHTML = detail(rows[i]);
        else if (state.c) {
          var inC = hov.map(function (j) { return rows[j]; });
          det.innerHTML = "<b>" + cname[state.c] + " County</b>: " + (inC.length ? inC.map(function (r) { return label(r) + " " + fmtv(r); }).join("; ") + "." : "no body in this project.") + " Tap a bar for its likely range.";
        }
        var had = {};
        layer.selectAll("g.bar").each(function () { if (this.__k !== undefined && +d3.select(this).datum() > 0) had[this.__k] = +d3.select(this).datum(); });
        layer.interrupt().selectAll("*").interrupt();
        layer.selectAll("*").remove();
        var t = d3.transition().duration(400).ease(d3.easeCubicOut);
        var items = set.map(function (j, n) {
          var r = rows[j], v = val(r), p = pts[j], grey = v === null || v === 0;
          var hh = grey ? 4 : Math.max(3, h(v));
          return { k: j, n: n, x: p[0], y: p[1], top: p[1] - hh, hh: hh, main: j === i || (i === null && hov.indexOf(j) >= 0), grey: grey, neg: !grey && v < 0, sig: sig(r),
            lab: lab.indexOf(j) >= 0, text: label(r) + (grey ? ": " : " ") + fmtv(r) + (M[metric].net && sig(r) ? " *" : "") };
        });
        var dx = bw * 0.5, dy = bw * 0.35;
        function barPaths(gg, d, hh) {
          var x0 = d.x - bw / 2, x1 = d.x + bw / 2, y0 = d.y, y1 = d.y - hh;
          gg.select(".f").attr("d", "M" + x0 + "," + y0 + "H" + x1 + "V" + y1 + "H" + x0 + "Z");
          gg.select(".s").attr("d", "M" + x1 + "," + y0 + "L" + (x1 + dx) + "," + (y0 - dy) + "V" + (y1 - dy) + "L" + x1 + "," + y1 + "Z");
          gg.select(".c").attr("d", "M" + x0 + "," + y1 + "H" + x1 + "L" + (x1 + dx) + "," + (y1 - dy) + "H" + (x0 + dx) + "Z");
        }
        items.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (d) {
          var col = d.grey ? COL.grey : (d.neg ? COL.neg : COL.pos)[d.main ? "main" : "nb"];
          var gg = layer.append("g").attr("class", "bar").datum(0);
          gg.append("path").attr("class", "s").attr("fill", col[1]);
          gg.append("path").attr("class", "f").attr("fill", col[0]).attr("stroke", d.sig ? "#2a1a10" : "none").attr("stroke-width", 1);
          gg.append("path").attr("class", "c").attr("fill", d.sig ? "#2a1a10" : col[2]);
          var full = d.hh, node = gg.node();
          node.__k = d.k;
          var start = had[d.k] || 0;
          d.keep = start > 0; d.grow = d.keep && Math.abs(start - full) > 0.5;
          if (d.keep && !d.grow) { gg.datum(full); barPaths(gg, d, full); }
          else {
            gg.datum(start); barPaths(gg, d, start);
            gg.transition(t).duration(d.keep ? 300 : 400).delay(d.keep ? 0 : Math.min(d.n, 20) * 20).tween("h", function () {
              var ip = d3.interpolateNumber(start, full);
              return function (u) { var v = ip(u); gg.datum(v); barPaths(gg, d, v); };
            });
          }
        });
        var placed = [];
        var barsBox = items.map(function (d) { return { x: d.x - bw / 2 - 1, y: d.y + 1, w: bw + dx + 2, h: d.hh + dy + 2 }; });
        cnames.each(function () { var b = this.getBBox(); barsBox.push({ x: b.x, y: b.y + b.height, w: b.width, h: b.height }); });
        items.filter(function (d) { return d.lab; }).sort(function (a, b) { return a.main && !b.main ? -1 : b.main && !a.main ? 1 : a.top - b.top; }).forEach(function (d) {
          var tx2 = layer.append("text").attr("class", "lbl" + (d.k === i ? " main" : "") + (d.grey ? " grey" : "")).text(d.text).attr("opacity", 0);
          var bb = tx2.node().getBBox(), lw = bb.width, lh = bb.height;
          var obs = placed.concat(barsBox);
          function free(x, y) {
            if (x < 2 || x + lw > W - 2 || y - lh < 1 || y > H - 2) return false;
            return !obs.some(function (q) { return x < q.x + q.w + 3 && x + lw + 3 > q.x && y - lh < q.y + 3 && y + 1 > q.y - q.h - 3; });
          }
          var x = null, y = null, bs = d.top - dy - 7;
          var xs = [d.x - lw / 2, d.x + bw / 2 + dx + 4, d.x - bw / 2 - 4 - lw];
          outer: for (var s = 0; s < 60; s++) {
            var dys = s === 0 ? [0] : [-s * 4, s * 4];
            for (var j = 0; j < dys.length; j++) for (var m = 0; m < xs.length; m++) {
              var cx = xs[m], cy = bs + dys[j];
              if (m > 0) cy = Math.max(cy, d.top + lh - 2);
              cx = Math.max(2, Math.min(W - lw - 2, cx)); cy = Math.max(lh + 2, cy);
              if (free(cx, cy)) { x = cx; y = cy; break outer; }
            }
          }
          if (x === null) { x = Math.max(2, Math.min(W - lw - 2, xs[0])); y = Math.max(lh + 2, bs); }
          placed.push({ x: x, y: y, w: lw, h: lh });
          if (Math.abs(y - bs) > 2 || Math.abs(x - (d.x - lw / 2)) > 2) {
            layer.insert("line", ":first-child").attr("class", "lead").attr("x1", d.x + dx / 2).attr("y1", d.top - dy)
              .attr("x2", Math.max(x, Math.min(x + lw, d.x))).attr("y2", y + 2);
          }
          tx2.attr("x", x).attr("y", y);
          if (d.keep && !d.grow) tx2.attr("opacity", 1); else tx2.transition().duration(200).delay(d.grow ? 220 : 120).attr("opacity", 1);
        });
      }
      function showCounty(fips) { show(null, fips); }
      function clear() {
        state.i = null; state.c = null;
        det.textContent = "Hover or tap a county or a bar for its numbers.";
        if (box.checked) { show(null, null); return; }
        counties.classed("on", false); outline.attr("d", null);
        layer.selectAll("text,line").interrupt().remove();
        layer.selectAll("g.bar").interrupt().transition().duration(200).attr("opacity", 0).remove();
      }
      hits.selectAll("rect").data(pts).join("rect").attr("class", "hit").attr("data-body", function (p, j) { return rows[j].body; })
        .attr("x", function (p) { return p[0] - bw / 2 - 2; }).attr("width", bw + 6)
        .attr("y", function (p, j) { var v = val(rows[j]); return p[1] - (v ? h(v) : 4) - 6; })
        .attr("height", function (p, j) { var v = val(rows[j]); return (v ? h(v) : 4) + 12; })
        .on("pointerenter", function (ev, p) { if (ev.pointerType === "mouse") { var j = pts.indexOf(p); show(j, COUNTY_FIPS[rows[j].county]); } })
        .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") clear(); })
        .on("click", function (ev, p) { ev.stopPropagation(); var j = pts.indexOf(p); show(j, COUNTY_FIPS[rows[j].county]); });
      function resizeHits() {
        hits.selectAll("rect").attr("y", function (p, j) { var v = val(rows[j]); return p[1] - (v ? h(v) : 4) - 6; })
          .attr("height", function (p, j) { var v = val(rows[j]); return (v ? h(v) : 4) + 12; })
          .style("display", function (p, j) { return box.checked || state.c === COUNTY_FIPS[rows[j].county] ? null : "none"; });
      }
      var origShow = show;
      show = function (i, c) { origShow(i, c); resizeHits(); };
      if (state.i !== null || state.c || box.checked) show(state.i, state.c); else resizeHits();
      box.onchange = function () {
        if (state.i !== null || state.c || box.checked) show(state.i, state.c);
        else { clear(); resizeHits(); }
      };
      sel.onchange = function () {
        metric = sel.value; legend(); tables();
        if (state.i !== null) det.innerHTML = detail(rows[state.i]);
        if (state.i !== null || state.c || box.checked) show(state.i, state.c); else resizeHits();
      };
      window.__bayShow = function (body) { var j = rows.findIndex(function (r) { return r.body === body; }); show(j, COUNTY_FIPS[rows[j].county]); };
    }
    draw();
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); } });
  });
})();
</script>
