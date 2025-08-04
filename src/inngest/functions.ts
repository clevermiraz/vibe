import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Imagine this is a download step
    await step.sleep("wait-a-moment", "30s");
    return { message: `Hello ${event.data.email}!` };
  }
);
