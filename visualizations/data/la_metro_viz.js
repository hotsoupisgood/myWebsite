(function () {
  var el = document.getElementById("lam-map");
  var FY = ["2024", "2025", "2026"];
  var Y0 = 1990, Y1 = 2026;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var fmt = d3.format(",");
  function sgn(v) { return (v > 0 ? "+" : v < 0 ? "minus " : "") + fmt(Math.abs(v)); }
  function oy(r) { return +r.opened.slice(0, 4); }
  function odate(r) { var p = r.opened.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0]; }
  function yrs(n) { return n + (n === 1 ? " year" : " years"); }
  function partial(r, y) { var a = (y - 1) + "-07-01", b = y + "-06-30"; return r.opened >= a && r.opened <= b; }
  Promise.all([d3.json("/visualizations/data/ca-counties-10m.json"), d3.json("/visualizations/data/la_metro_stations.json"), d3.json("/visualizations/data/la_metro_contours.json")]).then(function (res) {
    var topo = res[0], data = res[1], contours = res[2], terr = document.getElementById("lam-terrain"), rows = data.stations, LINES = data.lines;
    var sel = document.getElementById("lam-metric"), box = document.getElementById("lam-colors");
    var slider = document.getElementById("lam-slider"), play = document.getElementById("lam-play"), yv = document.getElementById("lam-yv");
    var panel = document.getElementById("lam-panel");
    var LR = data.line_ridership || { fy: {} }, LFY = LR.fy;
    function lkey(k) { return k === "B" || k === "D" ? "BD" : k; }
    function lname(q) { return q === "BD" ? "B and D Lines" : q + " Line"; }
    var LFROM = LR.from || {};
    function lineB(k, y) { var q = lkey(k), s = LFY[q]; if (!s || y < (LFROM[q] || 0)) return null; var v = s[y]; return v === undefined ? null : v; }
    var LMAX = 0; Object.keys(LFY).forEach(function (q) { Object.keys(LFY[q]).forEach(function (y) { if (+y >= (LFROM[q] || 0)) LMAX = Math.max(LMAX, LFY[q][y]); }); });
    var LY = []; Object.keys(LFY).forEach(function (q) { Object.keys(LFY[q]).forEach(function (y) { if (LY.indexOf(+y) < 0) LY.push(+y); }); }); LY.sort();
    function anyLine(y) { return Object.keys(LINES).some(function (k) { return lineB(k, y) !== null; }); }
    function wScale(small) { return d3.scaleSqrt().domain([0, LMAX]).range([0, small ? 7 : 10]); }
    function lineW(k, small) { var v = lineB(k, Y); if (v === null) return small ? 1.4 : 1.8; return Math.max(small ? 1.4 : 1.8, wScale(small)(v)); }
    var metric = sel.value, Y = +slider.value;
    function open(r) { return oy(r) <= Y; }
    function val(r, m, y) {
      m = m || metric; y = y === undefined ? Y : y;
      if (oy(r) > y) return undefined;
      if (m === "b") return r.b[y] === undefined ? null : r.b[y];
      if (m === "age") return y - oy(r);
      if (y <= 2024 || r.b[y] === undefined || r.b["2024"] === undefined) return null;
      return r.b[y] - r.b["2024"];
    }
    var maxAll = {};
    ["b", "age", "chg"].forEach(function (m) { var mx = 0; rows.forEach(function (r) { for (var y = Y0; y <= Y1; y++) { var v = val(r, m, y); if (v) mx = Math.max(mx, Math.abs(v)); } }); maxAll[m] = mx; });
    function fmtv(r, m) {
      m = m || metric; var v = val(r, m);
      if (m === "b") return fmt(v) + " boardings";
      if (m === "age") return yrs(v) + " open";
      return sgn(v) + " boardings";
    }
    function fyText(y) { return "fiscal year " + y + " (July " + (y - 1) + " to June " + y + ")"; }
    function note() {
      var n = document.getElementById("lam-note"), t;
      var cnt = rows.filter(open).length;
      if (metric === "b") t = Y >= 2024 ? "Bar height: average weekday boardings at each station, " + fyText(Y) + ". " + cnt + " stations open in " + Y + "." : cnt + " stations open in " + Y + ". Boardings by station are available from fiscal year 2024. Move the slider to 2024 or later to show bars.";
      else if (metric === "age") t = "Bar height: years since the station opened, counted in " + Y + ". " + cnt + " stations open in " + Y + ".";
      else t = Y >= 2025 ? "Bar height: change in average weekday boardings from fiscal year 2024 to " + fyText(Y) + "." : "Change is measured from fiscal year 2024. Move the slider to 2025 or 2026 to show bars.";
      n.textContent = t;
      var L = document.getElementById("lam-legend");
      var h = metric === "chg" ? '<span><i class="sw" style="background:#e56a32"></i>More boardings than in fiscal year 2024</span><span><i class="sw" style="background:#2b8f86"></i>Fewer boardings</span>' : '<span><i class="sw" style="background:#e56a32"></i>Bar height: ' + (metric === "b" ? "boardings per weekday" : "years open") + '</span>';
      if (terr.checked) h += '<span><i class="sw" style="background:none;border-top:1.5px solid #b08a5a;height:0;border-radius:0;vertical-align:3px"></i>Contours every 100 m of elevation</span>';
      h += '<span><i class="sw" style="background:#2a1a10;width:2px"></i>Pin: opened in the last 5 years, with its opening year</span>';
      var small = el.clientWidth < 520, ws = wScale(small);
      if (anyLine(Y)) {
        h += '<span>Line width: average weekday boardings on the line, ' + fyText(Y) + ', 3 widths shown:</span>';
        [20000, 60000, 120000].forEach(function (v) { var sw = Math.max(small ? 1.4 : 1.8, ws(v)); h += '<span><svg width="26" height="12" style="vertical-align:-1px;margin-right:.3rem"><line x1="1" x2="25" y1="6" y2="6" stroke="#8a6a48" stroke-width="' + sw.toFixed(1) + '" stroke-linecap="round"/></svg>' + fmt(v) + ' boardings</span>'; });
        var miss = Object.keys(LINES).filter(function (k) { return lineB(k, Y) === null; }).sort();
        if (miss.length) h += '<span>Thin line: no line data for the ' + miss.map(function (k) { return k + " Line"; }).join(", ") + ' in this year</span>';
      } else h += '<span>Line width: no line data for this year, so all lines are drawn thin</span>';
      if (box.checked) h += Object.keys(LINES).sort().map(function (k) { return '<span><i class="sw" style="background:' + muted(k) + '"></i>' + k + ' Line</span>'; }).join("");
      L.innerHTML = h;
    }
    function muted(k) { return d3.interpolateRgb(LINES[k].color, "#f1e3c8")(0.35); }
    function dataYear() { return Y >= 2024 ? Y : 2024; }
    function tables() {
      var dy = dataYear(), list = rows.filter(function (r) { return open(r) && r.b[dy] !== undefined; });
      list.sort(function (a, b) { return b.b[dy] - a.b[dy]; });
      d3.select("#lam-t1 caption").text("Busiest 10 stations open in " + Y + ", average weekday boardings in fiscal year " + dy);
      d3.select("#lam-t1 thead tr").selectAll("th").data(["Station", "Lines", "Boardings"]).join("th").text(function (d) { return d; });
      d3.select("#lam-t1 tbody").selectAll("tr").data(list.slice(0, 10)).join("tr").html(function (r) { return "<td>" + r.name + "</td><td>" + r.lines.join(", ") + "</td><td>" + fmt(r.b[dy]) + " boardings</td>"; });
      var nw = rows.filter(open).sort(function (a, b) { return b.opened.localeCompare(a.opened) || a.name.localeCompare(b.name); }).slice(0, 10);
      d3.select("#lam-t2 caption").text("Newest 10 stations open in " + Y);
      d3.select("#lam-t2 thead tr").selectAll("th").data(["Station", "Opened", "Age in " + Y]).join("th").text(function (d) { return d; });
      d3.select("#lam-t2 tbody").selectAll("tr").data(nw).join("tr").html(function (r) { return "<td>" + r.name + "</td><td>" + odate(r) + "</td><td>" + yrs(Y - oy(r)) + "</td>"; });
    }
    function chip(k) { return '<span class="lam-chip" style="background:' + LINES[k].color + ';color:' + (k === "E" || k === "K" ? "#2a1a10" : "#fff") + '">' + k + "</span>"; }
    function showPanel(r) {
      if (!r) { panel.innerHTML = '<p class="lam-hint">Hover or tap a station for its numbers.</p>'; return; }
      var h = "<h3>" + r.name + "</h3><p>" + r.lines.map(chip).join("") + " " + r.lines.map(function (k) { return k + " Line"; }).join(", ") + "</p>";
      h += "<p>Opened " + odate(r) + ". " + (open(r) ? yrs(Y - oy(r)) + " open in " + Y + "." : "Not yet open in " + Y + ".") + "</p>";
      var dy = dataYear();
      if (r.b[dy] !== undefined) h += "<p>" + fmt(r.b[dy]) + " average weekday boardings in fiscal year " + dy + (partial(r, dy) ? ", opened during that fiscal year" : "") + ".</p>";
      if (metric === "chg" && val(r) !== null && val(r) !== undefined) h += "<p>" + sgn(val(r)) + " boardings since fiscal year 2024.</p>";
      var lks = []; r.lines.forEach(function (k) { var q = lkey(k); if (LFY[q] && lks.indexOf(q) < 0) lks.push(q); });
      if (lks.length) {
        var w2 = 240, h2 = 130, m2 = { l: 44, r: 30, t: 16, b: 30 };
        var series = lks.map(function (q) { return { q: q, p: LY.filter(function (y) { return LFY[q][y] !== undefined && y >= (LFROM[q] || 0); }).map(function (y) { return [y, LFY[q][y]]; }) }; });
        var xs2 = [].concat.apply([], series.map(function (s) { return s.p.map(function (p) { return p[0]; }); }));
        var x2 = d3.scaleLinear().domain(d3.extent(xs2)).range([m2.l, w2 - m2.r]);
        var nT = d3.max(xs2) - d3.min(xs2) < 5 ? d3.max(xs2) - d3.min(xs2) : 4;
        var y2 = d3.scaleLinear().domain([0, d3.max(series, function (s) { return d3.max(s.p, function (p) { return p[1]; }); }) * 1.1]).nice(3).range([h2 - m2.b, m2.t]);
        var s2 = '<p class="lam-sub">' + lks.map(lname).join(", ") + ': average weekday boardings on the whole line, LA Metro figures.</p><svg viewBox="0 0 ' + w2 + " " + h2 + '" role="img" aria-label="Average weekday boardings by fiscal year on ' + lks.map(lname).join(", ") + '">';
        y2.ticks(3).forEach(function (t) { s2 += '<line x1="' + m2.l + '" x2="' + (w2 - m2.r) + '" y1="' + y2(t) + '" y2="' + y2(t) + '" stroke="#ead9bd"/><text class="ax" x="' + (m2.l - 4) + '" y="' + (y2(t) + 3) + '" text-anchor="end">' + fmt(t) + "</text>"; });
        x2.ticks(nT).map(Math.round).filter(function (t, i, a) { return a.indexOf(t) === i; }).forEach(function (t) { s2 += '<line x1="' + x2(t) + '" x2="' + x2(t) + '" y1="' + (h2 - m2.b) + '" y2="' + (h2 - m2.b + 3) + '" stroke="#6b5440"/><text class="ax" x="' + x2(t) + '" y="' + (h2 - m2.b + 13) + '" text-anchor="middle">' + t + "</text>"; });
        s2 += '<text class="ax" x="' + m2.l + '" y="10">Average weekday boardings</text><text class="ax" x="' + ((m2.l + w2 - m2.r) / 2) + '" y="' + (h2 - 2) + '" text-anchor="middle">Fiscal year, ending in June</text>';
        if (xs2.indexOf(Y) >= 0) s2 += '<line x1="' + x2(Y) + '" x2="' + x2(Y) + '" y1="' + m2.t + '" y2="' + (h2 - m2.b) + '" stroke="#8a2d08" stroke-dasharray="2 2"/>';
        series.forEach(function (s) {
          var col = LINES[s.q === "BD" ? "B" : s.q].color;
          if (s.p.length > 1) s2 += '<path fill="none" stroke="' + col + '" stroke-width="2" d="' + d3.line().x(function (p) { return x2(p[0]); }).y(function (p) { return y2(p[1]); })(s.p) + '"/>';
          s.p.forEach(function (p) { if (p[0] === Y) s2 += '<circle cx="' + x2(p[0]) + '" cy="' + y2(p[1]) + '" r="3.5" fill="' + col + '" stroke="#2a1a10"/>'; });
        });
        var ends = series.filter(function (s) { return s.p.length; }).map(function (s) { var l = s.p[s.p.length - 1]; return { t: s.q === "BD" ? "B, D" : s.q, x: x2(l[0]) + 5, y: y2(l[1]) + 3 }; }).sort(function (a, b) { return a.y - b.y; });
        ends.forEach(function (e, i) { if (i && e.y - ends[i - 1].y < 10) e.y = ends[i - 1].y + 10; });
        ends.forEach(function (e) { s2 += '<text class="ax" style="font-weight:700" x="' + e.x + '" y="' + e.y + '">' + e.t + "</text>"; });
        s2 += "</svg>";
        lks.forEach(function (q) { var v = LFY[q][Y]; s2 += "<p>" + lname(q) + ": " + (v !== undefined && Y >= (LFROM[q] || 0) ? fmt(v) + " average weekday boardings in fiscal year " + Y : "no line data for fiscal year " + Y) + ".</p>"; });
        h += s2;
      }
      var pts = FY.filter(function (y) { return r.b[y] !== undefined; }).map(function (y) { return [+y, r.b[y]]; });
      if (pts.length) {
        h += '<p class="lam-sub">' + r.name + ': average weekday boardings at this station.</p>';
        var w = 240, hh = 120, m = { l: 44, r: 12, t: 16, b: 30 };
        var x = d3.scalePoint().domain(FY.map(Number)).range([m.l, w - m.r]).padding(0.3);
        var ymax = d3.max(pts, function (p) { return p[1]; }) * 1.15;
        var y = d3.scaleLinear().domain([0, ymax]).nice(3).range([hh - m.b, m.t]);
        var s = '<svg viewBox="0 0 ' + w + " " + hh + '" role="img" aria-label="Average weekday boardings by fiscal year at ' + r.name + '">';
        y.ticks(3).forEach(function (t) { s += '<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="#ead9bd"/><text class="ax" x="' + (m.l - 4) + '" y="' + (y(t) + 3) + '" text-anchor="end">' + d3.format("~s")(t).replace("k", ",000") + "</text>"; });
        FY.forEach(function (fy) { s += '<text class="ax" x="' + x(+fy) + '" y="' + (hh - m.b + 13) + '" text-anchor="middle">FY ' + fy + "</text>"; });
        s += '<text class="ax" x="' + m.l + '" y="10">Average weekday boardings</text>';
        s += '<text class="ax" x="' + ((m.l + w - m.r) / 2) + '" y="' + (hh - 2) + '" text-anchor="middle">Fiscal year, ending in June</text>';
        if (pts.length > 1) s += '<path fill="none" stroke="#c2410c" stroke-width="2" d="' + d3.line().x(function (p) { return x(p[0]); }).y(function (p) { return y(p[1]); })(pts) + '"/>';
        pts.forEach(function (p) { var on = p[0] === dy; s += '<circle cx="' + x(p[0]) + '" cy="' + y(p[1]) + '" r="' + (on ? 4.5 : 3) + '" fill="' + (on ? "#8a2d08" : "#c2410c") + '"/>'; });
        s += "</svg>";
        h += s;
      }
      panel.innerHTML = h;
    }
    var state = { i: null, pinned: false };
    var api = {};
    function draw() {
      el.innerHTML = "";
      var W = Math.max(300, el.clientWidth), small = W < 520;
      var B = 1000;
      var mp = { type: "MultiPoint", coordinates: [[-118.54, 33.74], [-117.72, 34.22], [-118.54, 34.22], [-117.72, 33.74]] };
      var base = d3.geoConicEqualArea().parallels([33.6, 34.4]).rotate([118.1, 0]).fitSize([B, B], mp);
      var bpath0 = d3.geoPath(base), ext = bpath0.bounds(mp);
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
      var edge = small ? 5 : 7, pad = 6, maxH = W * (small ? 0.22 : 0.17);
      k = (W - 2 * pad) / (rx1 - rx0); tx = pad - rx0 * k; ty = -ry0 * k;
      function P(lon, lat) { var q = base([lon, lat]); return tiltPt(q[0], q[1]); }
      var pts = rows.map(function (r) { return P(r.lon, r.lat); });
      var topRoom = 16;
      rows.forEach(function (r, i) { var rel = 0; ["b", "age", "chg"].forEach(function (m) { for (var y = Y0; y <= Y1; y++) { var v = val(r, m, y); if (v) rel = Math.max(rel, Math.abs(v) / maxAll[m]); } }); topRoom = Math.max(topRoom, maxH * rel + 34 - pts[i][1]); });
      ty += topRoom; pts.forEach(function (q) { q[1] += topRoom; });
      var H = Math.ceil(ty + ry1 * k + edge + 10);
      var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      var defs = svg.append("defs");
      defs.append("filter").attr("id", "lam-blur").attr("x", "-10%").attr("y", "-10%").attr("width", "120%").attr("height", "120%").append("feGaussianBlur").attr("stdDeviation", 5);
      svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent");
      var land = topojson.merge(topo, topo.objects.counties.geometries);
      var landD = path(land);
      svg.append("path").attr("class", "shadow").attr("d", landD).attr("transform", "translate(5," + (edge + 6) + ")").attr("filter", "url(#lam-blur)");
      for (var e = edge; e > 0; e--) svg.append("path").attr("class", "slab").attr("d", landD).attr("transform", "translate(0," + e + ")");
      svg.append("path").attr("class", "land").attr("d", landD);
      svg.append("path").attr("class", "lac").attr("d", path(topojson.mesh(topo, topo.objects.counties, function (a, b) { return a !== b && (a.id === "06037" || b.id === "06037"); })));
      var topoG = svg.append("g").attr("class", "topo-g").attr("display", terr.checked ? null : "none");
      topoG.selectAll("path").data(contours.features).join("path").attr("class", function (f) { return f.properties.elev % 500 === 0 ? "topo major" : "topo"; }).attr("d", path);
      [500, 1000].forEach(function (lv) {
        var f = contours.features.filter(function (q) { return q.properties.elev === lv; })[0]; if (!f || small) return;
        var best = null; f.geometry.coordinates.forEach(function (ln) { if (!best || ln.length > best.length) best = ln; });
        var c = best[Math.floor(best.length * 0.4)], q = P(c[0], c[1]);
        if (q[0] > 20 && q[0] < W - 40) topoG.append("text").attr("class", "topo-lbl").attr("x", q[0]).attr("y", q[1]).text(lv + " m");
      });
      var places = [["Santa Monica", -118.47, 33.985], ["Long Beach", -118.17, 33.795], ["Downtown", -118.25, 34.025], ["Pasadena", -118.13, 34.17], ["Pomona", -117.77, 34.035], ["North Hollywood", -118.385, 34.19], ["Norwalk", -118.08, 33.895]];
      if (!small) svg.append("g").selectAll("text").data(places).join("text").attr("class", "place").attr("x", function (d) { return P(d[1], d[2])[0]; }).attr("y", function (d) { return P(d[1], d[2])[1]; }).text(function (d) { return d[0]; });
      var railG = svg.append("g");
      var lineOrder = ["E", "C", "K", "A", "D", "B"];
      lineOrder.forEach(function (lk) {
        var ls = LINES[lk]; if (!ls) return;
        var stOf = rows.filter(function (r) { return r.lines.indexOf(lk) >= 0; });
        // each piece of track takes the later opening year of the two stations around it
        var cs = ls.path, idx = stOf.map(function (r) { var bi = 0, bd = Infinity; cs.forEach(function (c, j) { var d = (c[0] - r.lon) * (c[0] - r.lon) + (c[1] - r.lat) * (c[1] - r.lat); if (d < bd) { bd = d; bi = j; } }); return { j: bi, y: oy(r) }; }).sort(function (a, b) { return a.j - b.j; });
        var vy = cs.map(function (c, j) { var a = null, b = null; idx.forEach(function (s) { if (s.j <= j) a = s; if (s.j >= j && !b) b = s; }); return Math.max(a ? a.y : b.y, b ? b.y : a.y); });
        var segs = [], cur = null;
        for (var j = 1; j < cs.length; j++) { var yy = Math.max(vy[j - 1], vy[j]); if (!cur || cur.y !== yy) { cur = { y: yy, c: [cs[j - 1]] }; segs.push(cur); } cur.c.push(cs[j]); }
        segs.forEach(function (sg) { railG.append("path").datum({ k: lk, open: sg.y, geo: { type: "LineString", coordinates: sg.c } }).attr("class", "rail").attr("d", function (d) { return path(d.geo); }); });
      });
      var dots = svg.append("g").selectAll("circle").data(rows).join("circle").attr("class", "dot").attr("cx", function (r, i) { return pts[i][0]; }).attr("cy", function (r, i) { return pts[i][1]; }).attr("r", small ? 1.8 : 2.2);
      var layer = svg.append("g");
      var bw = small ? 4 : 5, dx = bw * 0.5, dy = bw * 0.35;
      var COL = { pos: ["#e56a32", "#b8400e", "#f9b277"], posOn: ["#c2410c", "#8a2d08", "#e56a32"], neg: ["#3fa69c", "#2a7d75", "#7fc8c0"], negOn: ["#14736b", "#0b4f49", "#2b8f86"] };
      var prevH = {};
      function hgt(v) { return v ? Math.max(2, maxH * (metric === "age" ? 0.55 : 1) * Math.abs(v) / maxAll[metric]) : 0; }
      function update(animate) {
        railG.selectAll("path").attr("stroke", function (d) { return box.checked ? muted(d.k) : "#b89a74"; }).attr("opacity", function (d) { return d.open <= Y ? 1 : 0; });
        var rw = railG.selectAll("path").interrupt();
        (animate ? rw.transition().duration(450).ease(d3.easeCubicOut) : rw).attr("stroke-width", function (d) { return lineW(d.k, small); });
        dots.attr("display", function (r) { return open(r) ? null : "none"; }).classed("on", function (r, i) { return i === state.i; });
        layer.selectAll("*").interrupt().remove();
        var items = rows.map(function (r, i) { var v = val(r); return { i: i, r: r, x: pts[i][0], y: pts[i][1], v: v, h: v === undefined || v === null ? 0 : hgt(v) }; }).filter(function (d) { return d.v !== undefined; });
        items.sort(function (a, b) { return a.y - b.y; });
        var t = animate ? 350 : 0;
        items.forEach(function (d) {
          if (!d.h) { prevH[d.r.id] = 0; return; }
          var on = d.i === state.i, col = d.v < 0 ? (on ? COL.negOn : COL.neg) : (on ? COL.posOn : COL.pos);
          var g = layer.append("g");
          var f = g.append("path").attr("fill", col[0]), s = g.append("path").attr("fill", col[1]), cc = g.append("path").attr("fill", col[2]);
          function bp(hh) {
            var x0 = d.x - bw / 2, x1 = d.x + bw / 2, y0 = d.y, y1 = d.y - hh;
            f.attr("d", "M" + x0 + "," + y0 + "H" + x1 + "V" + y1 + "H" + x0 + "Z");
            s.attr("d", "M" + x1 + "," + y0 + "L" + (x1 + dx) + "," + (y0 - dy) + "V" + (y1 - dy) + "L" + x1 + "," + y1 + "Z");
            cc.attr("d", "M" + x0 + "," + y1 + "H" + x1 + "L" + (x1 + dx) + "," + (y1 - dy) + "H" + (x0 + dx) + "Z");
          }
          var from = prevH[d.r.id] || 0, to = d.h;
          prevH[d.r.id] = to;
          if (!t || Math.abs(from - to) < 0.5) bp(to);
          else { bp(from); g.transition().duration(t).ease(d3.easeCubicOut).tween("h", function () { var ip = d3.interpolateNumber(from, to); return function (u) { bp(ip(u)); }; }); }
        });
        rows.forEach(function (r) { if (!open(r)) prevH[r.id] = 0; });
        // pins for stations opened in the last 5 years
        var pinItems = items.filter(function (d) { return Y - oy(d.r) <= 4; });
        pinItems.forEach(function (d) {
          var top = d.y - d.h - dy - 4, ph = 12;
          layer.append("line").attr("class", "pin").attr("x1", d.x - bw / 2 - 1.5).attr("x2", d.x - bw / 2 - 1.5).attr("y1", d.y).attr("y2", Math.min(d.y - ph, top + 2));
          layer.append("circle").attr("class", "pinhead").attr("cx", d.x - bw / 2 - 1.5).attr("cy", Math.min(d.y - ph, top + 2)).attr("r", 1.8);
          d.pinTop = Math.min(d.y - ph, top + 2);
        });
        // labels: hovered station, top stations, then pin years where there is room
        var placed = [];
        var obs = items.filter(function (d) { return d.h; }).map(function (d) { return { x: d.x - bw / 2 - 1, y: d.y + 1, w: bw + dx + 2, h: d.h + dy + 2 }; });
        var lab = [];
        if (state.i !== null && open(rows[state.i])) lab.push({ d: items.filter(function (d) { return d.i === state.i; })[0], main: true });
        if (metric !== "age") {
          var ranked = items.filter(function (d) { return d.v !== null && d.i !== state.i; }).sort(function (a, b) { return b.v - a.v; });
          var nTop = small ? 2 : 3;
          ranked.slice(0, nTop).forEach(function (d) { lab.push({ d: d }); });
          if (metric === "chg") ranked.filter(function (d) { return d.v < 0; }).slice(-1).forEach(function (d) { lab.push({ d: d }); });
        }
        function place(text, d, cls, anchorTop, required) {
          var tx2 = layer.append("text").attr("class", "lbl " + cls).text(text);
          var bb = tx2.node().getBBox(), lw = bb.width, lh = bb.height;
          var all = placed.concat(obs);
          function free(x, y) { if (x < 2 || x + lw > W - 2 || y - lh < 1 || y > H - 2) return false; return !all.some(function (q) { return x < q.x + q.w + 2 && x + lw + 2 > q.x && y - lh < q.y + 2 && y + 1 > q.y - q.h - 2; }); }
          var x = null, y = null, bs = anchorTop - 4, xs = [d.x - lw / 2, d.x + bw + 4, d.x - bw - 4 - lw];
          var tries = required ? 40 : 6;
          outer: for (var s2 = 0; s2 < tries; s2++) { var dys = s2 === 0 ? [0] : [-s2 * 4, s2 * 4]; for (var j = 0; j < dys.length; j++) for (var m = 0; m < xs.length; m++) { var cx = Math.max(2, Math.min(W - lw - 2, xs[m])), cy = Math.max(lh + 2, bs + dys[j]); if (free(cx, cy)) { x = cx; y = cy; break outer; } } }
          if (x === null) { if (!required) { tx2.remove(); return; } x = Math.max(2, Math.min(W - lw - 2, xs[0])); y = Math.max(lh + 2, bs); }
          placed.push({ x: x, y: y, w: lw, h: lh });
          if (Math.abs(y - bs) > 6 || Math.abs(x - xs[0]) > 6) layer.insert("line", ":first-child").attr("class", "lead").attr("x1", d.x).attr("y1", anchorTop).attr("x2", Math.max(x, Math.min(x + lw, d.x))).attr("y2", y + 2);
          tx2.attr("x", x).attr("y", y);
        }
        lab.forEach(function (L) { if (!L.d) return; place(L.d.r.name + ": " + (L.d.v === null ? "no data" : fmtv(L.d.r)), L.d, L.main ? "main" : "", (L.d.pinTop !== undefined ? Math.min(L.d.pinTop, L.d.y - L.d.h - dy) : L.d.y - L.d.h - dy) - 2, true); });
        var yrDone = [];
        pinItems.sort(function (a, b) { return b.r.opened.localeCompare(a.r.opened); }).forEach(function (d) { if (d.i === state.i) return; var y0 = oy(d.r); if (yrDone.some(function (q) { return q.y === y0 && Math.abs(q.x - d.x) < 70 && Math.abs(q.yy - d.y) < 40; })) return; yrDone.push({ y: y0, x: d.x, yy: d.y }); place(String(y0), d, "yr", d.pinTop - 1, false); });
      }
      api.update = update;
      function nearest(ev) {
        var p = d3.pointer(ev, svg.node()), sc = W / svg.node().getBoundingClientRect().width;
        var best = null, bd = (small ? 22 : 16);
        rows.forEach(function (r, i) {
          if (!open(r)) return;
          var x = pts[i][0], y = pts[i][1], v = val(r), hh = v ? hgt(v) : 0;
          var ddx = Math.abs(p[0] - x), ddy = p[1] > y ? p[1] - y : (p[1] < y - hh ? y - hh - p[1] : 0);
          var dist = Math.sqrt(ddx * ddx * 1.6 + ddy * ddy);
          if (dist < bd) { bd = dist; best = i; }
        });
        return best;
      }
      svg.on("pointermove", function (ev) { if (ev.pointerType !== "mouse" || state.pinned) return; var i = nearest(ev); if (i !== state.i) { state.i = i; showPanel(i === null ? null : rows[i]); update(false); } })
        .on("pointerleave", function (ev) { if (ev.pointerType !== "mouse" || state.pinned) return; state.i = null; showPanel(null); update(false); })
        .on("click", function (ev) { var i = nearest(ev); if (i === null || (state.pinned && i === state.i)) { state.pinned = false; state.i = null; showPanel(null); } else { state.pinned = true; state.i = i; showPanel(rows[i]); } update(false); });
      api.pick = function (name) { var i = rows.findIndex(function (r) { return r.name === name; }); state.i = i; state.pinned = true; showPanel(rows[i]); update(false); };
      update(true);
    }
    function refresh(animate) { yv.textContent = Y; note(); tables(); if (api.update) api.update(animate); if (state.i !== null) showPanel(rows[state.i]); }
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.textContent = "Play"; }
    play.onclick = function () {
      if (timer) { stop(); return; }
      if (Y >= Y1) { Y = Y0; slider.value = Y; refresh(false); }
      play.textContent = "Pause";
      timer = setInterval(function () { if (Y >= Y1) { stop(); return; } Y += 1; slider.value = Y; refresh(true); }, 550);
    };
    slider.oninput = function () { stop(); Y = +slider.value; refresh(true); };
    sel.onchange = function () { metric = sel.value; refresh(true); };
    box.onchange = function () { refresh(false); };
    terr.onchange = function () { d3.select("#lam-map .topo-g").attr("display", terr.checked ? null : "none"); note(); };
    note(); tables(); draw();
    window.__lam = api;
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () { if (el.clientWidth !== lastW) { lastW = el.clientWidth; draw(); } });
  });
})();
