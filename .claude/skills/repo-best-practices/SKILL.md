# Repo best practices

## Component Props

Whenever you are creating props with a component and you want to use attributes like `className`, `id`, etc. on the component, you should extend ths props with its component props ref like this:

```ts
type MyComponentProps = {
  // Your custom props
} & ComponentPropsWithoutRef<"div">;
```
