---
layout: default
title: VisualizAR, AR math learning app
date: 2022-02-05
description: "Developed an AR application using Unity and Vuforia to help high school students learn graphing and vector math through interactive 3D visualizations optimized for mobile devices."
tags: ["Unity", "AR", "Education", "Mobile"]
---

**Language**: C#

**Engine**: Unity

**Team Size**: 2

**Role**: Gameplay Programmer

**Duration**: 2 months

**Code**: [here](https://github.com/maniatic0/VisualizAR)

For this university project, we were tasked with developing an AR application to help high school students learn graphing and basic vector math. We used Unity with Vuforia as we both knew Unity and Vuforia AR support was the best at the time. Furthermore, both provided Android support which was crucial to allow as many students as we could to use our app.

I was mostly in charge of developing the graphing side of the app. It was an interesting challenge to come up with a design to allow students to see the power of the functions they were learning at school. The idea we came up with was to use cubes to render several 3D functions based on sines and cosines, like the examples that are commonly shown for shaders as they form interesting shapes. We selected cubes as they were easier to be understood as points in space for students on the small screen of a phone.

After the design and basic implementation were done, the next challenge came to optimizing it for phones. It was an interesting task managing the tradeoff between the number of cubes, which help students understand what was happening, and how smooth the application ran on several low-end Android phones. One big limitation Unity had at the time was that most of their functions were not thread-safe, so solutions using multi-threading were out. In the end, the solution I came up with was using fewer cubes but making them bigger. This came as when we were testing I noticed that people really liked when big cubes were used as it helped them connect it to the idea that they were points in space being moved around using math functions.
