import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, openai } from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-final-1459");

      return sandbox.sandboxId;
    });

    const agent = createAgent({
      name: "agent",
      system: "You are an expert teacher. whatever subject or topic user want you will give him.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await agent.run(`give details the following text: ${event.data.value}`);

    const sandboxUrl = await step.run("get-sendbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);

      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    return { output, sandboxUrl };
  }
);
