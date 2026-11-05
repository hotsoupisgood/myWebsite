---
layout: layouts/post.njk
title: A Swipe Labeller for YIMBY and NIMBY Comments
templateClass: tmpl-post
date: 2026-11-04
tags:
  - web app
  - statistics
---
**TLDR:**

- I built a phone page for labelling public comments from Bay Area meetings. Friends read and hear each comment and say whether the speaker is a YIMBY or a NIMBY.
- The answers are a human check on the automated labels in the [Exploratory Dashboard of Bay Area Public Meetings](/visualizations/bay-area-transit-analysis/).
- I tried three designs and chose Option C: one YIMBY or NIMBY question, answered with a swipe.

YIMBY means "yes in my backyard": the speaker wants more homes, or more transit, walking or cycling, built in their area. NIMBY means "not in my backyard": the speaker is against it in their area.

**Option A: two questions.** The labeller picks the topic, then picks for, against or neutral. This records the topic and the stance separately.

![Option A: a comment card with Topic buttons (Housing, Transit, Other) and Stance buttons (For, Against, Neutral) and a Next button](/img/yimby-labeller/option-a-two-questions.png)

**Option B: one question, for or against.** The labeller swipes right for "for" and left for "against". It takes one action per comment instead of three.

![Option B: a comment card asking whether the speaker is for or against more housing, with Against, Neutral and For buttons](/img/yimby-labeller/option-b-for-against.png)

**Option C: one question, YIMBY or NIMBY. This is the one I chose.** The swipe is the same as in Option B, but the answers are YIMBY and NIMBY. These are the words the study uses, so the answers need no translation before they are compared with the automated labels.

![Option C: a comment card asking whether the speaker is a YIMBY or a NIMBY, with NIMBY, Neutral and YIMBY buttons](/img/yimby-labeller/option-c-yimby-nimby.png)

**The final version.** It is Option C with one change: it asks one general question for housing and transit together, instead of one session for each. The words light up as the audio plays, and a swipe saves the answer and shows the next comment.

![The final labeller: the audio plays with the current word highlighted, then the card is swiped right and stamped YIMBY](/img/yimby-labeller/final-audio-swipe.gif)
