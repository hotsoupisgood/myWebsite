---
layout: layouts/post.njk
title: Gene Expression Level site
templateClass: tmpl-post
date: 2024-11-17
---
A microservice useful for comparing gene expression across various tissues.  

[Here is a link to the website](https://mosaicofgenes.com/)

![Mosaic microservice front page](img/mosaicofgenes_front.png)  
![Mosaic microservice app graph](img/mosaicofgenes_graph.png)  

It queries [Open Targets](https://www.opentargets.org/) to get the normalized TPS values for your gene, sums them, then divides them by sum total of all TPS values for the gene. 

I used Vue.js and Java (SpringBoot/Webflux).  




