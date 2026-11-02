---
title: "How do styled-components help us to build responsive pages?"
description: "There are different approaches to style components in React applications. Each of them has its pros..."
publishedAt: "2021-10-24T06:16:37Z"
readingTime: 4
tags: ["webdev", "react", "typescript", "devjournal"]
sourceUrl: "https://dev.to/playtomic/how-do-styled-components-help-us-to-build-responsive-pages-4698"
---

There are different approaches to style components in React applications. Each of them has its pros and cons, and, of course, preference in choosing a particular library is sometimes subjective. It can cause misunderstanding in a team when you're not agreeing with using **styled-components** in your project because you'd already worked with one library before, and it's not prominent and easy to switch to see the benefits of a new approach. Here you have a question: "Why should I use this instead of this?" and we're going to answer it at first.

### Why did we choose styled-components?

One of our team members asked this question because he always used **CSS Modules** and didn't understand why it's useful. Yes, adding classnames to HTML tags or even child components is very clear and understandable which styles we're implementing, but here becomes a mess of many **div** elements. You can use more semantic HTML tags like **section**, **header**, but anyway, it doesn't help so much.

Creating styled components and naming them as what they are for, we think, makes our code much readable and clear. You quickly see the wrapper, overlay, the body or header of our modal, etc. And no bunch of classnames depends on different conditions, only adding custom properties which also tell us what behavior we're covering using styles.

When you're using **CSS Modules** and changing class names by mistake, an error is only perceptible by running the app and looking into it.  Implementing styled-components gives you a compilation error if anyone is trying to use a non-existent element.

Here's a simple example of implementing styled-components:

```tsx
<Wrapper>
	<TitleContainer>
		<Title>Modal dialog</Title>
		<CloseButton highlighted={isCloseButtonHighlighted} />
	</TitleContainer>
	<TabsContainer>
		<Tabs {...} />
	</TabsContainer>
	<Content>
		Our cool modal content
	</Content>
</Wrapper>
```

Everything is clear, and you can take a first look at this modal component and get a whole idea of how it's structured and how it can behave on different property values.  `<CloseButton />` has `highlighted` property, which will add some background and other visual changes. We can easily implement it by defining custom property in the `<CloseButton />` styled component:

```ts
const highlightedButton = css`
	background: ${props => props.theme.colors.softYellow};
	color: ${props => props.theme.colors.primaryText};
`

const CloseButton = styled.button<{ highlighted: boolean }>`
	background: transparent;
	color: ${props => props.theme.colors.secondaryText};
	
	${props => props.highlighted && highlightedButton}
`
```

As you can see here, we defined custom CSS styles via the `css` utility and used predefined theme colors whenever we needed them. Let's go deeper and talk about configuring and structuring component styles.

### How do we cook them?

How should we structure styles and styled components? Putting them in one file with React component is not a good idea because otherwise, it will not follow the principle of single responsibility. 

For each component, we create a separate `*.styles.ts` file, which can contain styled components and re-usable CSS styles or style objects for third-party plugins like `react-select`. 

It can be imported into a component file then all at once like this:

```ts
import * as S from './Component.styles.ts'
```

It gives us two benefits: 
1. Compact way of importing all required styled components and using them with code completion support from IDE;
2. Create a stylable component and individually set style for different devices.

### What is the stylable component?
"What is the stylable component?" In answering this question, we want to say that it's a component with a defined dictionary of all styled components used inside. We can create it with the utility function:

```ts
import React from 'react'
import styled, { isStyledComponent } from 'styled-components'

type StyledChildren = Record<string, React.ComponentType>
type StylableComponentType<P, S extends StyledChildren> = React.ComponentType<P> & { S: S }

function createStylableComponent<S extends StyledChildren, P>(
	styledChildren: S,
	component: ReactComponentType<P>,
): StylableComponentType<P, S> {

	const stylableComponent = 
		(isStyledComponent(component) ? component : styled(component)``) as React.ComponentType<P>

	Object.defineProperty(stylableComponent, 'S', { value: styledChildren })

	return stylableComponent as StylableComponentType<P, S>
}
```

It looks simple but gives us a powerful mechanism to create responsive views, which we use all over the application. It's possible to separate styled components for desktop and mobile versions, having one **stylable** component with business logic and layout.  How to do it properly?

### Responsive styled components
Let's use `<Modal />`  from the previous example and modify it to use our styled components from different styles files and create a **stylable component** from it: 

```tsx
import React from 'react'
import * as S from './Modal.styles.ts'

function Modal(props: ModalProps) {
	// Some logic goes here
	{...}

	return (
		<S.Wrapper>
			<S.TitleContainer>
				<S.Title>Modal dialog</S.Title>
				<S.CloseButton highlighted={isCloseButtonHighlighted} />
			</S.TitleContainer>
			<S.TabsContainer>
				<S.Tabs {...} />
			</S.TabsContainer>
			<S.Content>
				Our cool modal content
			</S.Content>
		</S.Wrapper>
	)
}

const StylableModal = createStylableComponent(S, Modal)

export { StylableModal as Modal }
```

Having the Modal component, we can define `<ResponsiveModal />`, which has two callback functions to render desktop and mobile versions of `<Modal />` and passes these callbacks to another `<ResponsiveLayout />` component which calls given functions depending on window size.

```tsx
function ResponsiveModal(props: ModalProps) {
	const renderDesktop = useCallback(() => <S.DesktopModal {...props} />, [props])
	const renderMobile = useCallback(() => <S.MobileModal {...props} />, [props])
	
	return <ResponsiveLayout renderDesktop={renderDesktop} renderMobile={renderMobile} />
}
```

Same as for typical components, any responsive components also have their styles, mainly importing dependant children (`<Modal />` as an example for `<ResponsiveModal />`). And here comes the magic of the stylable component, which gives the ability to granularly adapt every element for required devices with code completion from IDE.

```ts
import { Modal } from './Modal'

const DesktopModal = styled(Modal)``
const MobileModal = styled(Modal)`
	${Modal.S.Title} {
		font-size: 0.75rem;
	}
`

export { DesktopModal, MobileModal }
```

### Conclusions
To sum up, defining responsive components with the `styled-components` library is straightforward, follows the single responsibility principle, self-evident and clear understanding of what is for looking at folders' and code's structure. Creating components with the **stylable component** function gives advantages: 
- the ability to manipulate layout and elements without importing them from another style's files;
- having a complete list of available elements and styled components.

Photo by [Goran Ivos](https://unsplash.com/@goran_ivos) on [Unsplash](https://unsplash.com/)
