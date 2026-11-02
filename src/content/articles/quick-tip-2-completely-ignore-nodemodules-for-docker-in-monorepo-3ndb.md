---
title: "Quick tip 2 - Completely ignore node_modules for Docker in Monorepo"
description: "The problem   While working on my NodeJS project, I encountered issues with large Docker..."
publishedAt: "2025-10-05T14:52:52Z"
readingTime: 1
tags: ["webdev", "javascript", "docker", "node"]
sourceUrl: "https://dev.to/sirashev/quick-tip-2-completely-ignore-nodemodules-for-docker-in-monorepo-3ndb"
---

## The problem

While working on my NodeJS project, I encountered issues with large Docker images while building them from the source code. The problem was that Docker copied all files, including the `node_modules` folder, despite having a line in `.dockerignore` that excluded' node_modules'.

```dockerignore
node_modules
```

## The solution

Why didn't it work properly? It was a monorepo PNPM project, and ignoring the node_modules folder with a simple `node_modules` was not enough. The key was that the context of building images was rooted in the project's foundation. I didn't have `node_modules` in the project's root, but had it inside each application and package. To solve that, I've added another line in my `.dockerignore` file:

```dockerignore
**/node_modules
```

So now, it doesn't copy any of the `node_modules` folders inside applications, packages, and services. Each image has its own `node_modules` folder during the installation process. Simple and clean.

Photo by [Favour Usifo](https://unsplash.com/@favour_usifo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/a-close-up-of-a-computer-screen-with-words-on-it-Tx7WBGfsJgg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
