import { createAgent, openai } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const agent = createAgent({
      name: "agent",
      system: "You are an expert teacher. whatever subject or topic user want you will give him.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await agent.run(`give details the following text: ${event.data.value}`);

    return { output };
  }
);
