import { z } from "zod";
import { tool } from "ai";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export const getStockChart = tool({
  description: `
Fetch stock price history for chart visualization.

IMPORTANT RULES:
- Use this tool when user asks chart, graph, or price history.
- Extract ticker symbol from user message.
- Symbol examples: AAPL, TSLA, INFY.NS, RELIANCE.BO
`,

  parameters: z.object({
    symbol: z.string().min(1, "Symbol required"),
  }),

  execute: async ({ symbol }) => {
    try {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      const result = await yahooFinance.chart(symbol, {
        period1: oneMonthAgo,
        period2: now,
        interval: "1d",
      });

      const quotes = result?.quotes || [];

      const chartData = quotes
        .filter((q) => q?.close)
        .map((q) => ({
          date: new Date(q.date).toISOString().split("T")[0],
          price: q.close,
        }));

      if (!chartData.length) {
        return {
          error: `No chart data found for ${symbol}`,
        };
      }

      return {
        type: "chart",
        symbol,
        data: chartData,
      };
    } catch (err) {
      return {
        error: err.message,
        symbol,
      };
    }
  },
});
