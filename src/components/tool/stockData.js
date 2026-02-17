import { z } from "zod";
import { tool } from "ai";
import { fetchStockData } from "../lib/fetchData";

export const getStockData = tool({
  description: "Fetch stock data by symbol",
  name: "getStockData",
  inputSchema: z.object({
    symbol: z.string().describe("The stock symbol to fetch data for"),
  }),
  execute: async ({ symbol }) => {
    const stockData = await fetchStockData(symbol);
    return stockData;
  },
});