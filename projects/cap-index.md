---
layout: layouts/post.njk
title: Cappuccino Index Claim Significance 
templateClass: tmpl-post
date: 2026-04-04
---
**TL;DR**

- Hoffmann's cappuccino index puts Italy second, just behind Australia.
- That ranking rests on about 15 survey responses from Italy.
- With that little data, Italy isn't significantly different from eleven other countries, including first place Australia.

James Hoffmann's [new video on the cappuccino index](https://www.youtube.com/watch?v=WtlE3BW9Nqs) surveys baristas for the country they work in, the price of a cappuccino at their café, and their hourly wage, then uses the number of cappuccinos a barista could buy with an hour's wage to rank countries. By his numbers, Italy comes in second overall, just behind Australia. The problem is the survey is small and self-selected, so I wanted to know whether that gap between countries is real or just noise.

I focused on Italy and Australia since James called them out directly. So I bootstrapped the samples and plotted the mean and 95% confidence interval for every country, shown below.

![all significant comparisons](/img/all-ratio-cap-index.png)

Italy stands out immediately. It has the widest confidence interval of any country, and its true mean ratio could plausibly sit anywhere from about 3.6 to 8.4. That's too wide to take the second highest ranking at face value, so I tested it directly. I bootstrapped a pairwise comparison, sampling the difference in ratio between Italy and each of the other 45 countries, and applied a Bonferroni correction for testing that many pairs at once. If a country's 95% interval of differences spans zero, it isn't significantly different from Italy in this two tailed test.

![paired with italy significance](/img/cap-index-paired-test.png)

The grey x's mark the countries that aren't significantly different from Italy, shown in black: eleven in total, including Australia itself. Even the number one and number two spots in Hoffmann's ranking can't be reliably told apart with this data.

Given that, I don't think you can confidently claim Italy has the second highest index. Part of the problem is sample size: this was an opt in survey of baristas who watch Hoffmann's channel, not a random sample, so the number of responses per country tracks how many baristas from that country happened to answer, not anything about the country itself. Italy has about 15 responses. The USA and UK have roughly 600 each. That's nowhere near enough to pin down a precise ranking.

![Number of samples per country](/img/cap-index-sample-size.png)