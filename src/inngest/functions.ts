import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, createTool, openai } from "@inngest/agent-kit";
import z from "zod";
import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-final-15");

      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      system:
        "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React snippets.",
      model: openai({ model: "gpt-4o" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Command failed: ${error} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
        }),
      ],
    });

    const { output } = await codeAgent.run(`give details the following text: ${event.data.value}`);

    const sandboxUrl = await step.run("get-sendbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);

      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    return { output, sandboxUrl };
  }
);
