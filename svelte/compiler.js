import { compile } from "svelte/compiler";

// uses svelte compiler to convert svelte code to javascript
export default function transform(source) {
  const { js } = compile(source, {});
  console.log(js.code);
}

transform("<p>hello world</p>");
