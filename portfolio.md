---
layout: default
title: Portfolio Articles
---

<ul class="space-y-3">
{% for post in site.posts %}
  <li class="text-slate-300">
    <a href="{{ post.url }}" class="font-bold text-white hover:text-sky-400 transition-colors">
      {{ post.title }}
    </a>
    <span class="text-slate-400 mx-2">—</span>
    <span class="italic text-slate-300">{{ post.description }}</span>
  </li>
{% endfor %}
</ul>
