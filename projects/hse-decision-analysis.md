---
layout: layouts/post.njk
title: Learning Decision Analysis on Top of a Hospital Forecast
templateClass: tmpl-post
date: 2026-10-26
tags:
  - statistics
  - bayesian
  - decision analysis
---
**TLDR:**

- I had a Bayesian forecast of Irish hospital trolley pressure from my thesis, and wanted to understand what decision analysis adds to a forecast.
- I read Smart Choices and Jim Smith's Bayesian Decision Analysis, then built the smallest model that would make the ideas concrete: one region, one week, one yes or no choice.
- Found that the forecast alone never told me what to do. The decision turned on three assumptions I had to write down, and the model showed where each one flipped the answer.
- The executed notebook, design notes and figures are on [GitHub](https://github.com/hotsoupisgood/hse-urgent-care-report-trolley-analysis#decision-science-demonstration).

A forecast tells us what might happen. Decision analysis helps us decide what to do, and makes the assumptions behind that decision visible.

My [trolley post](/projects/hse-trolleys/) ended with a forecast and a wish to put a loss function on it. This is that follow up. Trolley pressure is the number of admitted patients waiting on trolleys, that is gurneys, for a hospital bed. A manager who sees a forecast of it still has to decide whether to act, and I wanted to learn how that step is done properly. So I added a small decision model on top of the forecast I already had. The point was to understand the method, not to advise a hospital. The hospital data are real. The spike, the treatment effect and the cost of acting are made up.

Smart Choices gives a five step framework called PrOACT, and I used it to organise the problem before writing code. Problem: should a hospital activate an extra patient flow intervention before a forecast spike? Objectives: lower the pressure while counting the resources the intervention uses. Alternatives: activate it, or continue usual care. Consequences: the forecast pressure under each, with its uncertainty. Trade-offs: the expected reduction in pressure against the cost of acting. PrOACT gave the structure. Bayesian decision analysis gave the arithmetic: choose the action with the lower expected loss, where the loss is the remaining trolley pressure plus a penalty for acting. The penalty is what the intervention costs in resources, written on the same scale as the pressure rather than in euro.

The region is HSE Dublin and Midlands, the measure is the week's sum of daily trolley counts per 10,000 residents, and the forecast week begins 6 April 2026. The usual care forecast was 3.48 per 10,000. I added a hypothetical spike of 2.0, which lifted it to 5.48 with a likely range of 5.26 to 5.69. The intervention is only considered when the forecast exceeds a pressure cutoff of 4.16, adapted from historical daily limits for the region's nine hospitals. The treatment effect was assumed to average a 15 of 100 reduction in the growth above the current rate, with a spread, and the penalty for acting was 0.025. Every result is averaged over forecast scenarios drawn from the model, each pairing one plausible forecast with one plausible treatment effect.

Expected loss came out at 5.48 under usual care and 5.15 with the intervention, penalty included. The expected reduction was 0.32 per 10,000 net of the penalty, with a likely range from a 0.13 increase to a 0.79 reduction, and the intervention beat usual care in 92 of 100 scenarios. The most useful number was the break-even penalty, where both actions have the same expected loss: 0.35 per 10,000. Below it the model intervenes. That turns "should we act" into "is acting cheaper than this", which is a question someone who knows the hospital can actually answer.

The part that taught me the most was changing one input at a time, 10 scenarios in all, with the intervention chosen in 5. A spike has to exceed 0.68 per 10,000 before the intervention is even eligible, so spikes of 0 and 0.5 kept usual care and 1.0 flipped it. A zero average effect made the benefit zero and usual care won; 5 of 100 was enough for the intervention to win. A penalty of 0.10 still favoured intervening and 0.40 did not. Doubling the spread of the treatment effect left the expected net benefit at 0.32 but cut the winning share from 92 of 100 to 76 of 100: same average answer, less confidence in it.

What stayed with me is that the recommendation was never a property of the forecast. It was a property of the forecast plus three assumptions I had to state out loud, and the model made each one a dial I could turn and watch.

The hospital data are real. The spike, treatment effects and penalties are hypothetical, and the pressure cutoff is an unverified adaptation of historical limits. This is a learning exercise in a decision making workflow, not evidence of reduced crowding, savings or better outcomes. The [executed notebook](https://github.com/hotsoupisgood/hse-urgent-care-report-trolley-analysis/blob/main/decision_science_demo.ipynb), the [design notes](https://github.com/hotsoupisgood/hse-urgent-care-report-trolley-analysis/blob/main/decision_science_plan.md) and a [visual gallery](https://github.com/hotsoupisgood/hse-urgent-care-report-trolley-analysis/blob/main/decision_science_visuals.md) are on GitHub. The books were Hammond, Keeney and Raiffa's [Smart Choices](https://www.oreilly.com/library/view/smart-choices/9781633691056/Text/Smart_Choices.html) for PrOACT and Jim Q. Smith's [Bayesian Decision Analysis](https://assets.cambridge.org/97805217/64544/excerpt/9780521764544_excerpt.pdf) for the expected loss framework. A real crowding triggered intervention is described in [Wang, Arikan and Mallik (2026)](https://doi.org/10.1111/deci.70040), which motivated the setup but does not establish the assumed weekly effect, and the sensitivity analysis follows [NICE's economic evaluation guidance](https://www.nice.org.uk/process/pmg36/chapter/economic-evaluation-2/).
