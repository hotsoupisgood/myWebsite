---
title: Rail stations opened in the 1990s carried 56 of every 100 LA Metro rail boardings in fiscal year 2026
description: Every LA Metro rail station on a tilted map, by opening year, age and average weekday boardings in fiscal years 2024 to 2026.
date: 2026-10-29
layout: layouts/post.njk
---

LA Metro rail has 110 stations on six lines. The 47 stations opened from 1990 to 1999 had 127,389 of the 226,114 average weekday boardings counted by station in fiscal year 2026. The 18 stations opened since 2020 had 24,302.

<figure class="viz lam-wide" id="lam-viz">
  <div class="ca-card">
    <label class="ca-select" for="lam-metric"><span>Statistic</span>
      <select id="lam-metric">
        <option value="b" selected>Average weekday boardings</option>
        <option value="age">Station age (years open)</option>
        <option value="chg">Change since fiscal year 2024, boardings</option>
      </select>
    </label>
    <div class="ca-checks">
      <label class="viz-toggle"><input type="checkbox" id="lam-colors" checked> Show line colors</label>
    </div>
    <div class="lam-year">
      <button type="button" id="lam-play" aria-label="Play the years from 1990">Play</button>
      <label for="lam-slider" class="lam-ylab">Year <b id="lam-yv">2026</b></label>
      <input type="range" id="lam-slider" min="1990" max="2026" step="1" value="2026">
    </div>
  </div>
  <p class="ca-note" id="lam-note"></p>
  <p class="bay-legend" id="lam-legend"></p>
  <div class="lam-body">
    <div id="lam-map" role="img" aria-label="Tilted map of the LA Metro rail network. Each station that is open in the selected year has a bar for the selected statistic. Hover or tap a station for its numbers."></div>
    <div class="lam-panel" id="lam-panel" aria-live="polite"><p class="lam-hint">Hover or tap a station for its numbers.</p></div>
  </div>
</figure>

<div class="ca-tables">
  <table id="lam-t1"><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
  <table id="lam-t2"><caption></caption><thead><tr></tr></thead><tbody></tbody></table>
</div>

**Methods.** Station places, names and lines come from the LA Metro rail GTFS feed. GTFS is the standard timetable format that transit agencies publish. Opening dates come from the Wikipedia list of LA Metro Rail stations, which cites LA Metro. Boardings are average weekday boardings by station for LA Metro fiscal years 2024, 2025 and 2026. A fiscal year runs from July to June and is named for the year it ends. LA Metro released these figures through public records requests, and they were copied from three dated versions of a Wikipedia table that cites those releases. Boardings by station are not available before fiscal year 2024, so the 2020 drop does not show here. Stations that opened during a fiscal year have an average over the days they were open. Lines are drawn with their 2026 names and colors in every year. Expo / Crenshaw has two platforms in the feed and is drawn as one station. In fiscal year 2024, Lynwood was named Long Beach Boulevard. The North Hollywood figure for fiscal years 2025 and 2026 includes G Line bus boardings. The map uses the 2024 county boundary file.

## References

<div class="references">

Los Angeles County Metropolitan Transportation Authority. (2026). *gtfs_rail: LA Metro rail GTFS feed* [Data set]. GitLab. https://gitlab.com/LACMTA/gtfs_rail

Los Angeles County Metropolitan Transportation Authority. (2026). *Metro ridership* [Data set]. https://opa.metro.net/MetroRidership/

Wikipedia contributors. (2026, October). *List of Los Angeles Metro Rail stations*. In *Wikipedia*. https://en.wikipedia.org/wiki/List_of_Los_Angeles_Metro_Rail_stations

Wikipedia contributors. (2024, December 9). *Template:LAMetro Ridership* (Revision 1262036138, fiscal year 2024). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1262036138

Wikipedia contributors. (2025, September 20). *Template:LAMetro Ridership* (Revision 1312349673, fiscal year 2025). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1312349673

Wikipedia contributors. (2026, August 27). *Template:LAMetro Ridership* (Revision 1371527400, fiscal year 2026). In *Wikipedia*. https://en.wikipedia.org/w/index.php?oldid=1371527400

misken67. (2024, 2025, 2026). *Metro ridership by station, fiscal years 2024, 2025 and 2026* [Online posts of LA Metro public records]. Reddit. https://www.reddit.com/r/LAMetro/comments/1vz95u9/fy2026_metro_ridership_by_station/

U.S. Census Bureau. (2024). *Cartographic boundary files, counties* [Data set], via Bostock, M. *us-atlas* (Version 3). https://github.com/topojson/us-atlas

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.viz { margin: 1rem auto 1.5rem; max-width: 44rem; }
@media (min-width: 1000px) { .lam-wide { width: min(64rem, calc(100vw - 3rem)); max-width: none; position: relative; left: 50%; transform: translateX(-50%); } }
.lam-body { display: flex; flex-direction: column; gap: .6rem; }
@media (min-width: 1000px) { .lam-body { flex-direction: row; align-items: flex-start; } #lam-map { flex: 1 1 auto; min-width: 0; } .lam-panel { flex: 0 0 15.5rem; position: sticky; top: 1rem; } }
#lam-map { width: 100%; }
.lam-panel { background: #fffaf3; border-left: 3px solid #c2410c; padding: .55rem .75rem; font-size: .88rem; color: #2a1a10; min-height: 4em; }
.lam-panel h3 { font-size: 1rem; margin: 0 0 .25rem; }
.lam-panel p { margin: .15rem 0; }
.lam-hint { color: #6b5440; }
.lam-chip { display: inline-block; min-width: 1.25rem; text-align: center; font-weight: 700; font-size: .75rem; border-radius: 50%; color: #fff; margin-right: .2rem; line-height: 1.25rem; }
.lam-panel svg { display: block; width: 100%; max-width: 260px; height: auto; margin-top: .3rem; }
.lam-panel .ax { font-size: 10px; fill: #6b5440; }
.ca-card { background: #fdf6ea; border: 1px solid #ead9bd; border-radius: 12px; padding: .9rem 1.1rem; margin-bottom: .6rem; display: flex; flex-wrap: wrap; align-items: flex-end; gap: .5rem 1.5rem; }
.ca-select { display: flex; flex-direction: column; gap: .25rem; flex: 1 1 16rem; min-width: 0; font-size: .8rem; font-weight: 600; color: #6b5440; }
.ca-select select { font: inherit; font-size: .95rem; font-weight: 400; color: #2a1a10; min-height: 44px; width: 100%; padding: .4rem 2rem .4rem .7rem; border: 1px solid #d4b483; border-radius: 8px; background: #fffaf3 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23b8400e' stroke-width='2'/%3E%3C/svg%3E") no-repeat right .75rem center; appearance: none; -webkit-appearance: none; cursor: pointer; text-overflow: ellipsis; }
.ca-select select:focus-visible, #lam-play:focus-visible { outline: 2px solid #c2410c; outline-offset: 1px; }
.ca-checks { display: flex; flex-direction: column; flex: 0 1 auto; }
.viz-toggle { display: flex; align-items: center; gap: .55rem; min-height: 40px; font-size: .9rem; cursor: pointer; color: #2a1a10; }
.viz-toggle input { accent-color: #c2410c; width: 1.15rem; height: 1.15rem; margin: 0; flex: none; }
.lam-year { display: flex; align-items: center; gap: .7rem; flex: 1 1 100%; }
#lam-play { font: inherit; font-size: .9rem; font-weight: 600; min-height: 40px; min-width: 4.5rem; border: 1px solid #c2410c; background: #c2410c; color: #fff; border-radius: 8px; cursor: pointer; }
.lam-ylab { font-size: .8rem; font-weight: 600; color: #6b5440; white-space: nowrap; }
.lam-ylab b { font-size: 1.1rem; color: #2a1a10; font-variant-numeric: tabular-nums; }
#lam-slider { flex: 1 1 auto; accent-color: #c2410c; min-height: 40px; min-width: 0; }
.ca-note { font-size: .85rem; color: #6b5440; margin: 0 0 .3rem; }
.bay-legend { font-size: .8rem; color: #6b5440; margin: 0 0 .3rem; display: flex; flex-wrap: wrap; gap: .2rem 1rem; }
.bay-legend .sw { display: inline-block; width: .7rem; height: .7rem; border-radius: 2px; margin-right: .3rem; vertical-align: -1px; }
@media (max-width: 480px) { .ca-card { flex-direction: column; align-items: stretch; padding: .8rem .9rem; } .ca-select { flex: none; } }
#lam-map svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
#lam-map .land { fill: #f1e3c8; stroke: none; }
#lam-map .lac { fill: none; stroke: #c9ad85; stroke-width: 0.9; stroke-dasharray: 3 3; pointer-events: none; }
#lam-map .slab { fill: #d4b483; }
#lam-map .shadow { fill: #5a3a1a; opacity: 0.18; }
#lam-map .rail { fill: none; stroke-linejoin: round; stroke-linecap: round; pointer-events: none; }
#lam-map .dot { fill: #fffaf3; stroke: #6b5440; stroke-width: 0.9; pointer-events: none; }
#lam-map .dot.on { fill: #c2410c; stroke: #2a1a10; }
#lam-map .pin { stroke: #2a1a10; stroke-width: 0.9; pointer-events: none; }
#lam-map .pinhead { fill: #2a1a10; pointer-events: none; }
#lam-map .lbl { pointer-events: none; font-size: 11px; fill: #2a1a10; paint-order: stroke; stroke: #fffaf3; stroke-width: 3.5px; stroke-linejoin: round; }
#lam-map .lbl.main { font-weight: 700; font-size: 12px; }
#lam-map .lbl.yr { font-size: 9.5px; font-weight: 700; fill: #8a2d08; }
#lam-map .place { font-size: 10px; fill: #9a7b5a; font-style: italic; pointer-events: none; text-anchor: middle; }
#lam-map .lead { stroke: #6b5440; stroke-width: 0.7; pointer-events: none; }
.ca-tables { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 1rem; max-width: 46rem; margin: 0 auto 2rem; }
.ca-tables table { flex: 1 1 19rem; border-collapse: collapse; font-size: .9rem; margin: 0 !important; }
.ca-tables caption { text-align: left; font-weight: 700; padding-bottom: .4rem; }
.ca-tables th, .ca-tables td { padding: .3rem .25rem; border-bottom: 1px solid #ead9bd; text-align: left; }
.ca-tables th { font-weight: 600; color: #6b5440; border-bottom: 2px solid #d4b483; font-size: .8rem; }
.ca-tables td:nth-child(n+2), .ca-tables th:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.ca-tables td:nth-child(n+2) { font-size: .8rem; }
.ca-tables td:first-child { font-size: .85rem; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/topojson-client.min.js"></script>
<script src="/visualizations/data/la_metro_viz.js"></script>
