---
layout: layouts/post.njk
title: Personal Text Analysis
templateClass: tmpl-post
date: 2024-03-25
---


At the beginning of the year I went through a breakup and did an exploratory data analysis (EDA) of my text messages with this person.

I was interested in exploring the following questions:   

What illustrative trends can we see to validate that this is normal data?
Are there observable trends in our messages leading up to the breakup?  

To answer 1. I plotted the time in day that the texts take place, binned by hour. It shows what you would expect, texts drop in the middle of the night. One interesting trend is that I (orange) text a little more in the morning, and my ex (blue)  is more active in the evening. Which is cool to see because I was more of a morning person.
![Picture of texts binned per hour of day.](img/textsbyhourinday.png)   
This illustrative plot shows that my data is relatively normal, which is good because this analysis may be able to be applied to future data.

To answer 2. I applied a sentiment analysis algorithm to each text to get the table of positive or negative values for our data. I binned these values by day for each of us, and plotted them. I noticed an increased variability leading up to the breakup (which took place at the far right of the plot).  
![Plot of sentiment.](img/sentement.png)   
The next plot is of the variance, binned by week this time, to capture the day to day variability seen in the prior plot.  
![Plot of sentiment variance.](img/sentimentvariance.png)   

As my ex and I were working through our issues, we would have days where we feel like we are going to make it, followed up by days where we both feel like it's over. The intense switching of positive and negative emotions can be seen in this data! This was so cool for me to see and is one of the reasons I love data analysis of contemporary issues. You can observe trends that you feel!

I do have one lingering question. Do these trends express themselves in other breakups? I scoured the internet and unfortunately could not find any ethical data.

This was a cool project for me and I hope someone could get some value out of it too. :)
