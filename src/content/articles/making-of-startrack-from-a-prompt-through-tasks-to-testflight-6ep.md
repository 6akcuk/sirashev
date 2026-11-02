---
title: "Making of StarTrack: From a Prompt Through Tasks to TestFlight"
description: "One week of evenings, 9 issues from a PRD, one AI pipeline — and what I learned along the way.  It..."
publishedAt: "2026-07-07T17:19:12Z"
readingTime: 8
tags: ["ai", "reactnative", "mobile", "sideprojects"]
sourceUrl: "https://dev.to/sirashev/making-of-startrack-from-a-prompt-through-tasks-to-testflight-6ep"
---

*One week of evenings, 9 issues from a PRD, one AI pipeline — and what I learned along the way.*

It all started with an ordinary parenting problem: my son — he's nine — constantly wanted more screen time, and every conversation about it ended in an argument. My wife and I tried restrictions and control — it didn't work. Then Claude suggested a different approach: don't restrict — reward. A prize for every completed task. All that was left was tracking the tasks and the rewards, and I thought: why not build an app that takes care of that? That's how the idea of StarTrack was born.

Why I decided to entrust development to AI in the first place, and how it changed the very process of prototyping, I covered in detail in my previous article — [How AI Changes Prototyping and Testing Ideas](/articles/how-ai-changes-prototyping-and-testing-ideas-1phc/). This article is about the process itself: step by step, from the first prompt to testing in TestFlight.

**Spoiler**: 1 week from idea to TestFlight, working evenings only; 9 tasks carved out of the initial PRD; around 14 screens; budget — a Claude Max subscription.

## The First Prototype in One Evening

I had prior experience building with React Native: you assemble features screen by screen, and then it all compiles into a working app for iOS and Android. But this time I decided to hand development over to AI as much as possible — following the Pareto principle I wrote about in the previous article: 20% of the effort for 80% of the result, without polishing the code to a shine in the early stages.

First, I asked the AI to sketch out a tracker based on the rules we had already defined for our son and the reward economy. The very first screen made a strong impression: there it was — an almost ready, working task tracker, right inside the chat with the AI. Interactive, keeping count of all the stars and rewards. Take it and run it, right now.

![The first interactive prototype, right inside the chat](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/mtxupow4dhhbwmf9dgap.png)
![Stars and rewards are already being counted](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/q2lpefkft4w04pcukzoj.png)
![A working task tracker before a single line of "real" code](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/9szvz6bvfpmydq978h53.png)

I decided this was a good starting point to get serious about building a working app — one that could be used beyond our family.

## Product Requirements Document

Based on the rules we had already tested on our son, the requirements for tasks and rewards, and the fact that we needed a tracker app on our phones, I asked the AI to prepare a PRD (Product Requirements Document) — the initial document and foundation for development.

After digging into the nuances of both publishing and running the app, I settled on the Expo + Firebase stack. **Expo** is wonderful for fast development and testing: you write code, make changes — and it instantly compiles and runs on every platform. **Firebase** gives you a nearly free realtime database with push notifications, authentication, and subscriptions to data changes.

The core entity is the family: it defines the tasks the kid needs to complete, the rewards, and the family members themselves, with separate permissions for the child and the parent. To make inviting a new member easier, I asked to include QR code generation and a scanner.

After all the revisions, the AI produced a large, detailed document: project goals, database schemas, architecture, stack, a basic implementation of Cloud Functions, and access levels for the entities. A document like this should not be dumped into the AI with a request to "turn it into a finished product." It's a foundation that needs to be sliced into concrete tasks (issues) — and those you can feed to the AI.

## Writing Tasks and Iterating

I did all the preparation in the Claude web chat, which lets you view documents, download them, or edit them on the spot. After downloading the PRD, I saved it into a pre-made folder for the future project so I could start the development loop in the console.

With the PRD in the project root, you can reference it in a prompt via @PRD.md and ask the AI to prepare tasks for implementation. Each task should be built as a vertical slice — covering both the backend and the frontend, so that once it's done, you can launch it and test it visually. Each task is saved as a document in the project root.

```plaintext
Example prompt: Take @PRD.md and slice the project into separate tasks —
in such a way that after each task, the project can be launched and
verified on a simulator or a real device. Everything must be covered
by tests.
```

In the end, the first PRD gave me 9 tasks covering all the basic functionality of the app. These tasks were uploaded as issues to my project's GitHub repository — that makes it easier to track them and mark them done.

![9 issues sliced out of the PRD, tracked in GitHub](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/nrab0ce0hrhqdla1xdf5.png)

With the PRD broken into tasks, you can iterate through them one by one. "Accept mode" fits well here, so you don't get interrupted to approve every single edit. My goal was a working product without deep-diving into the code along the way; polishing would come later.

The process never becomes fully unsupervised, though: Claude still asks permission for particularly sensitive commands — the ones that could cause harm or read something they shouldn't. The human remains a mandatory participant. As I said, this mode is mostly about skipping the code reading: if something breaks, I'll catch it at compile time or during testing.

After the first task, I got a basic starting screen — still with mocks, but already reflecting everything essential I wanted to see in the app. The only thing I didn't like was the visual side. And here comes the magic that lets you change direction on the fly: in the web chat, which already had the project description, I asked for three design variants — in parallel with the console, where the app kept being built according to the prepared tasks.

![Three design directions: 2 of 3 generated while development continued in parallel](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/trfopkrzx36cwhnurdwa.png)
![Three design directions: 3rd generated while development continued in parallel](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/o9cng1sy2d006w1rhlbu.png)


How I chose between the variants and why this way of testing hypotheses works at all is the subject of the previous article. Here I'll just talk about the choice itself: I felt the app should radiate tenderness, care, and warmth. After all, it's being made for my kid, and I want him to enjoy using it. So I went with variant A — warm and soft, but not "babyish."

Having settled on the palette, the typeface, and the overall skeleton, I asked the web version of Claude to prepare all the main screens — both for the big picture and as mockups Claude Code could rely on during implementation.

This process is genuinely impressive and inspiring. You're the leader of two parallel processes working on your idea: in one place you analyze and discuss business, marketing, and design questions; in the other, you actively develop, adjust, and fix bugs. And all of it happens in the blink of an eye.

Since a redesign is a very heavy operation that burns a lot of context, after preparing all the mockups I asked Claude to slice the redesign into tasks as well, so I could iterate through them one at a time. As a result, I had 13 tasks (issues) ready for implementation.

![The redesign, sliced into 13 issues of its own](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/rxelrorgp8v1qz7b5yag.png)

## Refactoring and Improving the Code

To keep tech debt from piling up and to give the AI higher-quality code to work with, I decided to do a full refactor toward the end of development, including adopting a frontend architecture. Since the project is React Native — essentially a pure frontend app — I chose FSD (Feature-Sliced Design).

The code was already written reasonably well, but it was time to finally move everything into separate files and put the logic where it belongs. To start, I asked the AI to analyze the structure and the code and, with the move to FSD in mind, prepare a migration plan. The FSD migration didn't require burning through many tokens, so I asked the agent to continue working through the plan after first running the **/compact** command to preserve the most essential context. A good share of the files were simply distributed into different folders with console copy commands, instead of crowding together in one shared place.

The final structure turned out really well, and once again — the Pareto principle in action: 80% of the result for 20% of my effort.

![The project structure after migrating to Feature-Sliced Design](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/71matmf3gtavm670fhb7.png)

## Testing and Delivery

Right now I'm actively rolling the app out within the family to understand how convenient it is and whether I've accounted for everything. Bugs that pop up I fix quickly through the AI: I describe the problem and hint at which component might be the source.

Here's what the app looks like now — that same warm direction from variant A, alive and well in production:

![StarTrack today: the child's home screen](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/vnnfd0xssh04yvq71rvq.png)
![A second family with its own theme](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/k6xp35a494z2ffyk62w4.png)

As we use it, new ideas keep coming up. For example: tasks are different — some are urgent, others are daily; they have different completion times and different rewards. That's how a plan for different task types was born, each with its own quirks.

![The plan for different task types, born from real family usage](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/mvtnrr7h9bpw6nk5izf5.png)

For fast delivery of changes, I hooked up EAS builds: they let you update just the bundle and push it instantly to the installed apps, bypassing the publishing and review process.

Testing on iOS via TestFlight turned out to be less intuitive than expected: it took time to figure out both the interface itself and how to invite users to the beta test, plus waiting for newly built versions to be approved — thankfully, EAS speeds this up a bit.

## Takeaways

To wrap up, here are the key points and results:

- **Timeline**: from idea to TestFlight — **1 week** of evenings (of which the PRD took **2 days** and development took **5 days**)
- **What I'd do differently**: I would probably have started real-world usage earlier — under "ideal" greenhouse conditions of simulation, you can't see the real problems, especially since iterating quickly is not an issue with AI
- **What's next**: we'll bring in our second kid via the Android version so the kids can earn and spend points together — through a separate additional "family," keeping their areas of activity apart. Eventually, I'd like to publish the app for everyone, if it genuinely solves a real pain
- **Advice for anyone who wants to repeat this path**: don't be afraid to try, and don't worry about how the code is written. These days, almost anyone with even a little technical background can test their hypothesis and decide whether it's worth investing further

Drop your questions in the comments — I'll be happy to talk through the pipeline.
