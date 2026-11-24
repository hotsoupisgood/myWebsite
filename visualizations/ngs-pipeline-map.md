---
title: NGS Pipeline Map
description: Options at each stage of a sequencing analysis, from the question to the checks, with 9 example routes.
date: 2026-11-24
layout: layouts/post.njk
---

<section class="tw-sec" aria-labelledby="ngs-h">
  <h2 id="ngs-h" class="tw-h">Nine routes through 31 sequencing-analysis options</h2>
  <p class="tw-p">Each column is one stage of an analysis. Each box is one option at that stage. A route is one full analysis, read left to right. Faint lines join every pair of boxes that some route uses.</p>
  <div class="ca-card" style="margin-top:.7rem">
    <div class="ca-tabs-wrap"><span class="ca-tabs-label" id="ngs-routes-label">Show routes (any number at once)</span>
      <div class="ca-tabs ngs-tabs" id="ngs-routes" role="group" aria-labelledby="ngs-routes-label"></div>
    </div>
  </div>
  <div class="tw-chart ngs-map" id="ngs-map"></div>
  <p class="tw-legend">Lines and dots take the colour of each route that is on. On a narrow screen, the map scrolls sideways.</p>
  <div class="ngs-detail" id="ngs-detail" aria-live="polite"></div>
</section>

<div class="tw-tip" id="ngs-tip" hidden></div>

<div class="references">

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.tw-sec { margin: 0 0 2.2rem; }
.tw-h { font-size: 1.2rem; line-height: 1.35; margin: 0 0 .7rem; }
.tw-p { font-size: .92rem; margin: .4rem 0 0; }
.tw-chart { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.tw-chart svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
.tw-legend { font-size: .8rem; color: #625a7a; margin: .3rem 0 0; }
.sw { display: inline-block; width: .8rem; height: .8rem; border-radius: 3px; margin-right: .35rem; vertical-align: -1px; flex: none; }
.tw-tip { position: absolute; z-index: 10; pointer-events: none; background: #fcfaff; border: 1px solid #c9bce3; border-radius: 8px; padding: .4rem .6rem; font-size: .82rem; color: #2a2340; box-shadow: 0 2px 8px rgba(60,48,110,.18); max-width: 16rem; }
.tw-tip b { display: block; margin-bottom: .1rem; }
.ca-card { box-sizing: border-box; max-width: 100%; background: #f6f1fb; border: 1px solid #e2d6f0; border-radius: 12px; padding: .7rem 1rem; margin-bottom: .6rem; }
.ca-tabs-wrap { display: flex; flex-direction: column; gap: .3rem; min-width: 0; max-width: 100%; }
.ca-tabs-label { font-size: .8rem; font-weight: 600; color: #625a7a; }
.ca-tabs { display: flex; gap: .4rem; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 2px; }
.ca-tabs::-webkit-scrollbar { display: none; }
.ngs-tabs { flex-wrap: wrap; }
.ca-tabs button { flex: none; font: inherit; font-size: .92rem; min-height: 40px; padding: .35rem .95rem; border: 1px solid #c9bce3; border-radius: 999px; background: #fcfaff; color: #2a2340; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; }
.ca-tabs button:hover { background: #ece4f8; }
.ca-tabs button[aria-pressed="true"] { background: #7461c4; border-color: #7461c4; color: #fff; font-weight: 600; }
.ca-tabs button[aria-pressed="true"] .sw { box-shadow: 0 0 0 1.5px #fff; }
.ca-tabs button:focus-visible { outline: 2px solid #4b3a99; outline-offset: 2px; }
@media (max-width: 640px) { .ca-card { padding: .7rem .8rem; } .ca-tabs button { font-size: .85rem; } }
.ngs-map .ngs-colh { font-size: 12px; font-weight: 600; fill: #625a7a; }
.ngs-node { cursor: pointer; outline: none; }
.ngs-box { fill: #fcfaff; stroke-width: 1; }
.ngs-node.on .ngs-box { fill: #fff; stroke-width: 2; }
.ngs-node.sel .ngs-box { fill: #ece4f8; stroke-width: 2.5; }
.ngs-node:hover .ngs-box { fill: #ece4f8; }
.ngs-node:focus-visible .ngs-box { stroke: #4b3a99; stroke-width: 3; }
.ngs-lbl { font-size: 12px; font-weight: 600; fill: #2a2340; pointer-events: none; }
.ngs-tool { font-size: 10.5px; fill: #625a7a; pointer-events: none; }
.ngs-detail { box-sizing: border-box; background: #f6f1fb; border: 1px solid #e2d6f0; border-radius: 12px; padding: .7rem 1rem; margin-top: .8rem; min-height: 6rem; }
.ngs-dh { font-size: 1.05rem; margin: 0; }
.ngs-dtool { font-size: .85rem; color: #625a7a; margin: .1rem 0 0; }
.ngs-detail .ca-tabs-label { display: block; margin: .7rem 0 .3rem; }
.ngs-notes { list-style: none; margin: 0; padding: 0; font-size: .9rem; }
.ngs-notes li { margin: .25rem 0; }
.ngs-hint { font-size: .92rem; color: #625a7a; margin: 0; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/ngs_pipeline_map_viz.js?v=20261124c"></script>
