import { generateText, streamText } from "ai";

export class Agent {
    constructor({ model, tools, maxSteps = 10, system }) {
        this.model = model;
        this.tools = tools;
        this.maxSteps = maxSteps;
        this.system = system;
    }
    async run(messages) {
        const result = await generateText({
            model: this.model,
            tools: this.tools,
            maxSteps: this.maxSteps,
            system: this.system,
            messages: [{ role: "user", content: messages }],
        })
        const toolResults = (result.steps ?? [])
            .flatMap((step) => step.toolResults ?? [])
            .map((r) => r.result ?? r.output)
            .filter(Boolean);
        return { text: result.text, toolResults };
    }

    async stream(messages) {
        const formattedMessages = typeof messages === "string"
            ? [{ role: "user", content: messages }]
            : messages;

        return streamText({
            model: this.model,
            system: this.system,
            messages: formattedMessages,
        });
    }
}