(function () {
  var el = document.getElementById("lam-map");
  var FY = ["2024", "2025", "2026"];
  var Y0 = 1990, Y1 = 2026;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var fmt = d3.format(",");
  var WALLS = true; // false: the older version, where line width shows boardings
  var hf = {}; // current wall height per line, as a share of the tallest wall
  var DEC = [1990, 2000, 2010, 2020], DCOL = ["#fcd9a0", "#f4a259", "#d9541e", "#8a2d08"];
  function oy(r) { return +r.opened.slice(0, 4); }
  function dcol(r) { return DCOL[Math.min(3, Math.max(0, Math.floor((oy(r) - 1990) / 10)))]; }
  function odate(r) { var p = r.opened.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0]; }
  function yrs(n) { return n + (n === 1 ? " year" : " years"); }
  function partial(r, y) { var a = (y - 1) + "-07-01", b = y + "-06-30"; return r.opened >= a && r.opened <= b; }
  Promise.all([d3.json("/visualizations/data/ca-counties-10m.json?v=20261029c"), d3.json("/visualizations/data/la_metro_stations.json?v=20261029c"), d3.json("/visualizations/data/la_metro_contours.json?v=20261029c")]).then(function (res) {
    var topo = res[0], data = res[1], contours = res[2], rows = data.stations, LINES = data.lines;
    var slider = document.getElementById("lam-slider"), play = document.getElementById("lam-play"), yv = document.getElementById("lam-yv");
    var panel = document.getElementById("lam-panel");
    var LR = data.line_ridership || { fy: {} }, LFY = LR.fy, LFROM = LR.from || {};
    function lkey(k) { return k === "B" || k === "D" ? "BD" : k; }
    function lname(q) { return q === "BD" ? "B and D Lines" : q + " Line"; }
    function lineB(k, y) { var q = lkey(k), s = LFY[q]; if (!s || y < (LFROM[q] || 0)) return null; var v = s[y]; return v === undefined ? null : v; }
    var LMAX = 0; Object.keys(LFY).forEach(function (q) { Object.keys(LFY[q]).forEach(function (y) { if (+y >= (LFROM[q] || 0)) LMAX = Math.max(LMAX, LFY[q][y]); }); });
    var LY = []; Object.keys(LFY).forEach(function (q) { Object.keys(LFY[q]).forEach(function (y) { if (LY.indexOf(+y) < 0) LY.push(+y); }); }); LY.sort();
    function wScale(small) { return d3.scaleSqrt().domain([0, LMAX]).range([0, small ? 7 : 10]); }
    function lineW(k, small) { if (WALLS) return small ? 1.6 : 2.2; var thin = small ? 1.4 : 1.8; if (metric === "age") return thin; var v = lineB(k, Y); if (v === null) return thin; return Math.max(thin, wScale(small)(v)); }
    var Y = +slider.value, metric = "b";
    var busyCb = document.getElementById("lam-busy"), busyNote = document.getElementById("lam-busy-na");
    var BMAX = 0; rows.forEach(function (r) { FY.forEach(function (f) { if (r.b && r.b[f] !== undefined) BMAX = Math.max(BMAX, r.b[f]); }); });
    function busyOn() { return busyCb.checked && Y >= 2024 && Y <= 2026; }
    function top10() { var f = String(Y); return rows.filter(function (r) { return open(r) && r.b && r.b[f] !== undefined; }).sort(function (a, b) { return b.b[f] - a.b[f]; }).slice(0, 10); }
    function busyUi() {
      var dis = Y < 2024;
      busyCb.disabled = dis; busyCb.parentNode.classList.toggle("off", dis); busyNote.hidden = !dis;
      var on = busyOn();
      document.getElementById("lam-t1").hidden = !on;
      document.getElementById("lam-src-on").hidden = !on; document.getElementById("lam-src-off").hidden = on;
      if (on) {
        var f = String(Y);
        d3.select("#lam-t1 caption").text("Busiest 10 stations, fiscal year " + Y);
        d3.select("#lam-t1 thead tr").selectAll("th").data(["Station", "Lines", "Weekday boardings"]).join("th").text(function (d) { return d; });
        d3.select("#lam-t1 tbody").selectAll("tr").data(top10()).join("tr").html(function (r) { return "<td>" + r.name + "</td><td>" + r.lines.join(", ") + "</td><td>" + fmt(r.b[f]) + "</td>"; });
      }
    }
    function open(r) { return oy(r) <= Y; }
    var tabsEl = document.getElementById("lam-metric");
    var tabBtns = Array.prototype.slice.call(tabsEl.querySelectorAll("button"));
    var sel = { value: "b", onchange: null };
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
    function legend() {
      var L = document.getElementById("lam-legend"), cnt = rows.filter(open).length, h;
      if (metric === "b") h = cnt + " stations open in " + Y + (WALLS ? ". Wall height: average weekday boardings on the line in fiscal year " : ". Line width: average weekday boardings on the line in fiscal year ") + Y + ", shown at each line's end." + (Y < 2009 ? (WALLS ? " Line figures start in fiscal year 2009, so walls are low before then." : " Line figures start in fiscal year 2009, so lines are thin before then.") : "") + " Pins: stations opened in " + (Y - 1) + " or " + Y + ".";
      else { h = cnt + " stations open in " + Y + ". Dot color: decade the station opened:"; DEC.forEach(function (d, i) { h += '<i class="sw" style="background:' + DCOL[i] + '"></i>' + d + "s"; }); h += ". Pins: stations opened in " + (Y - 1) + " or " + Y + "."; }
      if (busyOn()) h += " Bars: the 10 stations with the most average weekday boardings in fiscal year " + Y + ", on one height scale for fiscal years 2024 to 2026.";
      L.innerHTML = h;
    }
    function muted(k) { return d3.interpolateRgb(LINES[k].color, "#f1e3c8")(metric === "age" ? 0.45 : 0.3); }
    function tables() {
      var nw = rows.filter(open).sort(function (a, b) { return b.opened.localeCompare(a.opened) || a.name.localeCompare(b.name); }).slice(0, 10);
      d3.select("#lam-t2 caption").text("Newest 10 stations open in " + Y);
      d3.select("#lam-t2 thead tr").selectAll("th").data(["Station", "Opened", "Age in " + Y]).join("th").text(function (d) { return d; });
      d3.select("#lam-t2 tbody").selectAll("tr").data(nw).join("tr").html(function (r) { return "<td>" + r.name + "</td><td>" + odate(r) + "</td><td>" + yrs(Y - oy(r)) + "</td>"; });
    }
    function chip(k) { return '<span class="lam-chip" style="background:' + LINES[k].color + ';color:' + (k === "E" || k === "K" ? "#2a1a10" : "#fff") + '">' + k + "</span>"; }
    function showPanel(r) {
      if (!r) { panel.innerHTML = '<p class="lam-hint">Hover or tap a station for its numbers.</p>'; return; }
      var h = '<div class="lam-a"><h3>' + r.name + "</h3><p>" + r.lines.map(chip).join("") + " " + r.lines.map(function (k) { return k + " Line"; }).join(", ") + "</p>";
      h += "<p>Opened " + odate(r) + ". " + (open(r) ? yrs(Y - oy(r)) + " open in " + Y + "." : "Not yet open in " + Y + ".") + "</p>";
      h += '</div><div class="lam-b">';
      var lks = []; r.lines.forEach(function (k) { var q = lkey(k); if (LFY[q] && lks.indexOf(q) < 0) lks.push(q); });
      if (lks.length) {
        var w2 = 240, h2 = 130, m2 = { l: 44, r: 30, t: 16, b: 30 };
        var series = lks.map(function (q) { return { q: q, p: LY.filter(function (y) { return LFY[q][y] !== undefined && y >= (LFROM[q] || 0); }).map(function (y) { return [y, LFY[q][y]]; }) }; });
        var x2 = d3.scaleLinear().domain([2009, 2026]).range([m2.l, w2 - m2.r]);
        var y2 = d3.scaleLinear().domain([0, d3.max(series, function (s) { return d3.max(s.p, function (p) { return p[1]; }); }) * 1.1]).nice(3).range([h2 - m2.b, m2.t]);
        var s2 = '<p class="lam-sub">Average weekday boardings on the whole line</p><svg viewBox="0 0 ' + w2 + " " + h2 + '" role="img" aria-label="Average weekday boardings by fiscal year on ' + lks.map(lname).join(", ") + '">';
        y2.ticks(3).forEach(function (t) { s2 += '<line x1="' + m2.l + '" x2="' + (w2 - m2.r) + '" y1="' + y2(t) + '" y2="' + y2(t) + '" stroke="#ead9bd"/><text class="ax" x="' + (m2.l - 4) + '" y="' + (y2(t) + 3) + '" text-anchor="end">' + fmt(t) + "</text>"; });
        [2010, 2014, 2018, 2022, 2026].forEach(function (t) { s2 += '<line x1="' + x2(t) + '" x2="' + x2(t) + '" y1="' + (h2 - m2.b) + '" y2="' + (h2 - m2.b + 3) + '" stroke="#6b5440"/><text class="ax" x="' + x2(t) + '" y="' + (h2 - m2.b + 13) + '" text-anchor="middle">' + t + "</text>"; });
        s2 += '<text class="ax" x="' + ((m2.l + w2 - m2.r) / 2) + '" y="' + (h2 - 2) + '" text-anchor="middle">Fiscal year, ending in June</text>';
        if (Y >= 2009) s2 += '<line x1="' + x2(Y) + '" x2="' + x2(Y) + '" y1="' + m2.t + '" y2="' + (h2 - m2.b) + '" stroke="#8a2d08" stroke-dasharray="2 2"/><text class="ax" style="font-weight:700;fill:#8a2d08" x="' + Math.min(x2(Y), w2 - m2.r - 12) + '" y="10" text-anchor="middle">' + Y + "</text>";
        series.forEach(function (s) {
          var col = LINES[s.q === "BD" ? "B" : s.q].color;
          if (s.p.length > 1) s2 += '<path fill="none" stroke="' + col + '" stroke-width="2" d="' + d3.line().x(function (p) { return x2(p[0]); }).y(function (p) { return y2(p[1]); })(s.p) + '"/>';
          s.p.forEach(function (p) { if (p[0] === Y) s2 += '<circle cx="' + x2(p[0]) + '" cy="' + y2(p[1]) + '" r="3.5" fill="' + col + '" stroke="#2a1a10"/>'; });
        });
        var ends = series.filter(function (s) { return s.p.length; }).map(function (s) { var l = s.p[s.p.length - 1]; return { t: s.q === "BD" ? "B, D" : s.q, x: x2(l[0]) + 5, y: y2(l[1]) + 3 }; }).sort(function (a, b) { return a.y - b.y; });
        ends.forEach(function (e, i) { if (i && e.y - ends[i - 1].y < 11) e.y = ends[i - 1].y + 11; });
        ends.forEach(function (e) { s2 += '<text class="ax" style="font-weight:700" x="' + e.x + '" y="' + e.y + '">' + e.t + "</text>"; });
        s2 += "</svg>";
        lks.forEach(function (q) { var v = LFY[q][Y]; s2 += "<p>" + lname(q) + ": " + (v !== undefined && Y >= (LFROM[q] || 0) ? fmt(v) + " in fiscal year " + Y : "no line figure for fiscal year " + Y) + ".</p>"; });
        h += s2;
      }
      h += '</div><div class="lam-c">';
      var dy = Y >= 2024 ? String(Y) : "2024";
      if (r.b[dy] !== undefined) h += '<p class="lam-sub">This station had ' + fmt(r.b[dy]) + " average weekday boardings in fiscal year " + dy + (partial(r, +dy) ? ", the year it opened" : "") + (Y < 2024 ? ", the first year with station figures" : "") + ".</p>";
      else h += '<p class="lam-sub">No station boardings figure for fiscal year ' + dy + ".</p>";
      panel.innerHTML = h + "</div>";
      ["a", "b", "c"].forEach(function (k) { var d = panel.querySelector(".lam-" + k); if (d && MH[k]) d.style.minHeight = MH[k] + "px"; });
    }
    var MH = {};
    function fixPanel() {
      if (!panel.offsetWidth) return;
      var keep = state.i, mh = { a: 0, b: 0, c: 0 };
      MH = {};
      rows.forEach(function (r) { showPanel(r); ["a", "b", "c"].forEach(function (k) { var d = panel.querySelector(".lam-" + k); if (d) mh[k] = Math.max(mh[k], d.offsetHeight); }); });
      MH = mh;
      showPanel(keep === null ? null : rows[keep]);
    }
    var state = { i: null, pinned: false };
    var api = {};
    function draw() {
      el.innerHTML = "";
      var W = Math.max(280, el.clientWidth), small = W < 520;
      var B = 1000;
      var mp = { type: "MultiPoint", coordinates: [[-118.54, 33.74], [-117.72, 34.22], [-118.54, 34.22], [-117.72, 33.74]] };
      var base = d3.geoConicEqualArea().parallels([33.6, 34.4]).rotate([118.1, 0]).fitSize([B, B], mp);
      var ext = d3.geoPath(base).bounds(mp);
      base.clipExtent(ext);
      var front = ext[1][1], cx0 = (ext[0][0] + ext[1][0]) / 2;
      var TILT = 50 * Math.PI / 180, Dd = 1.4 * B, sinT = Math.sin(TILT), cosT = Math.cos(TILT);
      function tiltRaw(x, y) { var back = front - y; var sc = Dd / (Dd + back * cosT); return [cx0 + (x - cx0) * sc, front - back * sinT * sc]; }
      var k = 1, tx = 0, ty = 0;
      function tiltPt(x, y) { var q = tiltRaw(x, y); return [q[0] * k + tx, q[1] * k + ty]; }
      var tf = d3.geoTransform({ point: function (x, y) { var q = tiltPt(x, y); this.stream.point(q[0], q[1]); } });
      var proj = { stream: function (st) { return base.stream(tf.stream(st)); } };
      var path = d3.geoPath(proj);
      var c = [tiltRaw(ext[0][0], ext[0][1]), tiltRaw(ext[1][0], ext[0][1]), tiltRaw(ext[0][0], ext[1][1]), tiltRaw(ext[1][0], ext[1][1])];
      var rx0 = d3.min(c, function (p) { return p[0]; }), rx1 = d3.max(c, function (p) { return p[0]; }), ry0 = d3.min(c, function (p) { return p[1]; }), ry1 = d3.max(c, function (p) { return p[1]; });
      var edge = small ? 5 : 7, pad = 6;
      k = (W - 2 * pad) / (rx1 - rx0); tx = pad - rx0 * k; ty = -ry0 * k;
      function P(lon, lat) { var q = base([lon, lat]); return tiltPt(q[0], q[1]); }
      var pts = rows.map(function (r) { return P(r.lon, r.lat); });
      var topRoom = 4; pts.forEach(function (q) { topRoom = Math.max(topRoom, 34 - q[1]); });
      var WMAX = small ? 40 : 70, WLOW = small ? 3 : 5;
      if (WALLS) Object.keys(LINES).forEach(function (lk) { LINES[lk].path.forEach(function (c) { topRoom = Math.max(topRoom, WMAX + 24 - P(c[0], c[1])[1]); }); });
      ty += topRoom; pts.forEach(function (q) { q[1] += topRoom; });
      var H = Math.ceil(ty + ry1 * k + edge + 10);
      var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      svg.append("defs").append("filter").attr("id", "lam-blur").attr("x", "-10%").attr("y", "-10%").attr("width", "120%").attr("height", "120%").append("feGaussianBlur").attr("stdDeviation", 5);
      svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent");
      var land = topojson.merge(topo, topo.objects.counties.geometries), landD = path(land);
      svg.append("path").attr("class", "shadow").attr("d", landD).attr("transform", "translate(5," + (edge + 6) + ")").attr("filter", "url(#lam-blur)");
      for (var e = edge; e > 0; e--) svg.append("path").attr("class", "slab").attr("d", landD).attr("transform", "translate(0," + e + ")");
      svg.append("path").attr("class", "land").attr("d", landD);
      svg.append("path").attr("class", "lac").attr("d", path(topojson.mesh(topo, topo.objects.counties, function (a, b) { return a !== b && (a.id === "06037" || b.id === "06037"); })));
      var topoG = svg.append("g");
      topoG.selectAll("path").data(contours.features).join("path").attr("class", function (f) { return f.properties.elev % 500 === 0 ? "topo major" : "topo"; }).attr("d", path);
      var places = [["Santa Monica", -118.47, 33.985], ["Pomona", -117.77, 34.035], ["Norwalk", -118.08, 33.895]];
      if (!small) svg.append("g").selectAll("text").data(places).join("text").attr("class", "place").attr("x", function (d) { return P(d[1], d[2])[0]; }).attr("y", function (d) { return P(d[1], d[2])[1] + 14; }).text(function (d) { return d[0]; });
      var railG = svg.append("g"), wallG = svg.append("g").attr("class", "walls"), wallY = null, quads = [];
      var wS = d3.scaleLinear().domain([0, LMAX]).range([0, WMAX]);
      function wallT(lk) { if (metric === "age") return WLOW; var v = lineB(lk, Y); return v === null ? WLOW : wS(v); }
      function buildWalls() {
        wallG.selectAll("*").remove(); quads = [];
        Object.keys(segInfo).forEach(function (lk) {
          var s = segInfo[lk];
          for (var j = 1; j < s.cs.length; j++) if (Math.max(s.vy[j - 1], s.vy[j]) <= Y) quads.push({ k: lk, q: lkey(lk), a: P(s.cs[j - 1][0], s.cs[j - 1][1]), b: P(s.cs[j][0], s.cs[j][1]) });
        });
        quads.sort(function (u, v) { return (u.a[1] + u.b[1]) - (v.a[1] + v.b[1]); });
        quads.forEach(function (d) {
          var c = LINES[d.k].color;
          d.f = wallG.append("path").attr("class", "wall").attr("fill", c).node();
          d.t = wallG.append("path").attr("class", "wtop").attr("stroke", d3.color(c).darker(0.7)).node();
        });
        wallY = Y;
      }
      function renderWalls() {
        quads.forEach(function (d) {
          var h = (hf[d.q] || 0) * WMAX, a = d.a, b = d.b;
          d.f.setAttribute("d", "M" + a[0] + "," + a[1] + "L" + b[0] + "," + b[1] + "L" + b[0] + "," + (b[1] - h) + "L" + a[0] + "," + (a[1] - h) + "Z");
          d.t.setAttribute("d", "M" + a[0] + "," + (a[1] - h) + "L" + b[0] + "," + (b[1] - h));
        });
      }
      function walls(animate) {
        if (!WALLS) return;
        if (wallY !== Y) buildWalls();
        wallG.interrupt().transition().duration(300).attr("opacity", busyOn() ? 0.3 : 1);
        var from = {}, to = {}, moved = false;
        ["A", "BD", "C", "E", "K"].forEach(function (q) { from[q] = hf[q] || 0; to[q] = wallT(q === "BD" ? "B" : q) / WMAX; if (Math.abs(from[q] - to[q]) > 0.002) moved = true; });
        wallG.interrupt("h");
        if (!animate || !moved) { Object.keys(to).forEach(function (q) { hf[q] = to[q]; }); renderWalls(); return; }
        wallG.transition("h").duration(450).ease(d3.easeCubicOut).tween("h", function () { return function (u) { Object.keys(to).forEach(function (q) { hf[q] = from[q] + (to[q] - from[q]) * u; }); renderWalls(); }; });
      }
      var segInfo = {};
      ["E", "C", "K", "A", "D", "B"].forEach(function (lk) {
        var ls = LINES[lk]; if (!ls) return;
        var stOf = rows.filter(function (r) { return r.lines.indexOf(lk) >= 0; });
        var cs = ls.path, idx = stOf.map(function (r) { var bi = 0, bd = Infinity; cs.forEach(function (c, j) { var d = (c[0] - r.lon) * (c[0] - r.lon) + (c[1] - r.lat) * (c[1] - r.lat); if (d < bd) { bd = d; bi = j; } }); return { j: bi, y: oy(r) }; }).sort(function (a, b) { return a.j - b.j; });
        var vy = cs.map(function (c, j) { var a = null, b = null; idx.forEach(function (s) { if (s.j <= j) a = s; if (s.j >= j && !b) b = s; }); return Math.max(a ? a.y : b.y, b ? b.y : a.y); });
        segInfo[lk] = { cs: cs, vy: vy };
        var segs = [], cur = null;
        for (var j = 1; j < cs.length; j++) { var yy = Math.max(vy[j - 1], vy[j]); if (!cur || cur.y !== yy) { cur = { y: yy, c: [cs[j - 1]] }; segs.push(cur); } cur.c.push(cs[j]); }
        segs.forEach(function (sg) { railG.append("path").datum({ k: lk, open: sg.y, geo: { type: "LineString", coordinates: sg.c } }).attr("class", "rail").attr("d", function (d) { return path(d.geo); }); });
      });
      var R = small ? 2.5 : 3, RON = small ? 5.5 : 6.5;
      var dots = svg.append("g").selectAll("circle").data(rows).join("circle").attr("class", "dot").attr("cx", function (r, i) { return pts[i][0]; }).attr("cy", function (r, i) { return pts[i][1]; });
      var barG = svg.append("g"), barH = {}, bw = small ? 5 : 7, bdx = bw * 0.5, bdy = bw * 0.35, HMAX = small ? 38 : 60;
      var hS = d3.scaleLinear().domain([0, BMAX]).range([0, HMAX]);
      var BC = ["#f28c38", "#c4661c", "#f9b277"];
      function barPaths(g, x, y, hh) {
        var x0 = x - bw / 2, x1 = x + bw / 2, y0 = y, y1 = y - hh;
        g.select(".f").attr("d", "M" + x0 + "," + y0 + "H" + x1 + "V" + y1 + "H" + x0 + "Z");
        g.select(".s").attr("d", "M" + x1 + "," + y0 + "L" + (x1 + bdx) + "," + (y0 - bdy) + "V" + (y1 - bdy) + "L" + x1 + "," + y1 + "Z");
        g.select(".c").attr("d", "M" + x0 + "," + y1 + "H" + x1 + "L" + (x1 + bdx) + "," + (y1 - bdy) + "H" + (x0 + bdx) + "Z");
      }
      function bars(animate) {
        var set = busyOn() ? top10() : [], f = String(Y), ids = {};
        set.forEach(function (r) { ids[r.id] = 1; });
        barG.selectAll("g.bar").filter(function () { return !ids[this.__id]; }).each(function () { delete barH[this.__id]; }).interrupt().remove();
        set.forEach(function (r) {
          var i = rows.indexOf(r), x = pts[i][0], y = pts[i][1], full = hS(r.b[f]);
          var g = barG.selectAll("g.bar").filter(function () { return this.__id === r.id; });
          if (g.empty()) {
            g = barG.append("g").attr("class", "bar");
            g.node().__id = r.id; g.node().__to = null;
            g.append("path").attr("class", "s").attr("fill", BC[1]); g.append("path").attr("class", "f").attr("fill", BC[0]); g.append("path").attr("class", "c").attr("fill", BC[2]);
            barH[r.id] = animate ? 0 : full; barPaths(g, x, y, barH[r.id]);
          }
          var node = g.node();
          if (node.__to !== null && Math.abs(node.__to - full) < 0.5) return;
          node.__to = full;
          var start = barH[r.id] || 0;
          if (!animate || Math.abs(start - full) < 0.5) { g.interrupt(); barH[r.id] = full; barPaths(g, x, y, full); return; }
          g.interrupt().transition().duration(start > 0 ? 350 : 500).ease(d3.easeCubicOut).tween("h", function () { var ip = d3.interpolateNumber(start, full); return function (u) { barH[r.id] = ip(u); barPaths(g, x, y, barH[r.id]); }; });
        });
        barG.selectAll("g.bar").sort(function () { return 0; });
        var order = set.map(function (r) { return r; }).sort(function (a, b) { return pts[rows.indexOf(a)][1] - pts[rows.indexOf(b)][1]; });
        order.forEach(function (r) { barG.selectAll("g.bar").filter(function () { return this.__id === r.id; }).raise(); });
        return set;
      }
      var layer = svg.append("g");
      // line ends open in year Y, both ends of each line
      function lineEnds(lk) {
        var s = segInfo[lk]; if (!s) return [];
        var on = []; for (var j = 0; j < s.cs.length; j++) if (s.vy[j] <= Y) on.push(j);
        if (on.length < 2) return [];
        var a = on[0], b = on[on.length - 1];
        var lift = WALLS ? wallT(lk) : 0;
        function pt(j, j2) { var p = P(s.cs[j][0], s.cs[j][1]), q = P(s.cs[j2][0], s.cs[j2][1]); p[1] -= lift; q[1] -= lift; var dx = p[0] - q[0], dy = p[1] - q[1], n = Math.sqrt(dx * dx + dy * dy) || 1; return { x: p[0], y: p[1], ux: dx / n, uy: dy / n }; }
        return [pt(b, Math.max(a, b - 3)), pt(a, Math.min(b, a + 3))];
      }
      function update(animate) {
        railG.selectAll("path").attr("stroke", function (d) { return muted(d.k); }).attr("opacity", function (d) { return d.open <= Y ? 1 : 0; });
        var rw = railG.selectAll("path").interrupt();
        (animate ? rw.transition().duration(450).ease(d3.easeCubicOut) : rw).attr("stroke-width", function (d) { return lineW(d.k, small); });
        dots.attr("display", function (r) { return open(r) ? null : "none"; }).attr("r", function (r, i) { return i === state.i ? RON : R; })
          .style("fill", function (r, i) { return metric === "age" ? dcol(r) : i === state.i ? "#c2410c" : null; })
          .classed("on", function (r, i) { return i === state.i; });
        dots.filter(function (r, i) { return i === state.i; }).raise();
        layer.selectAll("*").remove();
        walls(animate);
        var bset = bars(animate), bf = String(Y);
        var placed = [];
        var obs = rows.map(function (r, i) { return open(r) ? { x: pts[i][0] - R, y: pts[i][1] + R, w: 2 * R, h: 2 * R } : null; }).filter(Boolean);
        bset.forEach(function (r) { var i = rows.indexOf(r), hh = hS(r.b[bf]); obs.push({ x: pts[i][0] - bw / 2 - 1, y: pts[i][1] + 1, w: bw + bdx + 2, h: hh + bdy + 2 }); });
        function free(x, y, lw, lh, withObs) { if (x < 2 || x + lw > W - 2 || y - lh < 1 || y > H - 2) return false; var all = withObs ? placed.concat(obs) : placed; return !all.some(function (q) { return x < q.x + q.w + 2 && x + lw + 2 > q.x && y - lh < q.y + 1 && y + 1 > q.y - q.h - 1; }); }
        function place(text, ax, ay, cls, required, cands) {
          var t = layer.append("text").attr("class", "lbl " + cls).text(text);
          var bb = t.node().getBBox(), lw = bb.width, lh = bb.height * 0.8;
          cands = cands || [[ax - lw / 2, ay - 6], [ax + 6, ay - 3], [ax - lw - 6, ay - 3], [ax - lw / 2, ay + lh + 6]];
          var got = null;
          for (var s = 0; s < (required ? 30 : 4) && !got; s++) { var dys = s === 0 ? [0] : [-s * 5, s * 5]; for (var j = 0; j < dys.length && !got; j++) for (var m = 0; m < cands.length; m++) { var cx = cands[m][0], cy = cands[m][1] + dys[j]; if (free(cx, cy, lw, lh, true)) { got = [cx, cy]; break; } } }
          if (!got) { if (!required) { t.remove(); return null; } got = [Math.max(2, Math.min(W - lw - 2, cands[0][0])), Math.max(lh + 2, cands[0][1])]; }
          placed.push({ x: got[0], y: got[1], w: lw, h: lh });
          t.attr("x", got[0]).attr("y", got[1]);
          return got;
        }
        // hovered station
        if (state.i !== null && open(rows[state.i])) { var hp = pts[state.i]; obs.push({ x: hp[0] - RON, y: hp[1] + RON, w: 2 * RON, h: 2 * RON }); place(rows[state.i].name, hp[0], hp[1] - RON, "main", true); }
        // busiest station labels, tallest first, leader line when pushed away
        bset.forEach(function (r) {
          var i = rows.indexOf(r); if (i === state.i) return;
          var x = pts[i][0], top = pts[i][1] - hS(r.b[bf]) - bdy, txt = r.name + " " + fmt(r.b[bf]);
          var tm = layer.append("text").attr("class", "lbl busy").text(txt), tb = tm.node().getBBox(), lw = tb.width, lh = tb.height * 0.8; tm.remove();
          var cands = [];
          for (var gx = -220; gx <= 220; gx += 8) for (var gy = -140; gy <= 140; gy += 6) cands.push([x + gx - lw / 2, top - 4 + gy, gx * gx + 2 * gy * gy]);
          cands.sort(function (a, b) { return a[2] - b[2]; });
          var got = place(txt, x, top, "busy", false, [[x - lw / 2, top - 4], [x + bdx + 4, top + lh / 2], [x - lw - 4, top + lh / 2]].concat(cands));
          if (!got) got = place(txt, x, top, "busy", true, null);
          if (!got) return;
          var lb = placed[placed.length - 1], lx = Math.max(lb.x, Math.min(lb.x + lb.w, x + bdx / 2)), ly = lb.y > top ? lb.y - lb.h : lb.y + 1;
          if (Math.abs(ly - top) > 12 || lx === lb.x || lx === lb.x + lb.w) layer.insert("line", ":first-child").attr("class", "lead").attr("x1", x + bdx / 2).attr("y1", top).attr("x2", lx).attr("y2", ly);
        });
        // line end labels; B and D share one
        ["A", "B", "C", "D", "E", "K"].forEach(function (lk) {
          if (lk === "D" && lineEnds("B").length) return;
          if (lk === "K" && Y < 2022) return;
          var ends = lineEnds(lk); if (!ends.length) return;
          var v = metric === "b" ? lineB(lk, Y) : null;
          var txt = (lk === "B" || lk === "D" ? (lineEnds("D").length && lineEnds("B").length ? "B, D" : lk) : lk) + (v !== null ? " " + fmt(v) : "");
          var t = layer.append("text").attr("class", "lbl ln").text(txt), bb = t.node().getBBox(), lw = bb.width, lh = bb.height * 0.8; t.remove();
          var cands = [];
          ends.forEach(function (e) { var o = 9; var cx = e.x + e.ux * o, cy = e.y + e.uy * o; cands.push([e.ux >= 0 ? cx : cx - lw, cy + lh / 2], [cx - lw / 2, e.uy < 0 ? cy : cy + lh], [e.x + 6, e.y - 4], [e.x - lw - 6, e.y - 4], [e.x + 6, e.y + lh + 4], [e.x - lw - 6, e.y + lh + 4]); });
          var got = place(txt, ends[0].x, ends[0].y, "ln", true, cands);
          layer.select("text:last-child").style("fill", LINES[lk].color === "#FDB913" ? "#8a6a00" : d3.color(LINES[lk].color).darker(0.4));
        });
        // pins for stations opened this year or last year
        var yrDone = [];
        rows.forEach(function (r, i) {
          var yo = oy(r); if (!open(r) || Y - yo > 1) return;
          var x = pts[i][0], y = pts[i][1], top = y - 13;
          layer.insert("line", ":first-child").attr("class", "pin").attr("x1", x).attr("x2", x).attr("y1", y - R).attr("y2", top);
          layer.append("circle").attr("class", "pinhead").attr("cx", x).attr("cy", top).attr("r", 1.8);
          if (i === state.i || yrDone.some(function (q) { return q.y === yo && Math.abs(q.x - x) < 60 && Math.abs(q.yy - y) < 30; })) return;
          yrDone.push({ y: yo, x: x, yy: y });
          place(String(yo), x, top, "yr", false, [[x - 11, top - 3], [x + 4, top + 2], [x - 26, top + 2]]);
        });
      }
      api.update = update;
      function nearest(ev) {
        var p = d3.pointer(ev, svg.node()), best = null, bd = small ? 22 : 16;
        rows.forEach(function (r, i) { if (!open(r)) return; var ddx = p[0] - pts[i][0], ddy = p[1] - pts[i][1], dist = Math.sqrt(ddx * ddx + ddy * ddy); if (dist < bd) { bd = dist; best = i; } });
        return best;
      }
      svg.on("pointermove", function (ev) { if (ev.pointerType !== "mouse" || state.pinned) return; var i = nearest(ev); if (i !== state.i) { state.i = i; showPanel(i === null ? null : rows[i]); update(false); } })
        .on("pointerleave", function (ev) { if (ev.pointerType !== "mouse" || state.pinned) return; state.i = null; showPanel(null); update(false); })
        .on("click", function (ev) { var i = nearest(ev); if (i === null || (state.pinned && i === state.i)) { state.pinned = false; state.i = null; showPanel(null); } else { state.pinned = true; state.i = i; showPanel(rows[i]); } update(false); });
      api.pick = function (name) { var i = rows.findIndex(function (r) { return r.name === name; }); state.i = i; state.pinned = true; showPanel(rows[i]); update(false); };
      api.pts = function () { return rows.map(function (r, i) { var b = svg.node().getBoundingClientRect(), s = b.width / W; return { name: r.name, x: b.left + pts[i][0] * s, y: b.top + pts[i][1] * s }; }); };
      update(true);
    }
    busyCb.addEventListener("change", function () { refresh(true); });
    function refresh(animate) { yv.textContent = Y; busyUi(); legend(); tables(); if (api.update) api.update(animate); fixPanel(); }
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.textContent = "Play"; }
    play.onclick = function () {
      if (timer) { stop(); return; }
      if (Y >= Y1) { Y = Y0; slider.value = Y; refresh(false); }
      play.textContent = "Pause";
      timer = setInterval(function () { if (Y >= Y1) { stop(); return; } Y += 1; slider.value = Y; refresh(true); }, 650);
    };
    slider.oninput = function () { stop(); Y = +slider.value; refresh(true); };
    sel.onchange = function () { metric = sel.value; refresh(true); };
    busyUi(); legend(); tables(); draw(); fixPanel();
    window.__lam = api;
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); fixPanel(); } });
  });
})();
