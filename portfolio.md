---
layout: default
title: {{ page.title }}
---

# {{ page.title }}

{% for post in site.posts %}
- [{{ post.title }}]({{ post.url }})
{% endfor %}
