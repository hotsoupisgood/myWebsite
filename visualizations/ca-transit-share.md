---
title: San Francisco County had the highest share of workers commuting by public transportation in California, 18.7 of 100 workers
description: Share of workers age 16 and over who commuted by public transportation, by California county, 2020 to 2024.
date: 2026-10-29
layout: layouts/post.njk
---

Public transportation here means bus, subway, light rail, commuter rail, streetcar and ferry. Taxicabs are not counted. Across California, 2.9 of every 100 workers commuted by public transportation. In 39 of the 58 counties, fewer than 1 of every 100 workers did.

<figure class="viz" id="ca-transit-viz">
  <div id="ca-transit-chart" role="img" aria-label="Horizontal bar chart of the percent of workers who commuted by public transportation in each of the 58 California counties, sorted from highest to lowest"></div>
  <figcaption>Each bar is one county. The value is the percent of workers age 16 and over who usually commuted by public transportation. Hover or tap a bar for the worker count.</figcaption>
</figure>

<p class="viz-note">Bars show the survey estimate only. Margins of error are in the <a href="/visualizations/data/ca_transit_share_2020_2024.csv">data file (CSV)</a>. The estimates pool survey responses collected from 2020 to 2024.</p>

## References

<div class="references">

U.S. Census Bureau. (2025). *Means of transportation to work* (American Community Survey 5-year estimates, 2020 to 2024, Table B08301) [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b08301.dat

U.S. Census Bureau. (2025). *American Community Survey 5-year estimates summary file geography, 2020 to 2024* [Data set]. https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/documentation/Geos20245YR.txt

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1.5rem 0; max-width: 44rem; }
#ca-transit-chart { width: 100%; position: relative; }
#ca-transit-chart svg { display: block; width: 100%; height: auto; font-family: inherit; }
#ca-transit-chart .bar { fill: #082840; }
#ca-transit-chart .bar:hover, #ca-transit-chart .bar.active { fill: #3a6d96; }
#ca-transit-chart text { font-size: 12px; fill: #333; }
#ca-transit-chart .axis-title { font-size: 12px; font-weight: 600; }
.viz-tip { position: absolute; pointer-events: none; background: #fff; border: 1px solid #c0c0c0; padding: .4rem .55rem; font-size: 13px; line-height: 1.35; box-shadow: 0 2px 6px rgba(0,0,0,.12); display: none; max-width: 15rem; }
.viz figcaption, .viz-note { font-size: .9rem; color: #555; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; }
</style>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script>
(function () {
  var el = document.getElementById("ca-transit-chart");
  var tip = document.createElement("div");
  tip.className = "viz-tip";
  el.appendChild(tip);
  var fmt = d3.format(",");
  d3.json("/visualizations/data/ca_transit_share_2020_2024.json").then(function (data) {
    data.sort(function (a, b) { return b.share_pct - a.share_pct; });
    function draw() {
      d3.select(el).select("svg").remove();
      var W = Math.max(300, el.clientWidth);
      var small = W < 480;
      var rowH = small ? 15 : 16;
      var m = { top: 34, right: 44, bottom: 8, left: small ? 104 : 124 };
      var H = m.top + m.bottom + rowH * data.length;
      var x = d3.scaleLinear().domain([0, d3.max(data, function (d) { return d.share_pct; })]).range([0, W - m.left - m.right]);
      var y = d3.scaleBand().domain(data.map(function (d) { return d.county; })).range([m.top, H - m.bottom]).padding(0.18);
      var svg = d3.select(el).insert("svg", ":first-child").attr("viewBox", "0 0 " + W + " " + H).attr("width", W).attr("height", H);
      svg.append("text").attr("class", "axis-title").attr("x", small ? 0 : m.left).attr("y", 14).style("font-size", small ? "11px" : "12px").text("Workers commuting by public transportation (percent)");
      svg.append("text").attr("class", "axis-title").attr("x", 0).attr("y", 28).text("County");
      var g = svg.append("g").selectAll("g").data(data).join("g");
      g.append("text").attr("x", m.left - 6).attr("y", function (d) { return y(d.county) + y.bandwidth() / 2; }).attr("dy", "0.35em").attr("text-anchor", "end")
        .style("font-size", small ? "11px" : "12px").text(function (d) { return d.county.replace(/ County$/, ""); });
      g.append("rect").attr("class", "bar").attr("x", m.left).attr("y", function (d) { return y(d.county); })
        .attr("width", function (d) { return Math.max(0.5, x(d.share_pct)); }).attr("height", y.bandwidth())
        .append("title").text(function (d) { return d.county + ": " + d.share_pct.toFixed(1) + "% of " + fmt(d.workers) + " workers commuted by public transportation"; });
      g.append("text").attr("x", function (d) { return m.left + x(d.share_pct) + 4; }).attr("y", function (d) { return y(d.county) + y.bandwidth() / 2; }).attr("dy", "0.35em")
        .style("font-size", small ? "11px" : "12px").text(function (d) { return d.share_pct.toFixed(1) + "%"; });
      g.on("mousemove", function (ev, d) {
        var p = d3.pointer(ev, el);
        tip.innerHTML = "<strong>" + d.county + "</strong><br>" + d.share_pct.toFixed(1) + "% commuted by public transportation<br>" + fmt(d.transit) + " of " + fmt(d.workers) + " workers";
        tip.style.display = "block";
        var left = Math.min(p[0] + 12, el.clientWidth - tip.offsetWidth - 4);
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = (p[1] + 14) + "px";
      }).on("mouseleave", function () { tip.style.display = "none"; });
    }
    draw();
    var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 150); });
  });
})();
</script>
