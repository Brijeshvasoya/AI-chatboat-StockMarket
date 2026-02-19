import { z } from "zod";
import { tool } from "ai";
import { fetchStockData } from "../lib/fetchData";
import { StockDataToolPrompt } from "../Prompt/StockDataToolPrompt";

export const getStockData = tool({
  description: StockDataToolPrompt,
  parameters: z.object({
    symbol: z
      .string()
      .min(1, "Symbol is required — never call with empty args")
      .describe("Ticker symbol e.g. INFY.BO, RELIANCE.NS, AAPL"),
  }),
  execute: async ({ symbol }) => {
    if (!symbol || symbol.trim() === "") {
      return { error: "Symbol is required. Call again with {\"symbol\": \"TICKER.BO\"}" };
    }

    try {
      const stockData = await fetchStockData(symbol.trim().toUpperCase());
      return stockData;
    } catch (err) {
      return { error: err.message, symbol };
    }
  },
});