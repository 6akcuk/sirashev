---
title: "Your own Telegram bot on NodeJS with TypeScript, Telegraf and Fastify (Part 2)"
description: "In my previous article, we configured the project and wrote a simple, workable bot. We want to teach..."
publishedAt: "2025-01-05T21:29:15Z"
readingTime: 8
tags: ["tutorial", "beginners", "typescript", "node"]
sourceUrl: "https://dev.to/sirashev/your-own-telegram-bot-on-nodejs-with-typescript-telegraf-and-fastify-part-2-4db5"
---

In my [previous article](/articles/your-own-telegram-bot-on-nodejs-with-typescript-telegraf-and-fastify-part-1-4f3l/), we configured the project and wrote a simple, workable bot. We want to teach it to react to users' messages and have a memory to interact with the drafts.
## Types

It is time to define some entities representing our bot application. Put it under the source directory and put it into the `types.ts` file.

```ts
// src/types.ts

import { Context as TelegrafContext } from 'telegraf';
import type { Message as TGMessage } from 'telegraf/types';

export type Message = {
    text?: TGMessage.TextMessage;
    photo?: TGMessage.PhotoMessage;
    video?: TGMessage.VideoMessage;
};

export type Session = {
    messages: Message[];
    mediaGroupIds: string[];
};

export type Context = TelegrafContext & {
    session: Session;
};
```

We have the `Message` entity that represents each message from a user before publication. It could be a text message, some photos or videos.

The `Session` entity represents a bot's memory for each chat room, which will help us accumulate drafts of incoming messages for future publication.

`Context` entity extends general `Telegraf` context and adds a session object.
## Memory - Telegraf session

The `Telegraf` package provides a session to keep information between messages in the user's chat. We will use it to add memory for our bot and keep messages with photos and videos until they are published.

Let's create a session store that interfaces with the bot's memory. For now, it will be a simple object collection with chat ID as a key, which we will put into our main file, `src/index.ts`.

First, update the import of the `telegraf` package  with the new `session` middleware function and `SessionStore` type.

```ts
// src/index.ts

import { session, Telegraf, type SessionStore } from 'telegraf';
```

Then, create a `storage` map that will keep messages and a `store` object that implements the `SessionStore` type with our previously defined `Session` as a generic parameter:

```ts
// src/index.ts

import { Session } from './types';

const storage = new Map<string, string>();

const store: SessionStore<Session> = {
    get(key) {
        const value = storage.get(key);

        return value ? JSON.parse(value) : null;
    },

    set(key, value) {
        storage.set(key, JSON.stringify(value));
    },

    delete(key) {
        storage.delete(key);
    },
};
```

It is a synchronous store with three methods: **get**, **set**, and **delete**. You can use everything you need, but we will keep it in the computer's memory for this part.

For the last part, we need a helper function to create our default state of the session - when we initialize our bot and when we need to fresh the data. Create a new directory inside the source folder called `helpers` and add the `getDefaultSession.ts` file:

```ts
// src/helpers/getDefaultSession.ts

import type { Session } from '../types';

export const getDefaultSession = (): Session => {
    return {
        mediaGroupIds: [],
        messages: [],
    };
};
```

We will add more helper functions in the future, so it would be a good practice to add an `index.ts` file and re-export everything you need from the `helpers` directory:

```ts
// src/helpers/index.ts

export * from './getDefaultSession';
```

Return to `src/index.ts` and import the `getDefaultSession` function.

```ts
// src/index.ts

import { getDefaultSession } from './helpers';
```

Use the newly created store with the `session` middleware. Each middleware could be added with a `use` method in the `Telegraf` instance. Add it after instantiating the `bot`.
 
```ts
// src/index.ts
  
const bot = new Telegraf('<BOT_TOKEN>');

bot.use(
    session({
        defaultSession: getDefaultSession,
        store,
    })
);
```
## Commands

Let's define commands for our bot. Each command represents a single functionality of the bot and is located in a separate directory - `/commands`. They are asynchronous functions with the context as an argument. Create a folder first:

```shell
mkdir commands
```
### Cancel command

The cancel command deletes a draft of a user's future message or post, allowing them to clear the current session. 

```ts
// src/commands/cancel.ts

import { getDefaultSession } from '../helpers';
import type { Context } from '../types';

const cancel = async (ctx: Context) => {
    await ctx.reply('Draft has been deleted. You can start over.');
    
    ctx.session = getDefaultSession();
};

export default cancel;
```

We use the `getDefaultSession` function to set the current session to an empty state. We also need to reply to the user with a success message.
### Hi command

We already have a command for incoming users as a welcome message, but let's move it into a separate file for consistency.

```ts
// src/commands/hi.ts

import { fmt } from 'telegraf/format';

import { Context } from '../types';

const hi = async (ctx: Context) => {
    await ctx.reply(fmt`
        Hello! Welcome to Publish Bot. I can help you publish your content to multiple channels at once.
        
    1. Write a message or send a photo/video.
    2. Check the preview of the message.
    3. If everything looks good, publish it to the channels.
`);
};

export default hi;
```

It looks better and has detailed instructions on using the bot to publish messages. One of the best practices for formatting messages is to use an `fmt` formatting function. The function has many helpers, but for now, we only need to write a multiline message.
### Preview command

A preview command allows users to check their messages before publication. Unlike web or mobile applications, this functionality is essential because it cannot be seen in real-time.

Let's start with another helper function called `groupMessages`. This function combines all photos, videos, and text messages into separate groups to help us prepare a preview message on Telegram.

```ts
// src/helpers/groupMessages.ts

import type { Message as TGMessage } from 'telegraf/types';

import type { Message } from '../types';

export const groupMessages = (messages: Message[]) => {
    const photos: TGMessage.PhotoMessage[] = [];
    const videos: TGMessage.VideoMessage[] = [];
    const text: TGMessage.TextMessage[] = [];
    
    for (const message of messages) {
        if (message.photo) {
            photos.push(message.photo);
        }
    
        if (message.video) {
            videos.push(message.video);
        }
    
        if (message.text) {
            text.push(message.text);
        }
    }

    return {
        photos,
        videos,
        text,
    };
};
```

The next helper function is a `canPublish`. We don't need to allow users to publish short or empty messages. Let's say that we need at least 10 characters for publication. 

```ts
// src/helpers/canPublish.ts

import type { Context } from '../types';

const MINIMUM_TEXT_LENGTH = 10;

export const canPublish = (ctx: Context) => {
    const { messages } = ctx.session;
    
    const hasMedia = messages.some(message => message.photo || message.video);
    const hasText = messages.some(message => message.text?.text.length ?? 0 > MINIMUM_TEXT_LENGTH);
    
    return hasMedia || hasText;
};
```

It is always good to have a constant for conditions or configuration values; we can move them to a separate config file or easily update them in the future.

Before going to the command itself, we need the last helper function. Telegram allows us to pass inline buttons for each message so that users can interact with your application.

```ts
// src/helpers/getInlineKeyboard.ts

import { Markup } from 'telegraf';

import { canPublish } from './canPublish';
import type { Context } from '../types';

type Options = {
    hidePreview?: boolean;
};

const PreviewButton = Markup.button.callback('Preview', 'preview');
const PublishButton = Markup.button.callback('Publish', 'publish');
const CancelButton = Markup.button.callback('Cancel', 'cancel');

export const getInlineKeyboard = (ctx: Context, options: Options = {}) => {
    const canPublishNow = canPublish(ctx);
    const { hidePreview } = options;
    
    if (hidePreview) {
        return Markup.inlineKeyboard([
            canPublishNow ? [PublishButton] : [],
            [CancelButton],
        ]);
    }

    return Markup.inlineKeyboard([
        [PreviewButton, CancelButton],
        canPublishNow ? [PublishButton] : [],
    ]);
};
```

We predefine buttons as callback buttons and assign them to individual variables for reusing. The first argument is the title of a button, and the second argument is the name of a callback, which will be defined below. The function has one option to hide the preview button if we don't need it in some scenarios.

Don't forget to update the index file in the helpers folder:

```ts
// src/helpers/index.ts

export * from './getDefaultSession';
export * from './getInlineKeyboard';
export * from './groupMessages';
```

We have everything that we need to implement the preview command.

```ts
// src/commands/preview.ts

import type { InputMediaPhoto, InputMediaVideo } from 'telegraf/types';
import { FmtString, join } from 'telegraf/format';

import { groupMessages, getInlineKeyboard } from '../helpers';
import type { Context } from '../types';

const preview = async (ctx: Context) => {
    if (ctx.session.messages.length > 0) {
        const { photos, videos, text } = groupMessages(ctx.session.messages);
        
        const fullText = join(
            text.map(t => new FmtString(t.text, t.entities)),
            '\n'
        );

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

Let's review the code:
- If we don't have any messages in the session, report to the user that there are no messages to preview;
- We group all messages by type to split the code lately for replying with attachments or with a text message;
- Import `FmtString` class and `join` function to combine all text messages and captions into a single message while keeping all formattings;
- If we have photos or videos, we need to reply with the media group and build an array of media. If there are text messages, add them to the media group caption with entities (describe string formatting);
- Reply with the combined text messages and add an inline keyboard for further actions. Consider that there is a `hidePreview` option because we already looked at the draft's preview.
### Publish command

The central command of our bot. For now, we don't add any functionality to manipulate the draft; it's up to you what you want to do with it. In the next part, we'll see one of the variants.

```ts
// src/commands/publish.ts

import { getDefaultSession, groupMessages } from '../helpers';
import type { Context } from '../types';

const publish = async (ctx: Context) => {
    if (ctx.session.messages.length > 0) {
        const { photos, videos, text } = groupMessages(ctx.session.messages);

        const draft = {
            author: ctx.from,
            photos,
            videos,
            text,
        };

        try {
            // Do something with the draft
            draft;
        } catch (e) {
            console.error(e);
            return ctx.reply('There was an error while trying to publish your messages.');
        }

        ctx.session = getDefaultSession();

        return ctx.reply('Your messages has been published.');
    }

    return ctx.reply('No messages to publish.');
};

export default publish;
```

Inside the command, we prepare our draft object, which contains messages and information about an author from the context. In the `try-catch` section, we need to do something with our prepared draft - save it to a database or send it to a messages queue. Whatever you want to do with it. And, of course, don't forget to clear the session data by calling the `getDefaultSession` function and applying it to the session object.
## Final touches

Create an index file for the commands to import them from one place.

```ts
// src/commands/index.ts

export { default as cancel } from './cancel';
export { default as hi } from './hi';
export { default as preview } from './preview';
export { default as publish } from './publish';
```

Each command could have multiple variations of text or callbacks that users could send to the bot. I recommend using regular expressions to handle all of them. Also, you need to import a `message` filter from Telegraf's filters to handle incoming messages by their type.

```ts
// src/index.ts

import { message } from 'telegraf/filters';
```

It is time to modify the application's main file to apply all the functionality written before.

```ts
// src/index.ts

const hiRegExp = /^(hi|hello)$/i;
const previewRegExp = /^(preview|status)$/i;
const publishRegExp = /^(publish|send)$/i;
const cancelRegExp = /^(cancel|clear|delete)$/i;

const bot = new Telegraf<Context>('<BOT_TOKEN>');

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
```

Please note that we've updated the bot instantiating by adding the `Context` type defined previously.

You can re-build your code and try it on a mobile phone or web version of Telegram. Here is an example of chatting with my bot:

![Chatting with a publish bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4gctyjomthxids4oe87y.jpeg)

In the [last part of the series](/articles/your-own-telegram-bot-on-nodejs-with-typescript-telegraf-and-fastify-part-3-1f59/), we'll make it more production-ready and add `Fastify` and some plugins to keep information between restarts and manage configuration.

Photo by [mariyan rajesh](https://unsplash.com/@mariyan_rajesh?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/a-cell-phone-with-a-smiley-face-on-the-screen-BICGzegcfWs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)


