---
title: "Rebuilding Ryab: what I learned from working with AI agents"
description: "Why I am starting a new version of Ryab, and how I want to balance development speed with understanding the product."
telegramUrl: "https://t.me/fromcode2product/3"
publishedAt: "2026-11-03"
---

Working on Ryab.io with Claude Code showed me two sides of AI-assisted development. I built a large project with impressive functionality quickly: more than 2,000 commits in two to three months.

At that pace, though, I did not have enough time to read and analyse all the code. I could not fully understand where and how everything worked, how readable it was, or how well each part performed.

## What the first version taught me

I did investigate performance and point out places where it was suffering. I also decided to update the application's architecture to make responsibilities clearer across packages and functions.

Those changes did not, on their own, make it easy for me to understand the product well enough to improve it myself.

Getting there would take substantial time and effort, and I still might not understand every part completely.

Reworking whole blocks of a system I do not fully understand would bring its own difficulties.

## Finding a better balance with AI

I think the answer is to balance speed with involvement: guide and review the work of AI agents at each stage, instead of letting the project grow faster than I can understand it.

I do not think I need to write every line of code myself. But as an engineer, I need to set the direction: define design patterns and the structure of the code and files, then give agents those foundations for subsequent tasks.

## Why I am rebuilding Ryab

The current version does not yet fully reflect my vision for the product. There is already a lot that could be published, but it lacks the full data dynamics I want and a way to extract event attributes that can be used as structured data.

I am starting a new version with a new architecture to work toward that vision and to stay closer to the implementation as it grows.

## What comes next

I plan to take parts of the first version that have already proved useful and bring them into the new one where they fit. Along the way, I will share the mistakes and difficulties I have already encountered, as well as the ones still ahead.

This journal will follow the decisions behind Ryab: the architecture, the product, and how I work with AI agents while building them.

