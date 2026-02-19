import { ToolLoopAgent } from 'ai';
import { createMistral } from "@ai-sdk/mistral";
import { getStockData } from "../tool/stockData";
import { SYSTEM_PROMPT } from '../Prompt/SystemPrompt';
const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });

export const stockAgent = new ToolLoopAgent({
  model: mistral("mistral-large-latest"),
  instructions: SYSTEM_PROMPT,
  tools: { getStockData },
  maxSteps: 10,
});