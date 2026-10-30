(function () {
  var el = document.getElementById("lam-map");
  var FY = ["2024", "2025", "2026"];
  var Y0 = 1990, Y1 = 2026;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var fmt = d3.format(",");
  var DEC = [1990, 2000, 2010, 2020], DCOL = ["#fcd9a0", "#f4a259", "#d9541e", "#8a2d08"];
  function oy(r) { return +r.opened.slice(0, 4); }
  function dcol(r) { return DCOL[Math.min(3, Math.max(0, Math.floor((oy(r) - 1990) / 10)))]; }
  function odate(r) { var p = r.opened.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0]; }
  function yrs(n) { return n + (n === 1 ? " year" : " years"); }
  function partial(r, y) { var a = (y - 1) + "-07-01", b = y + "-06-30"; return r.opened >= a && r.opened <= b; }
  Promise.all([d3.json("/visualizations/data/ca-counties-10m.json"), d3.json("/visualizations/data/la_metro_stations.json"), d3.json("/visualizations/data/la_metro_contours.json")]).then(function (res) {
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
    function lineW(k, small) { var thin = small ? 1.4 : 1.8; if (metric === "age") return thin; var v = lineB(k, Y); if (v === null) return thin; return Math.max(thin, wScale(small)(v)); }
    var Y = +slider.value, metric = "b";
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
      if (metric === "b") h = cnt + " stations open in " + Y + ". Line width: average weekday boardings on the line in fiscal year " + Y + ", shown at each line's end." + (Y < 2009 ? " Line figures start in fiscal year 2009, so lines are thin before then." : "") + " Pins: stations opened in " + (Y - 1) + " or " + Y + ".";
      else { h = cnt + " stations open in " + Y + ". Dot color: decade the station opened:"; DEC.forEach(function (d, i) { h += '<i class="sw" style="background:' + DCOL[i] + '"></i>' + d + "s"; }); h += ". Pins: stations opened in " + (Y - 1) + " or " + Y + "."; }
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
      var railG = svg.append("g");
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
      var layer = svg.append("g");
      // line ends open in year Y, both ends of each line
      function lineEnds(lk) {
        var s = segInfo[lk]; if (!s) return [];
        var on = []; for (var j = 0; j < s.cs.length; j++) if (s.vy[j] <= Y) on.push(j);
        if (on.length < 2) return [];
        var a = on[0], b = on[on.length - 1];
        function pt(j, j2) { var p = P(s.cs[j][0], s.cs[j][1]), q = P(s.cs[j2][0], s.cs[j2][1]); var dx = p[0] - q[0], dy = p[1] - q[1], n = Math.sqrt(dx * dx + dy * dy) || 1; return { x: p[0], y: p[1], ux: dx / n, uy: dy / n }; }
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
        var placed = [];
        var obs = rows.map(function (r, i) { return open(r) ? { x: pts[i][0] - R, y: pts[i][1] + R, w: 2 * R, h: 2 * R } : null; }).filter(Boolean);
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
    function refresh(animate) { yv.textContent = Y; legend(); tables(); if (api.update) api.update(animate); fixPanel(); }
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
    legend(); tables(); draw(); fixPanel();
    window.__lam = api;
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); fixPanel(); } });
  });
})();
