---
title: "How I Split a Week-Long Task Into 9 AI Sessions and Shipped It in 2 Days"
description: "A complex branching form that would have taken me a week to a week and a half went out in two days..."
publishedAt: "2026-08-04T18:40:20Z"
readingTime: 6
tags: ["ai", "productivity", "webdev", "claude"]
sourceUrl: "https://dev.to/sirashev/how-i-split-a-week-long-task-into-9-ai-sessions-and-shipped-it-in-2-days-3m3h"
---

A complex branching form that would have taken me a week to a week and a half went out in two days with Claude Code. The point wasn't that the AI wrote code faster — it was that I could stay focused on the problem itself and hand the implementation over.
 
## The task
 
I was handed a multi-step settings form with branching and backwards compatibility: a description of the flows and the expected end result. The frontend stack is standard — React and TypeScript — but this part only runs inside an Electron app.
 
The mockups were prepared by a designer in advance and signed off with the product manager. A few things made it harder than it looked:
 
- backwards compatibility with the existing flow had to be preserved;
- one of the steps contained a diagram of how the feature works, and it wasn't a plain image or an SVG — it was a set of elements on the page with connections between them;
- popup and table blocks had to be reused from another feature.
At a glance the task looked like a week of work plus a couple of days for checks and fixes.

![Branching flow of the form](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/sfytns29avxm8k5ali9m.png)
 
## Analysis
 
I started by analysing the task itself. I copied the prepared description into a markdown file at the root of the project repo, then wrote a prompt referencing that document and added a couple of clarifications for the AI:
 
```text
@docs/task.md Let's plan the implementation. Launch a separate Explore agent
to research the codebase, and I want you to ask me questions along the way
if you can't find the answer in the code.
```
 
That took a while, after which I started an actual conversation about what needed to be built and how. Whenever I didn't like a proposed answer, I switched to chat mode to discuss the problem in more depth. Along the way it asked questions that weren't obvious at first glance, which let me go back to the product manager for additional requirements.
 
Once everything was clarified and the AI genuinely understood what was expected, I asked it to write a plan as a markdown file in the project directory — the requirements and its view of the implementation.
 
Why bother? Because by that point the AI had already done a solid chunk of the work: it had clarified implementation details and corner cases, and — unfortunately — filled up a large part of the current context. Moving straight to implementation from there was not an option.
 
## Context
 
So what's the actual problem with context?
 
Context is the amount of information the AI can hold in its "head" at once. Some current models — for example the ones behind Claude Code and Codex — started at 200,000 tokens and have since expanded to a million. As you approach the limit, the context has to be cleared or compacted (for instance, by extracting only the key points needed going forward).
 
Filling a million tokens takes a lot of code and a very long conversation, so that sounds reassuring. But there's a catch: the context splits into a **smart** zone and a **dumb** one. The smart zone is self-explanatory. The dumb zone is where the AI starts hallucinating more, making mistakes, and occasionally forgetting what it was asked to do. When you're writing code, that matters a lot — you don't want to push the context that far, so it needs to be managed.
 
From the [AI Coding for Real Engineers](https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w) course I learned that the dumb zone starts somewhere around 100,000 tokens. Once a session crosses that mark, the odds of errors and hallucinations start climbing, and the longer you stay there, the worse it gets.
 
So tasks have to be decomposed to fit inside those 100,000 tokens. Planning worked out roughly that way for me — I overshot slightly, ending up around 125,000 tokens, which is why I delegated the codebase research to a separate agent instead of spending my own context on it.
 
## Decomposition
 
Having the plan written down and saved means the analysis isn't lost — it becomes the source for a list of tasks I can implement with the AI.
 
In a fresh session, I asked it to read the plan and prepare the tasks, with one constraint: each task had to be complete enough that I could take it and test it in the running app. [I've mentioned this approach in previous articles](/articles/how-ai-changes-prototyping-and-testing-ideas-1phc/) — it's called vertical slices, where a single task touches every layer of the app: backend, database, UI. That's what makes it reproducible once the agent is done.
 
That produced 11 tasks, two of which I merged into others — they shared a domain layer and were small enough that splitting them out wasn't worth it. Each task got its own markdown file with a number and a title.
 
My estimate was 2–3 hours per task: reading the design from Figma, markup, fixes against the mockup, business logic, following the project's composition and code style rules, plus visual testing and the corrections that follow. That adds up to 2–3 days for the whole thing.
 
![Task dependency graph](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/aztuxfhxujkgvyzv758w.png)

## Implementation
 
### Setup
 
I worked in Claude's default mode, where every edit has to be reviewed and approved by the developer. That way I controlled every file edit and every file creation — against the project's requirements and code style, and while watching for potential bugs.
 
For each task I started a clean session:
 
```text
Take @docs/task-1.md as the task description and implement it.
```
 
When I didn't like what it proposed, I switched to "Chat about it" and explained what bothered me and how it should be done instead. A few times Claude named translation keys in the wrong format, so I pointed it out and told it to remember that for later tasks, so the rule would stick in the project memory.
 
### Catching Claude Code in a mistake
 
On the fifth task I had to reuse code from another form that creates similar actions in the app. I noticed Claude was duplicating parts of the code while importing components and utilities from what is effectively a private folder — reaching too deep into another feature's directory.
 
I stopped it halfway and asked it to lift the related folders and files up to a shared level, so everything matched the project's architecture. I also pointed out that some of the functionality existed in both places, and asked it to extract the popup invocation and its config into a shared file so both could reuse them.
 
Because I was going step by step, I caught this early — before it would have meant rewriting a large chunk of finished code.
 
### Verifying the result
 
After each task I could visually check the form step against the design and confirm it worked. Claude didn't get the spacing right on the first pass, and picked the wrong font sizes in a few places. For that it's handy to enable dev mode in Figma and have Claude connect to the selected node over MCP and re-check the design — I told it specifically that the spacing and the step heading's font didn't match.
 
Once I was satisfied and the form behaved as required, I committed everything, both to have a rollback point and to avoid losing finished work.
 
Context usage per task ranged from 80,000 to 135,000 tokens. Yes, there was an overshoot, partly because of the refactor of the two features in task five — but overall the approach worked well.
 
## Wrapping up
 
I finished all 9 tasks, and slightly faster than planned — two days. The ninth task closed out the cycle on minor things: preparing translation keys for every language, running tests, lint and typecheck, and going through a short checklist in the task document covering a couple of corner cases that had been flagged in the design and requirements.
 
Code review came back with few comments, mostly minor ones or places that slightly broke another part of the app. Overall the code quality held up.
 
For me this was a genuinely useful experience of building something with the AI fully involved, with me acting mostly as a mentor and reviewer. It gives you confidence in the code. The AI helped run a solid analysis of the task, surfacing details and implementation nuances specific to the codebase. As the developer, you set the direction and do the checking, while the AI takes on the volume — and that speeds things up dramatically.
