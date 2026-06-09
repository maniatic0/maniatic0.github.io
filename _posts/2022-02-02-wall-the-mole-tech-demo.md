---
layout: default
title: Wall the Mole techdemo
date: 2022-02-02
description: "Tower defense game using uCrowds UE4 plugin with 10,000 concurrent agents. Developed instanced mesh rendering system, memory pools, and Blueprints API for team collaboration."
tags: ["Unreal Engine", "Crowd Simulation", "Game Engine", "Game Design"]
---

# Wall the Mole techdemo

**Language**: C++ and Blueprints

**Engine**: Unreal Engine 4 (UE4)

**Team Size**: 5

**Role**: Gameplay Programmer

**Duration**: 2 months

**Code**: Under NDA

During this project, the second one in the [Crowd Simulation](https://www.cs.uu.nl/docs/vakken/mcrws/assignment2.php) course at Utrecht University, we were tasked with developing a tower defense game that used [uCrowds](https://www.ucrowds.com/)’ UE4 plugin, supported more than 1000 simultaneous agents, and supported different types of agents. To accomplish this we selected static meshes for the agents as we didn’t have an animator in the team, and because it was the first time all of us were working with UE4.

For this project, I was selected by the team to be in charge of abstracting the use of the uCrowds’ plugin, the rendering of agents, and developing Blueprints for ease of use by other team members.

For the first two tasks, I developed a system based on `UInstancedStaticMeshComponents`, memory pools to avoid allocating/deallocating too many objects, and a central orchestrating component to handle the connection to the uCrowd’s plugin and the agent’s type information. The central orchestrating component was used to allow other team members to set the blueprint prototypes of the agent types through UE4’s UI, which made it easier to iterate. As well, it was in charge of updating the agents transforms using multithreading, updating the agent state in UE’s side (if there were removed for example), and being the central manager who knew how to spawn agents of a type and handle their lifecycle.

As for the last task, it was important to offer other team members blueprints to interact with the main systems to quickly iterate a prototype during the short time we had for the project. For this, I exposed several functions of the central orchestrating component and functions from the uCrowd’s plugin to the blueprint system. I designed them to be easy to use with other UE’s systems in a performant manner, as developing C++ code took too long for the course’s milestones we had to complete.

In the end, we developed one of the best game prototypes of the course. We showcased several crowd simulation capabilities of the uCrowd’s plugin, and reached 10000 concurrent agents (more than the project’s objective) while being fun to play.
