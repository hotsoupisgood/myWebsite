---
layout: layouts/post.njk
title: Gene Expression Level site
templateClass: tmpl-post
date: 2024-11-17
---
I made a microservice I thought would be useful for investigating gene expression levels in various tissues.  

[Here is a link to the website](https://mosaicofgenes.com/)

![Mosaic microservice app](img/mosaicofgenes_front.png)  

It queries [Open Targets](https://www.opentargets.org/) to get normalized TPS values that contain your tissue types of interest, then divides those values by every normalized value to get a percentage for tissue type.  

I used Vue.js and Reactive SpringBoot (JAVA/Webflux).  

![Mosaic microservice app](img/mosaicofgenes_graph.png)  


