---
title: Post with Eleventy.
description: This is an explanation on how to post to your github site with the Eleventy framework.
date: 2022-06-16
tags:
  - Eleventy
layout: layouts/post.njk
---

## Section Header
1. Navigate to your website directory
```
cd /path/to/website/directory
```
2. Make a blog post, edit your site, etc...
3. Build your project.
```
npx Eleventy
```
4. Stage your changes. (Add changes you made to git)
```
git add *
```
5. Commit your changes to git.
```
git commit -m "description of your changes"
```
6. Upload your changes to github.
```
git push
```
7. Done! You should see your website updated.