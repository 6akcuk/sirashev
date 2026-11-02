---
title: "Your own Telegram bot on NodeJS with TypeScript, Telegraf and Fastify (Part 3)"
description: "The final chapter of the series covers an advanced example of a Telegram bot using Fastify as a..."
publishedAt: "2025-01-10T21:32:38Z"
readingTime: 7
tags: ["typescript", "node", "tutorial", "webdev"]
sourceUrl: "https://dev.to/sirashev/your-own-telegram-bot-on-nodejs-with-typescript-telegraf-and-fastify-part-3-1f59"
---

The final chapter of the series covers an advanced example of a Telegram bot using Fastify as a server to listen to incoming requests. It also provides additional plugins and middleware capability. Please check the previous parts before proceeding if you haven't seen them.
## Fastify

Express is the gold standard for a web framework in NodeJS. It has extensive online documentation and examples and a large community of developers. But why Fastify? 

I chose it because it is lightweight, highly performant, and TypeScript-ready. It allows for writing async middleware, but Express v5 now supports promises, so this is no longer a massive benefit of Fastify. As I said, there are many examples and articles for Express but fewer for Fastify, so I added more information about using Fastify to create a Telegram bot.

Let's start by installing Fastify and additional plugins:

```shell
pnpm add fastify fastify-plugin pino-pretty @fastify/env @fastify/redis
```

We need to update the application's structure. The best practice for extending the Fastify application is using plugins, which should be used for each independent part. For these needs, create a new directory inside `/src` called `parts`

```shell
mkdir parts
```
### Configuration

We directly added a bot token to our code, which is a mistake, mainly if you use a version control system (VCS) like Git. Instead, move it to a configuration file and connect it to our application.

In NodeJS applications, you can pass data through environment variables like `process.env.BOT_TOKEN`. To do that, we can export a value to an environment variable:

```shell
export BOT_TOKEN=<BOT_TOKEN> pnpm dev
```

It's okay to debug, test, or run an application in development mode to test your idea, but it's not practical. It is better to keep it in a configuration file and automatically pass it to your application when running.

We can create an environment configuration file `.env`. To use it in your application, you need a `dotenv` package. We use Fastify, and `@fastify/env` plugin is what we need. In VCS (like Git), the `.env` file is ignored, and all your sensitive information is safe. Add a .env.example file with examples of variables and default values with non-sensitive data to notice available configuration variables in your application. Do not forget to add the `.env` file with a bot token.

```env
// .env.example

PORT=3000
BOT_TOKEN=
REDIS_URL=127.0.0.1:6379
```

After the configuration file, we can add a configuration part of the application.

```ts
// src/parts/config.ts

import fastifyEnv from '@fastify/env';
import type { FastifyInstance } from 'fastify';

const schema = {
    type: 'object',
    required: ['BOT_TOKEN', 'REDIS_URL'],
    properties: {
        PORT: {
            type: 'number',
            default: 3000,
        },
        BOT_TOKEN: {
            type: 'string',
            default: '',
        },
        REDIS_URL: {
            type: 'string',
            default: '127.0.0.1:6379',
        },
    },
};

const options = {
    schema,
    dotenv: true,
};

type BuildSchema<
    T extends {
        properties: { [key: string]: { type: string; default: unknown } };
    }
> = {
    [K in keyof T['properties']]: T['properties'][K]['default'];
};

export type Schema = BuildSchema<typeof schema>;

async function init(fastify: FastifyInstance) {
    fastify.log.debug('Registering config..');
    
    await fastify.register(fastifyEnv, options);
    
    fastify.log.debug(fastify.config, 'Registered with config');
    
    return fastify;
}

declare module 'fastify' {
    interface FastifyInstance {
        config: Schema;
        getEnvs(): Schema;
    }
}

export default init;
```

Notes about the code above:
- We define a schema of our configuration to tell the plugin about the required variables and their type and default values;
- We define options for the `@fastify/env` plugin with schema and the `dotenv` property to notice that we use environment files for our configuration;
- The `BuildSchema` utility type creates a schema type from the schema object. It uses a default value to assign a type for a value;
- Our `init` function takes a `fastify` instance as an argument, registers a new plugin with predefined options, and returns the `fastify` instance;
- We extend the `fastify` module with a `getEnvs` method and a `config` property. Both return our schema so we can use it everywhere in our application with the proper typings.

### Redis

We use a key-value store for our session and the bot's memory. It is another part of the application that keeps all user data in computer memory so that the bot's restarts don't erase the saved drafts.

```ts
// src/parts/redis.ts

import { type FastifyInstance } from 'fastify';
import redis from '@fastify/redis';

async function init(fastify: FastifyInstance) {
    const { REDIS_URL } = fastify.config;
    
    fastify.log.debug('Registering redis..');
    
    await fastify.register(redis, {
        url: REDIS_URL,
    });
    
    fastify.log.debug(`Redis connected to ${REDIS_URL}`);
    
    return fastify;
}

export default init;
```

The configuration provides a Redis URL, which we use to register the `@fastify/redis` plugin with the data. Logs help us debug the part's running steps.
### Telegraf bot

Yes, the Telegraf bot is also another part of the application. We need to create a `fastify` plugin from the code written before.

```ts
// src/parts/bot.ts

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { session, Telegraf, type SessionStore } from 'telegraf';
import { message } from 'telegraf/filters';

import type { Context, Session } from '../types';
import { cancel, hi, publish, preview } from '../commands';
import { getDefaultSession } from '../helpers';

async function init(fastify: FastifyInstance) {
    const { BOT_TOKEN } = fastify.config;
    
    const store: SessionStore<Session> = {
        async get(key) {
            const value = await fastify.redis.get(key);
            
            return value ? JSON.parse(value) : null;
        },
        
        async set(key, value) {
            await fastify.redis.set(key, JSON.stringify(value));
        },
        
        async delete(key) {
            await fastify.redis.del(key);
        },
    };

    await fastify.register(
        fp<{ token: string; store: typeof store }>(
            async (fastify, opts) => {
                fastify.log.debug('Registering bot..');
                
                const hiRegExp = /^(hi|hello)$/i;
                const previewRegExp = /^(preview|status)$/i;
                const publishRegExp = /^(publish|send)$/i;
                const cancelRegExp = /^(cancel|clear|delete)$/i;
                
                const bot = new Telegraf<Context>(opts.token);
                
                bot.use(
                    session({
                        defaultSession: getDefaultSession,
                        store,
                    })
                );
                
                bot.start(hi);
                
                bot.hears(hiRegExp, hi);
                bot.command(hiRegExp, hi);
                bot.action(hiRegExp, hi);
                
                bot.hears(previewRegExp, preview);
                bot.command(previewRegExp, preview);
                bot.action(previewRegExp, async ctx => {
                    await ctx.answerCbQuery();
                    await preview(ctx);
                });
                
                bot.hears(cancelRegExp, cancel);
                bot.command(cancelRegExp, cancel);
                bot.action(cancelRegExp, async ctx => {
                    await ctx.answerCbQuery();
                    await cancel(ctx);
                });
                
                bot.hears(publishRegExp, publish);
                bot.command(publishRegExp, publish);
                bot.action(publishRegExp, async ctx => {
                    await ctx.answerCbQuery();
                    await publish(ctx);
                });
                
                bot.on(message('text'), async ctx => {
                    ctx.session.messages.push({ text: ctx.message });
                });
                
                bot.on(message('photo'), async ctx => {
                    ctx.session.messages.push({ photo: ctx.message });
                });
                
                bot.on(message('video'), async ctx => {
                    ctx.session.messages.push({ video: ctx.message });
                });
                
                bot.launch(() => console.log('Bot is running..'));
                
                fastify.decorate('bot', bot);
            },
            {
                name: 'publish-bot',
            }
        ),
        {
            token: BOT_TOKEN,
            store,
        }
    );
    
    return fastify;
}

declare module 'fastify' {
    interface FastifyInstance {
        bot: Telegraf<Context>;
    }
}

export default init;
```

It is almost the same bot, but there are a few differences. First, we change the store and switch to Redis instead of our map variable. The store has the same interface but is asynchronous and works with the `@fastify/redis` plugin.

```ts
// src/parts/bot.ts

const store: SessionStore<Session> = {
    async get(key) {
        const value = await fastify.redis.get(key);
        
        return value ? JSON.parse(value) : null;
    },
    
    async set(key, value) {
        await fastify.redis.set(key, JSON.stringify(value));
    },
    
    async delete(key) {
        await fastify.redis.del(key);
    },
};
```

The `fp` function defines a Fastify plugin. For our bot, we need two options - it's a token and the store we've created before. The function takes two arguments - a plugin handler and options. For consistency with other plugins, we decorate the `fastify` instance and add a new property `bot` with our bot instance. At the end of the file, we extend the `fastify` module with the property for proper typings.
## Application

Let's combine all the new parts and run the Fastify application. First, we need an index file for the parts.

```ts
// src/parts/index.ts

export { default as bot } from './bot';
export { default as config } from './config';
export { default as redis } from './redis';
```

Then, we need a helper function to combine parts. As we have a dependency between our parts - we need a configuration for Redis, and the bot requires configuration and Redis itself; let's initialize them in an asynchronous pipeline each after.

```ts
// src/helpers/asyncPipe.ts

export const asyncPipe =
    <T>(...fns: Array<(arg: T) => Promise<T>>) =>
    async (arg: T) => {
        for (const fn of fns) {
            arg = await fn(arg);
        }
    };
```

It receives multiple functions as arguments and executes them in a returnable anonymous function with the passed argument. It mutates the argument on each iteration. Update a `helpers` index file:

```ts
// src/helpers/index.ts

export * from './asyncPipe';
```

It is time to update the main file. We want to initialize, configure, and run Fastify.

```ts
// src/index.ts

import Fastify from 'fastify';

import { asyncPipe } from './helpers';
import { bot, config, redis } from './parts';

const fastify = Fastify({
    logger: {
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
            },
        },
    },
});

const start = async () => {
    try {
        await asyncPipe(config, redis, bot)(fastify);
        const { PORT } = fastify.config;
        
        await fastify.listen({ port: PORT });
        
        // Enable graceful stop
        process.once('SIGINT', () => {
            fastify.close();
            fastify.bot.stop('SIGINT');
        });
        
        process.once('SIGTERM', () => {
            fastify.close();
            fastify.bot.stop('SIGTERM');
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
```

As you can see, the main file has been completely changed. Let's take a look:
- We initialize the Fastify with a configuration for a logger. It uses `pino` under the hood, so it has some interesting options - colorize the logs output and decrease the level of messages to debug;
- `asyncPipe` helps to register all the parts of our application in the correct order;
- We register process listeners to shut down the application and the bot gracefully.

## Docker and Docker Compose

One last thing: We can't run the application. We need Redis on our computer. If you already have it, just run it on port 6379. Otherwise, let's use Docker. Please download it from [here](https://www.docker.com/).

Create a `docker-compose.yaml` file in the root of the bot's directory. This file contains the configuration for all the application's services. To check the session, we need only Redis and Redis UI.

```yaml
// docker-compose.yaml

version: '3.8'

services:
    redis:
        image: redis:latest
        ports:
            - '6379:6379'
        networks:
            - app-network

    redis-ui:
        image: rediscommander/redis-commander:latest
        environment:
            - REDIS_HOSTS=local:redis:6379
        ports:
            - '8081:8081'
        depends_on:
            - redis
        networks:
            - app-network

networks:
    app-network:
```

Now, run the command to run all required services in the application's root directory:

```shell
docker-compose up -d
```

After creating the containers, the bot is ready to run. Check that everything works fine. Send a simple message, preview a draft, and visit `http://localhost:8081` to check all sessions of the bot. It is a Redis UI that allows users to view Redis's current state. Here is an example of the saved draft

![Redis UI session store](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s79bwgpu4ves5l5zoe8d.png)

## Conclusion

In this series, I've covered the popular topic of Telegram's bot. I started with the basics and increased the complexity of the code in each article. Of course, there are many things that I haven't covered, but I hope it helped you understand developing bots and will be a good starting point for future applications. See you soon!

The source code is available on my GitHub - https://github.com/6akcuk/PublishBot

Photo by [Rubaitul Azad](https://unsplash.com/@rubaitulazad?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/a-blue-and-white-square-button-with-a-paper-airplane-on-it-u4F54GIZWGI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
