---
title: "Build and run your project in Monorepo with PNPM"
description: "Introduction   You have two variants of code organization for your projects:    Keep the..."
publishedAt: "2025-01-19T07:40:04Z"
readingTime: 6
tags: ["javascript", "node", "pnpm", "programming"]
sourceUrl: "https://dev.to/sirashev/build-and-run-your-project-in-monorepo-with-pnpm-p48"
---

## Introduction

You have two variants of code organization for your projects: 
1. Keep the project's code in different repositories like a polyrepo;
2. Keep everything in one single monorepo.

They are all good, and it is up to you which one is the best fit for your projects. A **polyrepo** is the current standard way of developing applications. You have multiple teams, each with its repo with build artifacts and pipelines. They have **autonomy**. It is their own decision about libraries to use, how to deploy, and who can contribute.

The opposite way is to have a **monorepo**. You split your projects into applications and packages, and you can easily re-use a code and share standard functionality. It helps you unify third-party package versions, recursively build dependencies' source code, and use the same tooling for CI/CD pipelines.

Many big tech companies use monorepo for their projects. For example, Yandex has everything in one big monorepo, splitting into small monorepos for business projects. It helps to share ideas and interesting code practices between teams and business units. 

You can find more information about monorepos and tooling at https://monorepo.tools/. Here, we will focus on a simple solution with PNPM, which provides us with basic functionality to create and use monorepo in our projects.

Pnpm uses **workspaces** to unite multiple projects inside a single repository.
## Setup

First, we need an empty folder for our new monorepo project. Inside the repo, let's initialize pnpm.

```bash
pnpm init
```

To enable the workspaces, create a `pnpm-workspace.yaml` file with a description of package folders:

```yaml
// pnpm-workspace.yaml

packages:
  - 'packages/**'
  - 'apps/**'
```

We add shared libraries that every application could use inside the `/packages` folder. The `/apps` folder contains applications, such as separate mobile React Native applications and web applications that use the same components or connection libraries to communicate with an API server.

If you haven't seen my articles about creating a Telegram publish bot, please look at them. We will use its source code from GitHub: https://github.com/6akcuk/PublishBot. Download and unpack the ZIP file to the `/apps/publish-bot` folder.

Run the installation command inside the `/apps/publish-bot` folder:

```shell
pnpm install
```

We prepared the repository for this article. What's the plan? We will modify the code inside the publication bot's preview command. Right now, we cannot correctly preview the draft messages left by users. For future projects, it would also be nice to move the preview functionality into a separate package that other applications could use inside them.
## Telegram package

Let's create our first package inside a monorepo. We have the `/packages` folder and create a folder called telegram-utils inside it. 

For the telegram utils, we need to initialize pnpm and typescript:

```shell
pnpm init && pnpm add -D typescript && pnpm tsc --init
```

The package will provide only one function combining texts and captions from all messages - text, video, and photo. To format messages, we need to install a Telegraf package.

```shell
pnpm add telegraf
```

All source code should be located inside the `/src` directory. As it is a shared library/package, it is good to have different folders grouped by their features. The function will combine texts, so it works with text and should be inside a `/texts` folder. Here is the full source code for the **combineTexts** function:

```ts
// packages/telegram-utils/src/texts/combineTexts.ts

import { Message } from 'telegraf/types';
import { FmtString, join } from 'telegraf/format';

type GroupedMessages = {
    photos: Array<Message.PhotoMessage>;
    videos: Array<Message.VideoMessage>;
    text: Array<Message.TextMessage>;
};

export const combineTexts = ({ photos, videos, text }: GroupedMessages) => {
    // Get all captions from messages with photo
    const photoTexts = photos
        .map(photo =>
            photo.caption
                ? new FmtString(photo.caption, photo.caption_entities)
                : undefined
        )
        // Guard for array filtering function 
        .filter((t): t is Required<FmtString> => t !== undefined);

    // Get all captions from messages with video
    const videoTexts = videos
        .map(video =>
            video.caption
                ? new FmtString(video.caption, video.caption_entities)
                : undefined
        )
        .filter((t): t is Required<FmtString> => t !== undefined);

    const allTexts = [];

    // Combine text from text messages
    if (text.length) {
        allTexts.push(join(text.map(t => new FmtString(t.text, t.entities))), '\n');
    }
    if (photoTexts.length) allTexts.push(join(photoTexts, '\n'));
    if (videoTexts.length) allTexts.push(join(videoTexts, '\n'));

    // Final combination
    return join(allTexts, '\n');
};
```

Notes about the function's code:
- The input of the function is grouped messages by their type: photo, video, or text;
- Media messages should be transformed into an FMT string with caption and caption entities. We should return **undefined** for later filtering;
- We join arrays of texts step-by-step and finally combine all of them into one big message.

It is good to create an index file for the texts feature:

```ts
// packages/telegram-utils/src/texts/index.ts

export * from './combineTexts';
```

Now, we need to set up exporting of the package's functionality. In the `package.json` file, we can use the **exports** field. 

```json
// packages/telegram-utils/package.json

"exports": {
    "./texts": {
        "import": "./src/texts/index.ts",
        "require": "./dist/texts/index.js"
    }
}
```

We don't want to provide an `/src` part when importing the package, so we declared it a custom import with **./texts**. Inside the **./texts** field, we declare that only the index file can import all required functionality. The **import** declares that we use a typescript file for ESModule, and the **require** declares that we use a compiled file for CommonJS.

To identify a monorepo package inside our applications, let's add a prefix for all of them - **@monorepo**. Rename the telegram utils package in the `package.json` file:

```json
// packages/telegram-utils/package.json

"name": "@monorepo/telegram-utils"
```

We need a build script to compile our package for use. Update the **scripts** section in the `package.json`:

```json
// packages/telegram-utils/package.json

"scripts": {
    "build": "tsc -p tsconfig.json"
}
```

Check the full version of the `package.json` for the `@monorepo/telegram-utils`:

```json
// packages/telegram-utils/package.json

{
    "name": "@monorepo/telegram-utils",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
        "build": "tsc -p tsconfig.json"
    },
    "keywords": [],
    "license": "ISC",
    "exports": {
        "./texts": {
            "import": "./src/texts/index.ts",
            "require": "./dist/texts/index.js"
        }
    },
    "devDependencies": {
        "typescript": "^5.7.3"
    },
    "dependencies": {
        "telegraf": "^4.16.3"
    }
}
```

Configure a TypeScript compiler: We enable incremental compilation to save some build time and work only on the changed parts of the package. We also enable a **composite** compilation to use the project with project references. Define a `/src` folder as a **rootDir** and an **outDir** of the package as`/dist`. Check the updated version of the `tsconfig.json`:

```json
// packages/telegram-utils/tsconfig.json

{
    "compilerOptions": {
        // Incremental compilation enabled
        "incremental": true,
        // Composite enabled
        "composite": true,
        
        "target": "es2016",
        
        "module": "commonjs",
        // Source code location
        "rootDir": "./src",
        // Destination folder for a compiled code
        "outDir": "./dist",
        
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        
        "strict": true,
        "skipLibCheck": true
    }
}
```
## Put it all together

Return to `apps/publish-bot`. Add our new **@monorepo/telegram-utils** package to the packages' dependencies. Note that we don't need to specify a package version; instead, we use a **workspace** notation.

```json
// apps/publish-bot/package.json

"dependencies": {
    "@monorepo/telegram-utils": "workspace:*"
}
```

After that, install the dependencies inside the app:

```shell
pnpm install
```

Update the **preview** command of the publication bot. Only two lines require a change - we need an import of our function from the package and a function call:

```ts
// apps/publish-bot/src/commands/preview.ts

import type { InputMediaPhoto, InputMediaVideo } from 'telegraf/types';
// Instead of using Telegraf's formatting utils, import our package
import { combineTexts } from '@monorepo/telegram-utils/texts';

import { groupMessages, getInlineKeyboard } from '../helpers';
import type { Context } from '../types';

const preview = async (ctx: Context) => {
    if (ctx.session.messages.length > 0) {
        const { photos, videos, text } = groupMessages(ctx.session.messages);
        
        // Call a combineTexts function to get a thoroughly combined text message
        const fullText = combineTexts({ photos, videos, text });
        
        if (photos.length || videos.length) {
            const media = [
                ...videos.map<InputMediaVideo>(video => ({
                    type: 'video',
                    media: video.video.file_id,
                    ...video,
                })),
                ...photos.map<InputMediaPhoto>(photo => ({
                    type: 'photo',
                    media: photo.photo[photo.photo.length - 1].file_id,
                    ...photo,
                })),
            ];
            
            if (fullText.text) {
                media[media.length - 1].caption = fullText.text;
                media[media.length - 1].caption_entities = fullText.entities;
            }
            
            return ctx.replyWithMediaGroup(media);
        }
        
        return ctx.reply(fullText, getInlineKeyboard(ctx, { hidePreview: true }));
    }
    
    return ctx.reply('No messages to preview.');
};

export default preview;
```

You will receive a TS error message stating that **@monorepo/telegram-utils/texts** cannot be found. This is because TypeScript does not support custom exports from `package.json` by default. To fix it, update the application's `tsconfig.json` file, add a **moduleResolution**, set it to **nodenext**, and change a **module** to **NodeNext**.

```json
// apps/publish-bot/tsconfig.json

{
    "compilerOptions": {
        "target": "es2016",
        "module": "NodeNext",
        "moduleResolution": "nodenext",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        
        "strict": true,
        "skipLibCheck": true
    }
}
```

To build a source code for the application, we first need to build all our dependencies - **@monorepo/telegram-utils**. You can run manually a **build** command for each of the packages, or PNPM has an option flag `-r` that runs a command recursively:

```shell
pnpm -r build
```
## Conclusion

That's it. Your publication bot uses an internal shared library/package and sits inside a monorepo. It allows us to build new functionality and reuse code for multiple applications quickly.

A publication bot is a small part of the significant service that could be created. It communicates with users via the Telegram interface and accumulates all messages. However, we don't have a backend yet to save incoming messages, moderate them, and notify subscribers. Stay tuned!

Photo by [Gabriel Heinzer](https://unsplash.com/@6heinz3r?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/a-close-up-of-a-computer-screen-with-a-bunch-of-words-on-it-EUzk9BIEq6M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
