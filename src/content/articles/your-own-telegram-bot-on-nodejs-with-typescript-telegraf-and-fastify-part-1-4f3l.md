---
title: "Your own Telegram bot on NodeJS with TypeScript, Telegraf and Fastify (Part 1)"
description: "There are a lot of articles about creating your own Telegram bot. Many courses and boot camps use the..."
publishedAt: "2025-01-03T18:18:30Z"
readingTime: 4
tags: ["node", "beginners", "tutorial", "typescript"]
sourceUrl: "https://dev.to/sirashev/your-own-telegram-bot-on-nodejs-with-typescript-telegraf-and-fastify-part-1-4f3l"
---

There are a lot of articles about creating your own Telegram bot. Many courses and boot camps use the "Telegram bot" idea as one of the entry points on your way to the top of the IT carrier. 

"Spend a few hours, do this and this, and you have the very-super-smart bot that you can sell for billions..." - says nobody.

Telegram bots are critical nowadays and are another way of interfacing with your applications. In Yandex, for example, they help you control the quality of your deployment, communicate quickly with related teams, and coordinate incidents. 

My idea is to create a bot that publishes news from people and to write about it step by step in this series of articles. So, let's go!

#### Project initialization

I will use `pnpm` as a package manager for the project. If you don't have it or don't know how to install it on your device, please check the official site for required information - https://pnpm.io/installation

Let's create a new folder (Mac OS/Linux commands)

```shell
mkdir PublishBot && cd PublishBot
```

To use packages as dependencies, we need to init pnpm locally. This will create a basic package.json, for which we'll add essential scripts to build and launch our bot correctly. 

```shell
pnpm init
```

Typescript is a must; to add it, let's install it locally. And initialize then

```shell
pnpm add -D @types/node typescript && pnpm tsc --init
```

The file structure is simple: `/src` directory is for source code, and `/dist` is for compiled scripts. To enable `/dist` directory compilation, uncomment the `outDir` line in `tsconfig.json` in the `compilerOptions` section. Full version of tsconfig.json:

```json
{
    "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        
        "strict": true,
        "skipLibCheck": true
    }
}
```

Before proceeding to the package.json file and creating scripts to build and launch our bot, we should install additional dev packages - `concurrently` and `nodemon`. Why do we need them? `Concurrently` will allow us to run multiple commands in one script. `Nodemon` will automatically monitor the files and re-run the application if they change.

```shell
pnpm add -D concurrently nodemon
```

We need four scripts to build and run our NodeJS application:
* `build` - it will compile our source Typescript code into Javascript code;
* `build:watch` - same as build, but it will watch for file changes and re-build the application;
* `start`- it will start the server from the distributive folder with `nodemon` ;
* `dev`-  it will help us in the development process by simply watching for code changes, rebuilding the application, and re-running it.

Here is the fragment of the `package.json` scripts section

```json
"scripts": {
    "build": "tsc -p tsconfig.json",
    "build:watch": "tsc -w -p tsconfig.json",
    "start": "nodemon dist/index.js",
    "dev": "concurrently \"pnpm build:watch\" \"pnpm start\""
}
```

In the `dev` command, `concurrently` helps us run two scripts simultaneously - we're re-building our source code and re-running the application on every saved change.

#### Telegra​​~~m~~​f bot

BotFather creates all bots in Telegram - you need to write [@BotFather](t.me/BotFather) in your Telegram application and create a new bot with the command `/newbot`. Then, you choose a name for it, for example, `My Publish Bot`. Finally, you should select a unique username with a `bot` at the end of the name.

![BotFather - new bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/to0mi63eng9hgi9l0dmx.jpeg)

Finally, [@BotFather](t.me/BotFather) will send you a token to access the HTTP API to control your bot. You don't need to manually write all requests to Telegram Bot API because there is a NodeJS library called `telegraf`. Install it via console command:

```shell
pnpm add telegraf
```

Now, we can start programming our publish bot. Let's create an `index.ts` file in the `src` directory:

```shell
mkdir src && touch src/index.ts
```

First, we need a Telegraf class instance with a bot token passed into a constructor. Let's import the class from the `telegraf` package.

```ts
import { Telegraf } from 'telegraf';
```

To use it, define a variable of the instance. Use a bot token that you received from the [@BotFather](t.me/BotFather):

```ts
const bot = new Telegraf(<BOT_TOKEN>)
```

Each bot should have a start/introduction screen. It's a common pattern, and the `/start` command can call it. To add it to your bot, the `bot` instance has a start method. It receives the callback function with a context variable, which has a lot of methods to simplify replying and getting the message from a user:

```ts
bot.start(ctx => ctx.reply('Welcome to Publish Bot!'));
```

And finally, to launch your bot, call a `launch` method with a callback. It is a good practice to log into the console with a message that your bot is running.

```ts
bot.launch(() => console.log('Bot is running'));
```

Here is the final version of the `index.ts` file:

```ts
import { Telegraf } from 'telegraf';

const bot = new Telegraf('<BOT_TOKEN>');

bot.start(ctx => ctx.reply('Welcome to Publish Bot!'));

bot.launch(() => console.log('Bot is running..'));
```

To test your bot, write in the console a command to run `dev` script from the package.json (don't forget to add your bot token):

```bash
pnpm dev
```

You should see a "Bot is running.." message at the end of the console's window. Everything is correct, and you can go to your Telegram application and write a `/start` command to your bot. You can find the chat with it in the "Search" field or go back to [@BotFather](t.me/BotFather) and click on the link in the confirm message with your bot name.

If it is okay, you should have seen the "Welcome to Publish bot!" message in your chat with your bot. And that's it. You have a silly bot with a start screen, which is not what we wanted in these articles. To react appropriately, we must support our users' commands, actions, and text patterns and have a memory to work with users' drafts. These will be in the next part of the articles. See you soon!

Photo by [Lana Codes](https://unsplash.com/@lanacodes?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/a-close-up-of-a-cell-phone-on-a-table-q7SrZ7SQg0w?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
