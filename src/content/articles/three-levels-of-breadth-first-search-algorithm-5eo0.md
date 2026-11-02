---
title: "Three levels of Breadth-First Search algorithm"
description: "Introduction   Big tech companies such as Yandex, Google, Amazon, etc., develop an interview..."
publishedAt: "2025-01-26T10:18:46Z"
readingTime: 6
tags: ["algorithms", "typescript", "webdev", "programming"]
sourceUrl: "https://dev.to/sirashev/three-levels-of-breadth-first-search-algorithm-5eo0"
---

## Introduction

Big tech companies such as Yandex, Google, Amazon, etc., develop an interview process to filter an enormous number of candidates. Therefore, they can't just give them a test task or ask theory questions about their subject. They add an algorithm section with different complex challenges depending on the section: **frontend**, **backend**, or **machine learning**. Yes, the **front** doesn't need to write quantum computations due to the lack of the client's machine performance, and usage of the computer algorithms is less critical. Still, it teaches us to use CPUs and Memory carefully and be able to write supereffective code.
## Challenge

We have a graph with multiple connected points. The graph can be resolved synchronously and asynchronously. You need to answer two questions: Do you have a connection between randomly selected points, and can you build the shortest route to them?

![Graph visualization](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3mantpx8hmswaq9yte4a.png)

```ts
const graph = {};

graph['A'] = ['B', 'C'];
graph['B'] = ['D', 'E'];
graph['C'] = ['D', 'F'];
graph['D'] = ['H', 'I'];
graph['E'] = ['G', 'H'];
graph['F'] = ['I'];
graph['G'] = ['J'];
graph['H'] = [];
graph['I'] = ['K'];
graph['J'] = ['K'];
graph['K'] = [];

// Sync graph resolver
const getGraph = (node) => graph[node];
// Async graph resolver
const getAsyncGraph = (node) => Promise.resolve(graph[node]);

// Paths to check: 
//  from -> to = do we have a connection? | the shortest route
//  A -> K = true | ["A", "C", "F", "I", "K"]
//  A -> H = true | ["A", "C", "D", "H"]
//  B -> A = false | false
```
## Implementation

### Typings

Let's start with a graph's code representation. We already have an initial code, but we need to add types before proceeding. I will add literals with all possible values for this challenge, but we can generally use strings for the graph's node value.

```ts
type GraphNode =
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K';

type Graph = Record<GraphNode, GraphNode[]>;
```

I have an idea to split the **Breadth-First Search** (BFS) into two parts for education: a traveler and a condition checker. This would allow us to choose different "**strategies**" for BFS with one argument change.

What is a strategy? It should be a function with three arguments: the parent node from which we come, the current node, and our goal. The result should be an object with the success flag and the result itself.

```ts
type StrategyResult<R> =
    // If the strategy is unsuccessful, we don't need a result at all
    | { success: false }
    | {
        success: true;
        result: R;
    };

type Strategy<R> = (
    parentNode: GraphNode,
    currentNode: GraphNode,
    to: GraphNode
) => StrategyResult<R>;
```

### Sync BFS

The BFS function works from a starting point to our destination and applies a strategy: a path exists or builds a route. In this case, it requires three arguments.

```ts
function syncBfs<R>(from: GraphNode, to: GraphNode, strategy: Strategy<R>) {
    // Build a traveler's queue
    const queue = [from];
    // We need a set of visited nodes to avoid duplicate runs
    const visited = new Set<GraphNode>();

    // Proceed until the queue is empty
    while (queue.length !== 0) {
        // Take the first element from the queue
        const node = queue.shift();
        // Check that we have a node
        if (!node) continue;
        // Move to the next element in the queue if it's already visited
        if (visited.has(node)) continue;

        // Mark as visited
        visited.add(node);

        // Resolve child nodes from the "data source"
        const childs = getGraph(node);
        
        for (let childNode of childs) {
            // Apply our strategy
            const r = strategy(node, childNode, to);
            // Return the result if the strategy finishes successfully
            if (r.success) return r.result;
            
            // Otherwise, push to the queue and proceed
            queue.push(childNode);
        }
    }

    // Return false on failure
    return false;
}
```

We can't run the code because we don't have a strategy yet. Let's begin with the easiest one - a "path exists" strategy.
### Strategies
#### "Path exists" strategy

In this strategy, we only need to check if a current node is our goal. 

```ts
// Add a strategy type with a boolean as a result
const pathExistsStrategy: Strategy<boolean> = (
    // We don't need a parent node in this strategy, so name it as an underscore
    _: GraphNode,
    currentNode: GraphNode,
    to: GraphNode
) => {
    // Main condition
    const exists = currentNode === to;
    
    if (!exists) {
        return { success: false };
    }
    
    return {
        success: exists,
        result: exists,
    };
};
```

Let's check that our code is working:

```ts
console.log(syncBfs('A', 'K', pathExistsStrategy));
console.log(syncBfs('A', 'H', pathExistsStrategy));
console.log(syncBfs('B', 'A', pathExistsStrategy));

// In the console, we will see:
//   true
//   true
//   false
```

Success! Works perfect. 
#### "Shortest route" strategy

This is the most interesting strategy. To build a route, we need to check the current node and keep all visited and connected nodes. Each run of the BFS function should have a separate storage space. A builder function and closures will help us.

```ts
// We will call this function to build a strategy function for us. The result is an array of all nodes.
const createShortestRouteStrategy = (): Strategy<GraphNode[]> => {
    // Storage for all visited and connected nodes
    const nodeConnections: Record<GraphNode, GraphNode> = {} as Record<GraphNode, GraphNode>;

    // Strategy function itself
    return (parentNode: GraphNode, currentNode: GraphNode, to: GraphNode) => {
        // Save a connection between nodes
        nodeConnections[currentNode] = parentNode;

        // If it's not a destination, report about it
        if (currentNode !== to) {
            return { success: false };
        }

        // If it's a destination, build a route
        const route: GraphNode[] = [];
        let routeNode = currentNode;
        while (routeNode) {
            // Push all visited nodes into an array
            route.push(routeNode);
            
            routeNode = nodeConnections[routeNode] ?? undefined;
        }
        
        return {
            success: true,
            // Reverse the array because it has been built from the end
            result: route.reverse(),
        };
    };
};
```

Time to check how it works:

```ts
// Notice: we call a function because it returns a strategy function
console.log(syncBfs('A', 'K', createShortestRouteStrategy()));
console.log(syncBfs('A', 'H', createShortestRouteStrategy()));
console.log(syncBfs('B', 'A', createShortestRouteStrategy()));

// Console output:
//   (5) ["A", "C", "F", "I", "K"]
//   (4) ["A", "C", "D", "H"]
//   false
```
### Async BFS with async/await

No significant difference exists between sync and async code with **async/await**. You define an async function and await a response from an async "data source".

```ts
// Async function
async function asyncBfs<R>(
    from: GraphNode,
    to: GraphNode,
    strategy: Strategy<R>
) {
    const queue = [from];
    const visited = new Set<GraphNode>();
    
    while (queue.length !== 0) {
        const node = queue.shift();
        
        if (!node) continue;
        if (visited.has(node)) continue;

        // Mark as visited
        visited.add(node);

        // Await a response from the resolver
        const childs = await getAsyncGraph(node);
        
        for (let childNode of childs) {
            const r = strategy(node, childNode, to);
            
            if (r.success) return r.result;
            
            queue.push(childNode);
        }
    }
    
    return false;
}
```

Code to check that it works fine:

```ts
asyncBfs('A', 'K', createShortestRouteStrategy()).then(r => console.log(r));
asyncBfs('A', 'H', createShortestRouteStrategy()).then(r => console.log(r));
asyncBfs('B', 'A', createShortestRouteStrategy()).then(r => console.log(r));

// Console output
//   (4) ["A", "C", "D", "H"]
//   (5) ["A", "C", "F", "I", "K"]
//   false
```

Notice that the console output sequence is different from the sync function. A search is being executed in the microtasks queue now, and it depends on the network latency (we don't have it here) and the distance between nodes. It requires one additional tick to handle the route calculation for **A->K**. 
### Async BFS with promises

A promise-based BFS function requires a revision of working with the node queue and awaiting execution completion. How do we know that all promises are fulfilled? We can use a counter to keep a total number of queued promises. Another problem is the traveler loop - it works synchronously. It will finish execution after the first node. It will require us to use a "**runner**" function that re-runs the traveler loop the first time and after every promise is resolved.

```ts
function promisedBfs<R>(from: GraphNode, to: GraphNode, strategy: Strategy<R>) {
    // We need to return a promise first
    return new Promise((resolve, reject) => {
        // Queued promises counter
        let queuedPromises = 0;
        const queue = [from];
        const visited = new Set<GraphNode>();

        // Runner
        const run = () => {
            // All promises are resolved, the queue is empty; finish our function with an empty result
            if (queue.length === 0 && queuedPromises === 0) {
                resolve(false);
                return;
            }
            
            while (queue.length !== 0) {
                const node = queue.shift();
                
                if (!node) continue;
                if (visited.has(node)) {
                    // Re-run to check that nothing is left
                    run();
                    continue;
                }

                visited.add(node);
                // Increment the counter
                // For each node, there will be a promise to resolve the graph
                queuedPromises += 1;
                
                getAsyncGraph(node).then(childs => {
                    // Decrement the counter because the promise has been resolved
                    queuedPromises -= 1;
                    
                    for (let childNode of childs) {
                        const r = strategy(node, childNode, to);
                        
                        if (r.success) {
                            resolve(r.result);
                            return;
                        }
                        
                        queue.push(childNode);
                    }

                    // Re-run the loop
                    run();
                });
            }
        };

        // Run the loop the first time
        run();
    });
}
```

Check the promise-based BFS function with test cases:

```ts
promisedBfs('A', 'K', createShortestRouteStrategy()).then(r => console.log(r));
promisedBfs('A', 'H', createShortestRouteStrategy()).then(r => console.log(r));
promisedBfs('B', 'A', createShortestRouteStrategy()).then(r => console.log(r));

// Console output:
//   (4) ["A", "C", "D", "H"]
//   (5) ["A", "C", "F", "I", "K"]
//   false
```

It works the same as an async BFS function with async/await. Nice!
## Conclusion

As you can see, you can solve the challenge in multiple ways. Each solution provides bonus points and shows how deeply you can understand the algorithm and the language. Check the complete source code at https://github.com/6akcuk/BFS. Feel free to ask questions or comments. Thank you!

Photo by [AltumCode](https://unsplash.com/@altumcode?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/opened-black-laptop-computer-oZ61KFUQsus?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
