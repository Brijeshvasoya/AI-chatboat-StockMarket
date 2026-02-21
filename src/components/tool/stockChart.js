import { z } from "zod";
import { tool } from "ai";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

export const getStockChart = tool({
  description: "Fetch stock price history for chart visualization",

  parameters: z.object({
    symbol: z.string().min(1, "Symbol required"),
  }),

  execute: async ({ symbol }) => {
    try {
      let logo = null;
      try {
        const summary = await yahooFinance.quoteSummary(symbol, {
          modules: ["assetProfile"],
        });

        const website = summary?.assetProfile?.website;

        if (website) {
          const domain = extractDomain(website);
          if (domain) {
            logo = `https://img.logo.dev/${domain}?token=pk_EFfdzwY2T1yaCB1kZUGC0w`;
          }
        }
      } catch (err) {
        console.log("logo fetch failed:", err.message);
      }

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
        logo,
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
