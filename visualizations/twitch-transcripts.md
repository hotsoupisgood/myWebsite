---
title: Dashboard for Twitch Transcripts
description: Hours of speech, word pairs, topics and people named in HasanAbi Twitch streams, 2026, updated as streams are transcribed.
date: 2026-11-03
layout: layouts/post.njk
---

<div class="tw-tldr">

**TLDR**

- I transcribed HasanAbi's Twitch streams, from the archived video audio, with a speech recognition model.
- I counted how much of each stream had speech and which words came up most.
- I found that three Michigan politicians were named most often in the final streams before the midterms.
- The panels below show hours, topics and words by stream. Methods are at the end.

</div>

<section class="tw-sec" aria-labelledby="tw-h3">
  <h2 id="tw-h3" class="tw-h"></h2>
  <div class="ca-card">
    <div class="ca-tabs-wrap"><span class="ca-tabs-label" id="tw-wview-label">Show</span>
      <div class="ca-tabs" id="tw-wview" style="justify-content:flex-start" role="tablist" aria-labelledby="tw-wview-label"></div>
    </div>
  </div>
  <div class="tw-chart" id="tw-words" role="img" aria-label="Grid of the 12 most frequent words by stream. Darker cells mean the word was spoken more often per 10,000 words."></div>
  <p class="tw-legend" id="tw-wlegend"></p>
  <p class="tw-p" id="tw-p3"></p>
</section>

<section class="tw-sec" aria-labelledby="tw-h2">
  <p class="tw-kicker">Selected word sets</p>
  <h2 id="tw-h2" class="tw-h"></h2>
  <div class="tw-chart" id="tw-topics" role="img" aria-label="Grid of five word sets by stream. Darker cells mean the words in the set were spoken more often per 10,000 words."></div>
  <p class="tw-legend" id="tw-tlegend"></p>
  <p class="tw-p" id="tw-p2"></p>
</section>

<section class="tw-sec" aria-labelledby="tw-h6">
  <p class="tw-kicker">Words near a word</p>
  <h2 id="tw-h6" class="tw-h"></h2>
  <div class="ca-card">
    <label class="ca-tabs-label" for="tw-q">Type a word</label>
    <div class="tw-q"><input id="tw-q" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. housing" list="tw-qlist"><datalist id="tw-qlist"></datalist></div>
    <div class="ca-tabs-wrap" style="margin-top:.6rem"><span class="ca-tabs-label" id="tw-nview-label">Or pick a topic</span>
      <div class="ca-tabs" id="tw-nview" style="justify-content:flex-start" role="tablist" aria-labelledby="tw-nview-label"></div>
    </div>
    <div class="ca-tabs-wrap" style="margin-top:.6rem"><span class="ca-tabs-label" id="tw-len-label">Show nearby</span>
      <div class="ca-tabs" id="tw-len" style="justify-content:flex-start" role="tablist" aria-labelledby="tw-len-label">
        <button type="button" role="tab" data-v="1" aria-selected="true">Single words</button>
        <button type="button" role="tab" data-v="2" aria-selected="false">Word pairs</button>
        <button type="button" role="tab" data-v="3" aria-selected="false">3 words</button>
        <button type="button" role="tab" data-v="4" aria-selected="false">4 words</button>
      </div>
    </div>
    <div class="ca-tabs-wrap" style="margin-top:.6rem"><span class="ca-tabs-label" id="tw-emo-label">Nearby words</span>
      <div class="ca-tabs" id="tw-emo" style="justify-content:flex-start" role="tablist" aria-labelledby="tw-emo-label">
        <button type="button" role="tab" data-v="all" aria-selected="true">All words</button>
        <button type="button" role="tab" data-v="emo" aria-selected="false">Emotional words only</button>
      </div>
    </div>
  </div>
  <p class="tw-legend" id="tw-key" hidden><span class="sw" style="background:#4a7fc1"></span>Positive word <span class="sw" style="background:#d0587a"></span>Negative word</p>
  <div class="tw-tone" id="tw-tone" hidden></div>
  <div class="tw-chart" id="tw-word" role="img" aria-label="Bar chart of the words said most often within fifteen words of the chosen word, across all streams."></div>
  <p class="tw-p" id="tw-p6"></p>
</section>

<section class="tw-sec" aria-labelledby="tw-h1">
  <h2 id="tw-h1" class="tw-h"></h2>
  <div class="tw-tiles" id="tw-tiles"></div>
  <div class="tw-chart" id="tw-hours" role="img" aria-label="Bar chart of stream length and hours of speech for each stream."></div>
  <p class="tw-legend"><span class="sw" style="background:#cfe3f7"></span>Stream length <span class="sw" style="background:#7461c4"></span>Speech</p>
  <p class="tw-p" id="tw-p1"></p>
</section>

<section class="tw-sec" aria-labelledby="tt-h">
  <p class="tw-kicker">Topic analysis</p>
  <h2 id="tt-h" class="tw-h">What the streams talk about, found by a topic model</h2>
  <p class="tw-p">Each stream was cut into 3-minute pieces, called chunks. A topic model called LDA (Latent Dirichlet Allocation) sorted the chunks into 12 topics by the words they share. Unlike ordinary clustering, it gives each chunk a mix of topics rather than a single group. The model was given only the words, after common words and filler were removed. It was given no labels. A large language model (Claude) named each topic afterward from its top words and sample chunks. Only chunks with at least 60 such words count.</p>
  <h3 class="tt-h3">Map of the chunks</h3>
  <p class="tw-p">Each dot is one 3-minute chunk, coloured by its main topic. Chunks with similar topic mixes sit close together. The position has no other meaning. Each topic's name is written at the middle of its dots. The map shows a random 3,000 of the chunks. Hover or tap a dot to see its topic and date.</p>
  <p class="tw-legend tt-legend" id="tt-legend"></p>
  <div class="tw-chart" id="tt-map" role="img" aria-label="Scatter plot of stream chunks coloured by main topic."></div>
  <h3 class="tt-h3">Top words in each topic</h3>
  <p class="tw-p">The 8 words that most define each topic. A longer bar means the word makes up more of the topic.</p>
  <div class="tt-words" id="tt-words"></div>
</section>


<div class="tw-tip" id="tw-tip" hidden></div>

**Methods.** The streams are the HasanAbi Twitch broadcasts transcribed so far, <span id="tw-range">listed in the charts</span>. New streams and older archived streams are added as they are transcribed. On days with many streams, each chart scrolls sideways. Dates are stream start dates in Pacific time. The audio of each archived stream was transcribed in full with WhisperX, using the Whisper large-v3 model. Speech hours are the summed length of the segments where the model wrote text. Words are counted as the model wrote them, split on spaces. The transcripts include every voice on stream: the host, guests, and audio from videos played on stream. Topic and word rates count word tokens, which are runs of letters with an optional apostrophe, per 10,000 tokens in the stream. A possessive counts as its word, so "Israel's" counts as "Israel". The speech recognition spells Abdul El-Sayed several ways, such as "Abdullah Al-Sayed" and "Abdel El-Sayed". All of them count as "Abdul El-Sayed". In the "Selected word sets" chart, each row is a fixed set of words, listed under the chart. The topic analysis is different: its topics come from the LDA model, with the streams cut into 3-minute chunks. The word grid opens on word pairs. A pair is two tokens spoken one after the other in the same segment. Neither token is a common English word, and each has at least three letters. Pairs with the streamer's own name were removed. The single-words view uses the 12 most frequent words over all eight streams after common English words were removed. Spoken filler that the common-word list misses was also removed, for example "thank" and "wait". So were first names whose surname is already counted, and the streamer's own names. Speech recognition makes mistakes, mostly in names and in crosstalk, so counts are approximate. This page shows only counts and rates; no transcript text is published.

## References

<div class="references">

HasanAbi. (2026). *Twitch past broadcasts, 2026* [Video recordings]. Twitch. https://www.twitch.tv/hasanabi

Bain, M., Huh, J., Han, T., & Zisserman, A. (2023). WhisperX: Time-accurate speech transcription of long-form audio. *Proceedings of Interspeech 2023*, 4489 to 4493. https://github.com/m-bain/whisperX

Radford, A., Kim, J. W., Xu, T., Brockman, G., McLeavey, C., & Sutskever, I. (2023). Robust speech recognition via large-scale weak supervision. *Proceedings of the 40th International Conference on Machine Learning*. https://github.com/openai/whisper

Honnibal, M., Montani, I., Van Landeghem, S., & Boyd, A. (2020). *spaCy: Industrial-strength natural language processing in Python* [Computer software]. https://spacy.io/

Bostock, M. (2023). *D3.js* (Version 7) [Computer software]. https://d3js.org/

</div>

<style>
.tw-tldr { background: #f6f1fb; border: 1px solid #e2d6f0; border-radius: 12px; padding: .2rem 1.1rem; margin: 0 0 1.4rem; }
.tw-tldr ul { margin: .3rem 0 .7rem; padding-left: 1.2rem; }
.tw-tldr li { margin: .2rem 0; }
.tw-sec { margin: 0 0 2.2rem; }
.tw-kicker { font-size: .8rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #7461c4; margin: 0 0 .2rem; }
.tw-h { font-size: 1.2rem; line-height: 1.35; margin: 0 0 .7rem; }
.tw-p { font-size: .92rem; margin: .4rem 0 0; }
.tw-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6rem; margin-bottom: .9rem; }
.tw-tile { background: #f6f1fb; border: 1px solid #e2d6f0; border-radius: 12px; padding: .55rem .7rem; }
.tw-tile b { display: block; font-size: 1.55rem; line-height: 1.2; color: #2a2340; font-variant-numeric: tabular-nums; }
.tw-tile span { font-size: .8rem; color: #625a7a; }
@media (max-width: 640px) { .tw-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tw-tile b { font-size: 1.3rem; } }
.tw-chart { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.tw-chart svg { display: block; width: 100%; height: auto; font-family: inherit; touch-action: manipulation; }
.tw-chart .ax text { font-size: 11px; fill: #625a7a; }
@media (max-width: 480px) { .tw-chart .ax text { font-size: 9.5px; } }
.tw-chart .ax line, .tw-chart .ax path { stroke: #d6cce6; }
.tw-chart .grid line { stroke: #eee8f5; }
.tw-chart .axt { font-size: 11px; fill: #625a7a; }
.tw-chart .val { font-size: 11px; fill: #2a2340; font-variant-numeric: tabular-nums; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
.tw-chart .hit { fill: transparent; cursor: pointer; }
.tw-chart .cell-lbl { font-size: 10px; pointer-events: none; font-variant-numeric: tabular-nums; }
.tw-chart .wl { font-size: 12px; fill: #2a2340; }
.tw-legend { font-size: .8rem; color: #625a7a; margin: .3rem 0 0; }
.tw-legend .sw { display: inline-block; width: .8rem; height: .8rem; border-radius: 3px; margin: 0 .25rem 0 .6rem; vertical-align: -1px; }
.tw-legend .sw:first-child { margin-left: 0; }
.tw-tip { position: absolute; z-index: 10; pointer-events: none; background: #fcfaff; border: 1px solid #c9bce3; border-radius: 8px; padding: .4rem .6rem; font-size: .82rem; color: #2a2340; box-shadow: 0 2px 8px rgba(60,48,110,.18); max-width: 16rem; }
.tw-tip b { display: block; margin-bottom: .1rem; }
.ca-card { box-sizing: border-box; max-width: 100%; background: #f6f1fb; border: 1px solid #e2d6f0; border-radius: 12px; padding: .7rem 1rem; margin-bottom: .6rem; }
.ca-tabs-wrap { display: flex; flex-direction: column; gap: .3rem; min-width: 0; max-width: 100%; }
.ca-tabs-label { font-size: .8rem; font-weight: 600; color: #625a7a; }
.ca-tabs { display: flex; gap: .4rem; justify-content: space-between; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding: 2px; }
.ca-tabs::-webkit-scrollbar { display: none; }
.ca-tabs button { flex: none; font: inherit; font-size: .92rem; min-height: 40px; padding: .35rem .95rem; border: 1px solid #c9bce3; border-radius: 999px; background: #fcfaff; color: #2a2340; cursor: pointer; white-space: nowrap; }
.ca-tabs button:hover { background: #ece4f8; }
.ca-tabs button[aria-selected="true"] { background: #7461c4; border-color: #7461c4; color: #fff; font-weight: 600; }
.ca-tabs button:focus-visible { outline: 2px solid #4b3a99; outline-offset: 2px; }
@media (max-width: 640px) { .ca-tabs { justify-content: flex-start; } .ca-card { padding: .7rem .8rem; } }
.tw-q input { box-sizing: border-box; width: 100%; max-width: 22rem; font: inherit; font-size: 1rem; padding: .5rem .8rem; border: 1px solid #c9bce3; border-radius: 999px; background: #fff; color: #2a2340; margin-top: .3rem; }
.ca-tabs button:disabled { opacity: .4; cursor: default; }
.tw-tone { text-align: right; font-size: .78rem; line-height: 1.3; color: #625a7a; margin: .3rem 0 0; }
.tw-tone b { font-size: 1.15rem; color: #2a2340; margin-right: .3rem; }
.tw-legend[hidden] { display: none; }
.tt-legend { display: flex; flex-wrap: wrap; gap: .2rem .3rem; }
.tt-h3 { font-size: 1rem; margin: 1.2rem 0 .3rem; }
.tt-words { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .8rem 1.2rem; margin-top: .5rem; }
.tt-wh { font-size: .85rem; font-weight: 600; margin: 0 0 .2rem; }
.tt-w svg { width: 100%; height: auto; }
.references p { padding-left: 2em; text-indent: -2em; overflow-wrap: anywhere; font-size: .85rem; }
</style>
<script src="/visualizations/data/d3.v7.min.js"></script>
<script src="/visualizations/data/twitch_topics_viz.js?v=20261109f"></script>
<script src="/visualizations/data/twitch_transcripts_viz.js?v=202611120713"></script>
