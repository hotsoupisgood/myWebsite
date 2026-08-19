---
layout: layouts/post.njk
title: Cappuccino Index Claim Significance 
templateClass: tmpl-post
date: 2026-04-04
---
In a [new James Hoffmann video](https://www.youtube.com/watch?v=WtlE3BW9Nqs) on the cappuccino index, he surveyed his audience asking baristas to report the country they live in, cost of a cappuccino, and their wage. He used the average number of cappuccinos a worker can buy with one hour of wages as the index. Then compared indices to support some hypothesis. I wanted to test the comparability of the countries. Specifically Italy and Australia because James referenced them. So, I started by bootstrapping the samples and plotting the mean and 95% confidence interval, shown below.


![all significant comparisons](img/all-ratio-cap-index.png)
Italy stands out as having the most uncertain estimate. The sample means could really span a wide range. To see if Italy can be compared to the countries closest to it in the ranking, I bootstrapped a pairwise test by sampling the difference between Italy and each other country below

![Italy's significant comparisons](img/italy-ratio-cap-index.png)
The grey x's show the countries that are not significantly different from Italy (in black). 

Given his data, we really cannot confidently claim that Italy has the second highest index. To make a more robust dataset one would need to have more confident samples.

![Number of samples per country](img/cap-index-sample-size.png)