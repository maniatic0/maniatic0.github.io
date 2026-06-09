---
layout: default
title: Portfolio Articles
---

# {{ page.title }}

{% for post in site.posts %}
- **{{ post.title }}** - *{{ post.description }}* [Article]({{ post.url }})
{% endfor %}
