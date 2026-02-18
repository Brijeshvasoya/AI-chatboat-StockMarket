import { createMistral } from "@ai-sdk/mistral";
import { Agent } from "./Agent";
import { SYSTEM_PROMPT } from "../constant";
import { getStockData } from "../tool/stockData";
const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });

export const stockAgent = new Agent({
  model: mistral("mistral-large-latest"),
  tools: { getStockData },
  system: SYSTEM_PROMPT,
  maxSteps: 10,
});