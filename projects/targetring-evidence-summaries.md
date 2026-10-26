---
layout: layouts/post.njk
title: Gathering Drug Target Evidence With a Model That Only Paraphrases
templateClass: tmpl-post
date: 2026-10-26
tags:
  - bioinformatics
  - llm
  - tools
---
**TLDR:**

- I set out to make a demo that aggregates the top genetic targets for a disease into one figure, to motivate biologists to take those genes into early in vitro target validation experiments.
- I built a tool that turns a disease name into that figure: for each differentially expressed gene, its druggability, safety, tissue expression, drug pipeline, literature and mouse phenotypes.
- I added a language model that writes one short evidence paragraph per gene from the gathered facts only, stored with the run, and never ranks, filters or decides anything.
- [The tool](https://hotsoupisgood.github.io/TargetRing/) and [the code](https://github.com/hotsoupisgood/TargetRing) are public.

[targetring](https://hotsoupisgood.github.io/TargetRing/) takes a disease, finds a public gene expression study for it, picks a comparison of affected against unaffected people, and draws a ring figure for the genes that differ. Each ring is one source: tractability and safety from Open Targets, tissue expression from GTEx, development level from Pharos, mechanisms from ChEMBL, literature counts from Europe PMC and PubTator, mouse phenotypes from MGI. A missing cell is drawn as missing, never as zero, because the figure used to be built by hand from six browser tabs and the hardest part was knowing whether an empty cell meant "not measured" or "the lookup failed". Clicking a gene opens a drawer with the full drug pipeline, the trials behind it, and a GO or NO-GO line from a fixed three part rule: expressed in a disease tissue, dysregulated in the study, and a phenotype on record.

![The targetring figure for Crohn's disease: twelve genes as spokes, nine evidence rings, with the comparison and the selection rule stated in the centre](/img/fig_targetring_figure.png)

The language model's job is deliberately small, and the prompt is where that is enforced. For each gene the tool assembles the facts it already fetched and sends them once to a model whose only permitted source is that JSON: nothing it knows about the gene, the disease or the drugs may enter the text, and a fact that is not in the JSON does not exist. The prompt fixes the paragraph's length at four to six sentences and its order sentence by sentence: the rule-based verdict restated word for word, then the hypothesis the fold change implies, then the evidence that is present, then every ring with no data named as absent rather than low. It bans recommendations, rankings against other genes, invented citations, hedging phrases, em dashes, percentages, internal codes and identifiers, and gives the plain gloss to use for each code. The other three model calls in the tool are constrained the same way: each chooses only from a closed list the app supplied, the answer is checked against that list on return, and when a call fails the rule-based fallback runs and the figure records who chose. The paragraph is then stored with the run. The same facts always produce the same stored paragraph, so the four demo runs needed 13 calls for 46 genes, and the whole demo's model spend was $1.35, measured 18 October 2026 and shown on the tool's Paid calls tab. A second, smaller call reads the gene's mouse phenotype terms against the disease area and returns a 0 or 1, printed beside the rule-based phenotype check and never replacing it. The drawer below shows that line for MUC1 in the Crohn's run. The stored paragraph for the same gene begins with the verdict and its three reasons, then the fold change, the tissue expression against the median across 54 tissues, the mouse phenotypes, and the empty drug pipeline, each with its number and unit, and no opinion of its own.

![The MUC1 drawer: the GO verdict with its three checks, the model's phenotype read beside the rule-based one, and the drug pipeline table](/img/fig_targetring_drawer.png)
