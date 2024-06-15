# webscraper-agent

Currently the agent can answer simple questions pretty reliably. It can give an honest try at mutli-step questions but I'm finding
at least with GPT 3.5 turbo that it does not effectively extract data. Perhaps there is some more massaging I can do but I could try
experimenting with more models down the road.

I'm going to fiddle around with it a little more and see if I can get it to reliably answer questions with more dependent parts.

Things like "When is the release date for season 2 of the lastest show in the Game of thrones Universe".

Once I'm satisfied with that, I may try to implement a new tool, like a calculator.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


## Example 

```bash
What is your question: What is the capital of France?
According to my research, Paris is the capital and largest city of France [1].

Sources
[1] - https://en.wikipedia.org/wiki/Paris
```