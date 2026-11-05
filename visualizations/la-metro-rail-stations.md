---
title: LA Metro Rail Ridership by Line and Station, 2026
description: LA Metro rail stations by opening year on a tilted map, with average weekday boardings on each line in fiscal years 2009 to 2026.
date: 2026-10-29
layout: layouts/post.njk
---

<figure class="viz lam-wide" id="lam-viz">
  <div class="ca-card">
    <div class="ca-tabs-wrap"><span class="ca-tabs-label" id="lam-tabs-label" hidden>Map shows</span>
      <div class="lam-tabrow">
      <div class="ca-tabs" id="lam-metric" role="tablist" aria-labelledby="lam-tabs-label" hidden>
        <button type="button" role="tab" data-v="b" aria-selected="true" tabindex="0">Ridership</button>
        <button type="button" role="tab" data-v="age" aria-selected="false" tabindex="-1">Station age</button>
      </div>
      <div class="lam-busy-wrap"><label class="viz-toggle"><input type="checkbox" id="lam-busy" checked> Busiest 10 stations</label></div>
      </div>
    </div>
    <div class="lam-year" hidden>
      <label for="lam-slider" class="lam-ylab">Year <b id="lam-yv">2026</b></label>
      <input type="range" id="lam-slider" min="1990" max="2026" step="1" value="2026">
    </div>
  </div>
  <div class="lam-body">
    <div class="lam-mapcol">
      <p class="bay-legend" id="lam-legend"></p>
      <div id="lam-map" role="img" aria-label="Tilted map of the LA Metro rail network in 2026, with line width showing average weekday boardings."></div>
    </div>
  </div>
</figure>

<section class="lmc-sec lmc-near" aria-labelledby="lmc-h2">
  <h2 id="lmc-h2" class="lmc-h">Station boardings in fiscal year 2026, by year opened</h2>
  <div class="lmc-chart" id="lmc-scatter" role="img" aria-label="Scatter plot of LA Metro rail stations: year opened against average weekday boardings in fiscal year 2026."></div>
  <p class="lmc-p" id="lmc-scatter-note"></p>
</section>

<section class="lmc-sec" aria-labelledby="lmc-h1">
  <h2 id="lmc-h1" class="lmc-h">Average weekday boardings by line, fiscal years 2009 to 2026</h2>
  <div class="lmc-chart" id="lmc-lines" role="img" aria-label="Line chart of average weekday boardings on each LA Metro rail line from fiscal year 2009 to 2026."></div>
  <p class="lmc-p">The dashed vertical line marks June 2023, when the Regional Connector tunnel downtown changed the routes of the A and E Lines. Their figures before that line are for the earlier routes. LA Metro reports the B and D Lines as one figure, drawn in red and purple dashes.</p>
</section>

<div class="lmc-tip" id="lmc-tip" hidden></div>

<div class="ca-tables lam-newest">
  <table id="lam-t1" hidden><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
  <table id="lam-t2"><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
</div>

**Methods.** Station places, names and lines come from the LA Metro rail GTFS feed. GTFS is the standard timetable format that transit agencies publish. Opening dates come from the Wikipedia list of LA Metro Rail stations, which cites LA Metro. Line widths and the line chart use average weekday boardings by line, fiscal years 2009 to 2026. They come from LA Metro's Interactive Estimated Ridership Stats, retrieved 29 October 2026. LA Metro reports the B and D Lines together as the B Line, so they share one width. The A and E Lines took their current routes in June 2023, when the Regional Connector opened. Their line data starts in fiscal year 2024, and earlier years draw them thin. The former L Line is not drawn. Fiscal year 2009 covers 127 weekdays. Width grows with the square root of boardings. Station boardings, in the busiest-10 bars and the scatter chart, are average weekday boardings by station for LA Metro fiscal years 2024, 2025 and 2026. A fiscal year runs from July to June and is named for the year it ends. LA Metro released these figures through public records requests, and they were copied from three dated versions of a Wikipedia table that cites those releases. Boardings by station are not available before fiscal year 2024, so the 2020 drop does not show here. Stations that opened during a fiscal year have an average over the days they were open. Lines are drawn with their 2026 names and colors in every year. Expo / Crenshaw has two platforms in the feed and is drawn as one station. In fiscal year 2024, Lynwood was named Long Beach Boulevard. The North Hollywood figure for fiscal years 2025 and 2026 includes G Line bus boardings. The map uses the 2024 county boundary file. A pin marks each station that opened in 2025 or 2026. Contour lines are drawn every 100 m of elevation, with every 500 m line darker. They were built from AWS Terrain Tiles at zoom 10, about 130 m per cell, smoothed and simplified.

## References

<div class="references">

Los Angeles County Metropolitan Transportation Authority. (2026). *gtfs_rail: LA Metro rail GTFS feed* [Data set]. GitLab. https://gitlab.com/LACMTA/gtfs_rail

Los Angeles County Metropolitan Transportation Authority. (2026). *Interactive estimated ridership stats: Rail, fiscal years 2009 to 2026* [Data set]. Retrieved October 29, 2026, from https://opa.metro.net/MetroRidership/IndexRail.aspx

Wikipedia contributors. (2026, October). *List of Los Angeles Metro Rail stations*. In *Wikipedia*. https://en.wikipedia.org/wiki/List_of_Los_Angeles_Metro_Rail_stations

Wikipedia contributors. (2024, December 9). *Template:LAMetro Ridership* (Revision 1262036138, fiscal year 2024). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1262036138

Wikipedia contributors. (2025, September 20). *Template:LAMetro Ridership* (Revision 1312349673, fiscal year 2025). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1312349673

Wikipedia contributors. (2026, August 27). *Template:LAMetro Ridership* (Revision 1371527400, fiscal year 2026). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1371527400

misken67. (2024, 2025, 2026). *Metro ridership by station, fiscal years 2024, 2025 and 2026* [Online posts of LA Metro public records]. Reddit. https://www.reddit.com/r/LAMetro/comments/1vz95u9/fy2026_metro_ridership_by_station/

Mapzen, & Amazon Web Services. (2026). *Terrain Tiles* [Data set]. Registry of Open Data on AWS. Retrieved October 29, 2026, from https://registry.opendata.aws/terrain-tiles/

U.S. Geological Survey. (2026). *3D Elevation Program (3DEP)* [Data set]. Retrieved October 29, 2026, from https://www.usgs.gov/3d-elevation-program

U.S. Census Bureau. (2024). *Cartographic boundary files, counties* [Data set], via Bostock, M. *us-atlas* (Version 3). https://github.com/topojson/us-atlas

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1rem auto 1.5rem; max-width: 44rem; }
@media (min-width: 1000px) { .lam-wide { max-width: min(64rem, 100%); } }
.lam-body { display: flex; flex-direction: column; gap: .6rem; }
.lam-mapcol { min-width: 0; width: 100%; }
@media (min-width: 1000px) { .lam-body { flex-direction: row; align-items: flex-start; } .lam-mapcol { flex: 1 1 auto; } .lam-panel { flex: 0 0 15.5rem; position: sticky; top: 1rem; } }
#lam-map { width: 100%; }
.lam-panel { box-sizing: border-box; background: #fffaf3; border-left: 3px solid #c2410c; padding: .55rem .75rem; font-size: .88rem; color: #2a1a10; min-height: 4em; }
.lam-panel h3 { font-size: 1rem; margin: 0 0 .25rem; }
.lam-panel p { margin: .15rem 0; }
.lam-hint { color: #6b5440; }
.lam-sub { margin-top: .5rem !important; font-weight: 600; }
.lam-src { margin-top: .4rem; font-size: .78rem; }
.lam-chip { display: inline-block; min-width: 1.25rem; text-align: center; font-weight: 700; font-size: .75rem; border-radius: 50%; color: #fff; margin-right: .2rem; line-height: 1.25rem; }
.lam-panel svg { display: block; width: 100%; max-width: 260px; height: auto; margin-top: .3rem; }
.lam-panel .ax { font-size: 10px; fill: #6b5440; }
.ca-card { box-sizing: border-box; max-width: 100%; background: #fdf6ea; border: 1px solid #ead9bd; border-radius: 12px; padding: .7rem 1rem; margin-bottom: .6rem; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .6rem 2rem; }
.ca-tabs-wrap { display: flex; flex-direction: column; gap: .3rem; flex: 0 1 auto; min-width: 0; max-width: 100%; }
.ca-tabs-label { font-size: .8rem; font-weight: 600; color: #6b5440; }
.ca-tabs { display: flex; gap: .4rem; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 2px; }
.ca-tabs::-webkit-scrollbar { display: none; }
.ca-tabs button { flex: none; font: inherit; font-size: .92rem; min-height: 40px; padding: .35rem .95rem; border: 1px solid #d4b483; border-radius: 999px; background: #fffaf3; color: #2a1a10; cursor: pointer; white-space: nowrap; }
.ca-tabs button:hover { background: #f8e6cc; }
.ca-tabs button[aria-selected="true"] { background: #c2410c; border-color: #c2410c; color: #fff; font-weight: 600; }
.ca-tabs button:focus-visible { outline: 2px solid #8a2d08; outline-offset: 2px; }
.lam-year[hidden], .ca-tabs[hidden] { display: none !important; }
.lam-year { display: flex; align-items: center; gap: .7rem; flex: 1 1 14rem; min-width: 0; padding-bottom: 2px; }
.lam-ylab { font-size: .8rem; font-weight: 600; color: #6b5440; white-space: nowrap; }
.lam-ylab b { font-size: 1.1rem; color: #2a1a10; font-variant-numeric: tabular-nums; }
#lam-slider { flex: 1 1 auto; accent-color: #c2410c; min-height: 40px; min-width: 0; }
.ca-note { font-size: .85rem; color: #6b5440; margin: 0 0 .3rem; }
.bay-legend { font-size: .8rem; color: #6b5440; margin: .3rem 0 0; }
.bay-legend .sw { display: inline-block; width: .7rem; height: .7rem; border-radius: 50%; margin: 0 .2rem 0 .5rem; vertical-align: -1px; }
@media (max-width: 640px) { .ca-card { flex-direction: column; align-items: stretch; padding: .7rem .8rem; } .lam-year { flex: none; } }
#lam-map svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
#lam-map .land { fill: #f1e3c8; stroke: none; }
#lam-map .lac { fill: none; stroke: #c9ad85; stroke-width: 0.9; stroke-dasharray: 3 3; pointer-events: none; }
#lam-map .slab { fill: #d4b483; }
#lam-map .shadow { fill: #5a3a1a; opacity: 0.18; }
#lam-viz > .ca-card { background: none; border: none; box-shadow: none; padding: 0; margin-bottom: .3rem; }
/* Note sits in the empty bay at the map's lower left on wide screens; above the map on phones. */
@media (min-width: 1180px) {
  .lam-mapcol { position: relative; }
  .lam-mapcol #lam-legend { position: absolute; left: 0; bottom: 6%; width: 24%; max-width: 13rem; margin: 0; font-size: .78rem; line-height: 1.35; z-index: 2;
    text-shadow: 0 0 2px #fff, 0 0 2px #fff, 0 0 3px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; }
}
.lmc-sec { margin: 2rem 0 1.4rem; }
/* Map and scatter fit on one laptop screen together (Puck 2026-11-03): cap the map's width so its height
   stays near 360 px, and keep the scatter short and close under it. */
@media (min-width: 900px) { #lam-map { max-width: 860px; margin: 0 auto; } }
.lmc-sec.lmc-near { margin: .9rem 0 1.4rem; }
.lmc-sec.lmc-near .lmc-h { font-size: 1rem; margin-bottom: .3rem; }
.lmc-sec.lmc-near .lmc-p { font-size: .8rem; margin-top: .2rem; }
.lmc-h { font-size: 1.15rem; line-height: 1.35; margin: 0 0 .6rem; }
.lmc-p { font-size: .88rem; color: #6b5440; margin: .4rem 0 0; }
.lmc-chart svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
.lmc-ax text { font-size: 11px; fill: #6b5440; }
.lmc-end { font-size: 11.5px; font-weight: 700; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
.lmc-lbl { font-size: 11px; fill: #2a1a10; paint-order: stroke; stroke: #fff; stroke-width: 3px; pointer-events: none; }
.lmc-tip { position: absolute; z-index: 10; pointer-events: none; background: #fffaf3; border: 1px solid #d4b483; border-radius: 8px; padding: .4rem .6rem; font-size: .82rem; color: #2a1a10; box-shadow: 0 2px 8px rgba(90,58,26,.18); max-width: 17rem; }
.lmc-tip b { display: block; margin-bottom: .1rem; }
#lam-map .topo { fill: none; stroke: #c9a77a; stroke-width: 0.5; opacity: 0.3; pointer-events: none; }
#lam-map .topo.major { stroke: #a9824f; stroke-width: 0.7; opacity: 0.4; }
#lam-map .topo-lbl { font-size: 9px; fill: #b89a74; pointer-events: none; paint-order: stroke; stroke: #f1e3c8; stroke-width: 3px; }
#lam-map .rail { fill: none; stroke-linejoin: round; stroke-linecap: round; pointer-events: none; }
#lam-map .dot { fill: #fffaf3; stroke: #2a1a10; stroke-width: 0.8; pointer-events: none; }
#lam-map .dot.on { stroke-width: 1.6; }
#lam-map .lam-arrow { stroke: #2a1a10; stroke-width: 4; stroke-linecap: round; pointer-events: none; }
#lam-map .lam-arrowhead { fill: #2a1a10; pointer-events: none; }
#lam-map .pin { stroke: #2a1a10; stroke-width: 0.9; pointer-events: none; }
#lam-map .pinhead { fill: #2a1a10; pointer-events: none; }
#lam-map .lbl { pointer-events: none; font-size: 11px; fill: #2a1a10; paint-order: stroke; stroke: #fffaf3; stroke-width: 3.5px; stroke-linejoin: round; }
#lam-map .lbl.main { font-weight: 700; font-size: 12px; }
#lam-map .lbl.yr { font-size: 9.5px; font-weight: 700; fill: #8a2d08; }
#lam-map .lbl.ln { font-size: 10.5px; font-weight: 700; }
#lam-map .place { font-size: 10px; fill: #9a7b5a; font-style: italic; pointer-events: none; text-anchor: middle; }
#lam-map .lead { stroke: #6b5440; stroke-width: 0.7; pointer-events: none; }
.ca-tables { display: flex; justify-content: center; align-items: flex-start; gap: 1.5rem 2.5rem; max-width: 62rem; margin: 0 auto 2rem; }
.ca-tables table { flex: 0 1 28rem; min-width: 0; border-collapse: collapse; font-size: .9rem; margin: 0 !important; }
.ca-tables caption { text-align: left; font-weight: 700; padding-bottom: .4rem; }
.ca-tables th, .ca-tables td { padding: .3rem .25rem; border-bottom: 1px solid #ead9bd; text-align: left; }
.ca-tables th { font-weight: 600; color: #6b5440; border-bottom: 2px solid #d4b483; font-size: .8rem; }
.ca-tables td:nth-child(n+2), .ca-tables th:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ca-tables td:nth-child(n+2) { font-size: .8rem; }
.ca-tables td:first-child { font-size: .85rem; }
@media (max-width: 700px) { .ca-tables { flex-direction: column; align-items: stretch; } .ca-tables table { flex: none; width: 100%; } }
.ca-tables table[hidden] { display: none; }
.lam-tabrow { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem 1rem; min-width: 0; max-width: 100%; }
.lam-tabrow .ca-tabs { min-width: 0; max-width: 100%; }
.lam-busy-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 0 .6rem; }
.viz-toggle { display: flex; align-items: center; gap: .55rem; min-height: 40px; font-size: .9rem; cursor: pointer; color: #2a1a10; }
.viz-toggle input { accent-color: #c2410c; width: 1.15rem; height: 1.15rem; margin: 0; flex: none; }
.viz-toggle.off { color: #a8957f; cursor: not-allowed; }
.viz-toggle.off input { cursor: not-allowed; }
#lam-map .bar { pointer-events: none; }
#lam-map .lbl.busy { font-size: 10.5px; font-weight: 600; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/topojson-client.min.js"></script>
<script src="/visualizations/data/la_metro_viz.js?v=20261103q"></script>
<script src="/visualizations/data/la_metro_charts.js?v=20261104bd"></script>
