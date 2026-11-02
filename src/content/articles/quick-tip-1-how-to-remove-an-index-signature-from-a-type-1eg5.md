---
title: "Quick tip 1 - How to remove an index signature from a type?"
description: "Prehistory   During my work as a React developer, I found a situation when you need to..."
publishedAt: "2022-10-02T12:26:19Z"
readingTime: 1
tags: ["typescript", "webdev", "devjournal", "tutorial"]
sourceUrl: "https://dev.to/sirashev/quick-tip-1-how-to-remove-an-index-signature-from-a-type-1eg5"
---

## Prehistory

During my work as a React developer, I found a situation when you need to remove an index signature from a type. 
A simple example, the type utility `Omit` doesn't work properly when a type has an index signature. I've worked with the `react-select` js library and I'd wanted to get all base attributes of a `SelectProps` using `Omit<SelectProps>`, but received an `any` type. Trying to solve the problem, I located a problem inside `SelectProps` - it extends from a `SelectComponentsProps` which is a mapped type. 

## Solution

The solution is to remove the index signature. How to do it? In TypeScript 4.1 and onwards, you can re-map keys in mapped types with an `as` clause. We can create a utility type with generic and it will remove all index signatures in a specified type:

```ts
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K]
}
```

## What does it do? 

It iterates through the keys of a type and checks, if a type of the key is `string`, `number`, or `symbol`, then removes it, otherwise keeps it in the type. In the end, you'll get a clean type without any index signature in it.

## Example

```ts
type Base = { [key: string]: boolean }

type User = Base & {
  email: string
  name?: string
}

type Cleaned = RemoveIndexSignature<User>

type Cleaned = {
  email: string
  name?: string
}
```

Photo by [Alex Kotliarskyi](https://unsplash.com/@frantic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/programming-tips?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
