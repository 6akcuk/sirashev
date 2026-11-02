---
title: "Secrets of numbers in JS"
description: "Rounding errors   Interesting things could happen in Javascript if you don't know how it's..."
publishedAt: "2022-10-08T10:54:01Z"
readingTime: 2
tags: ["tutorial", "javascript", "beginners", "programming"]
sourceUrl: "https://dev.to/sirashev/secrets-of-numbers-in-js-1bga"
---

## Rounding errors

Interesting things could happen in Javascript if you don't know how it's working under the hood. For example, floating-point numbers cause some rounding errors. 0.1 and 0.2 cannot be represented precisely. Hence, 0.1 + 0.2 === 0.3 yields false. 

So, why it's happening? Javascript uses 32-bit floating-point number system. Representing many decimals in binary requires an infinite number of digits. Trying to calculate 0.1 (1/10) results in an indefinite number of decimal points. The result of `0.1 + 0.2` is `0.30000000000000004` which doesn't equal `0.3`.

## Number.EPSILON

`Number.EPSILON` returns the smallest interval between two representable numbers. This is useful for the problem with floating-point approximation.

```ts
function numberEquals(x: number, y: number) {
	return Math.abs(x - y) < Number.EPSILON;
}

numberEquals(0.1 + 0.2, 0.3); // true
```

The difference between `0.1 + 0.2` and `0.3` will be smaller than `Number.EPSILON`.

## Double dots

Numbers can be transformed into strings with a fixed number of decimal points. If you'll call `toFixed()` function directly on an integer, you'll need to use double dots notation like this: `5..toFixed(1) === '5.0'`. Why should you do it? Simply because the first dot notation is for representing floating-point numbers: `0.77.toFixed(1) === '0.7'`
You can use `toFixed()` function in the previous example to match equality `(0.1 + 0.2).toFixed(1) === 0.3.toFixed(1)`

Quick note: Primitives in Javascript aren't objects, but why can you use `"string".length`, `0.77.toFixed(1)`? Well, Javascript creates a special wrapper object with a value for the primitive when you call a method and deletes it then after execution.

## Minimums, maximums

`Number` contains interesting constants which represent maximum and minimum integers and floating-point numbers. Javascript has `Infinity` and `-Infinity`, but they aren't real numbers.

`Number.MAX_SAFE_INTEGER` returns the largest integer. It's equal to `9007199254740991` And this expression is true:

```
Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2; // true
```

`Number.MAX_VALUE` returns the largest floating-point number. It's equal to `1.7976931348623157e+308`. Same expression for it:

```
Number.MAX_VALUE + 1.111 === Number.MAX_VALUE + 2.022; // true
```

Minimums are represented by `Number.MIN_VALUE` as the smallest floating-point number which is equal to `5e-324` and `Number.MIN_SAFE_INTEGER` which is equal to `-9007199254740991`.
`Number.MIN_VALUE` is also the closest floating point to zero. 
```
Number.MIN_VALUE - 1 === -1; // true
```
Why is it true? Because this expression is similar to `0 - 1 === -1`

## Summary

Let's summarize the size of the Javascript numbers:
```
-Infinity < Number.MIN_SAFE_INTEGER < Number.MIN_VALUE < 0 < Number.MAX_SAFE_INTEGER < Number.MAX_VALUE < Infinity
```

When you're working with floating-point numbers, you should be careful and take into account rounding errors, because some numbers cannot be represented precisely. You can use third-party libraries or check differences between numbers with `Number.EPSILON`.

Photo by [Volkan Olmez](https://unsplash.com/@volkanolmez?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/numbers-computers?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
  
