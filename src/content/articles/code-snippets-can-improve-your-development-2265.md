---
title: "Code snippets can improve your development"
description: "As a developer, I hate making repetitive things. I’m working as a React developer and creating of all..."
publishedAt: "2022-07-20T08:40:30Z"
readingTime: 2
tags: ["typescript", "react", "vscode", "devjournal"]
sourceUrl: "https://dev.to/sirashev/code-snippets-can-improve-your-development-2265"
---

As a developer, I hate making repetitive things. I’m working as a React developer and creating of all the functional components, hooks and styles again and again annoys me.

Most of the IDE and Code Editors support code snippets which help us create templates. I use the VS Code Editor and for each of a project that I’m working on, I’m trying to add code snippets.

### Functional component

Let’s start with a simple example of a creating functional component:

```ts
import React from ‘react’
import * as S from ‘./${TM_FILENAME_BASE}.styles’

interface ${TM_FILENAME_BASE}Props {

}

function ${TM_FILENAME_BASE}(props: ${TM_FILENAME_BASE}Props) {

}

export { ${TM_FILENAME_BASE} }
export type { ${TM_FILENAME_BASE}Props }
```

I use a variable `${TM_FILENAME_BASE}` which represents a filename without its extension. Usually, filename and the name of a component are the same, so it will automatically fill all variables with a component’s name.

### Responsive component

I enjoy styling components with `styled-components`. You can check an article about it [here on Dev.to](https://dev.to/playtomic/how-do-styled-components-help-us-to-build-responsive-pages-4698) As you can see in the example below, a code snippet contains everything we need to create a responsive component.

```ts
import React, { useCallback } from ‘react’
import { ${TM_FILENAME_BASE}Props } from ‘./${TM_FILENAME_BASE}’
import * as S from ‘./Responsive${TM_FILENAME_BASE}.styles’

type Responsive${TM_FILENAME_BASE}Props = ${TM_FILENAME_BASE}Props

function Responsive${TM_FILENAME_BASE}(props: Responsive${TM_FILENAME_BASE}Props) {
  const renderDesktop = useCallback(() => <S.Desktop${TM_FILENAME_BASE} {...props} />, [props])
  const renderMobile = useCallback(() => <S.Mobile${TM_FILENAME_BASE} {...props} />, [props])

  return <ResponsiveLayout renderDesktop={renderDesktop} renderMobile={renderMobile} />
}

export { Responsive${TM_FILENAME_BASE} as ${TM_FILENAME_BASE} }
export type { Responsive${TM_FILENAME_BASE}Props }
```

### Responsive component styles

A code snippet with styles for a responsive component is trickier. The major problem is a regex syntax. We need to remove a conditional `responsive` word from the filename and the `.styles` part. By passing the `/(Responsive|)(.*)\\..+$/$2/` we take only a name of a functional component and remove other parts.

```ts
import styled from ‘styled-components’
import { ${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/} } from ‘./${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/}’

const Desktop${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/} = styled(${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/})``
const Mobile${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/} = styled(${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/})``

export { Desktop${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/}, Mobile${TM_FILENAME_BASE/(Responsive|)(.*)\\..+$/$2/} }
```

### Redux standard action

Here’s an example of a code snippet for a standard redux action. Interesting part is in the naming of a payload interface: if a component name starts with a capital letter, a redux action name shouldn't. To properly name the interface, we need to transform the filename using `upcase` word: `/([A-z]{1})/${1:/upcase}/` select the first letter and transform to upper case.

```ts
import { createStandardAction } from ‘typesafe-actions’

interface ${TM_FILENAME_BASE/([A-z]{1})/${1:/upcase}/}Payload {

}

const ${TM_FILENAME_BASE}Action = createStandardAction(‘$0${TM_FILENAME_BASE}’)<
  ${TM_FILENAME_BASE/([A-z]{1})/${1:/upcase}/}Payload
>()

export { ${TM_FILENAME_BASE}Action }
export type { ${TM_FILENAME_BASE/([A-z]{1})/${1:/upcase}/}Payload }
```

### Conclusions

As you can see, code snippets are the powerful things and they can improve and increase your development speed. If you have a repeating code structure or you need to create a lot of similar files, please look at the code snippets.

Photo by [Adi Goldstein](https://unsplash.com/@adigold1?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/code-snippet?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
