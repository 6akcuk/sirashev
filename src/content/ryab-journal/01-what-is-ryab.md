---
title: "Ryab: rebuilding a city events map from scratch"
description: "An introduction to the project, its new direction, and this development journal."
publishedAt: "2026-11-03"
---

Ryab is my personal project: a map for discovering and sharing information about what is happening in a city. I am now rebuilding it from scratch with a new architecture.

The previous version gave me experience to draw on, but the new architecture is a fresh development effort. I will describe its components and decisions as they take shape rather than presenting the previous implementation as the current one.

## The new direction

The new architecture starts with information from city sources and works toward a clearer picture of developing events. An early focus is distinguishing an individual signal from the city event it may describe, while accounting for uncertainty in extracted information.

The current work includes a local development environment and an initial API foundation. The wider processing flow is still being designed and built, so planned components should not be mistaken for completed features.

## What this journal is about

I will use this journal to document the journey from an idea to a working product: product decisions, architecture, implementation, experiments, and things I learn along the way. Where I refer to the previous version, I will make that distinction clear.

I work with AI coding agents while remaining responsible for requirements, technical direction, review, and validation. This journal is also a place to examine how that process works in practice.

For an overview of the project, see the [Ryab project page](/projects/ryab/). I also share shorter updates in my Russian-language Telegram channel, [From Code to Product](https://t.me/fromcode2product).
