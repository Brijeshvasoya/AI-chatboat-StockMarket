import { z } from "zod";
import { tool } from "ai";
import YahooFinance from "yahoo-finance2";
import { getCurrencySymbol } from "../lib/getCurrencySymbol";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export const getStockChart = tool({
  description: `Fetch stock price chart data for visualization.
              Always call with valid ticker symbol.
              Optional duration:
              1w, 1m, 3m, 6m, 1y
              Default: 1m
              If user enter invalid duration, default to 1m
              `,

  parameters: z.object({
    symbol: z.string().min(1, "Symbol required"),
    duration: z.enum(["1w", "1m", "3m", "6m", "1y"]).optional(),
  }),

  execute: async ({ symbol, duration = "1m" }) => {
    try {
      const now = new Date();
      const startDate = new Date();

      switch (duration) {
        case "1w":
          startDate.setDate(now.getDate() - 7);
          break;
        case "3m":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "1m":
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      const chart = await yahooFinance.chart(symbol, {
        period1: startDate,
        period2: now,
        interval: "1d",
      });

      const chartData =
        chart?.quotes?.map((q) => ({
          date: new Date(q.date).toISOString().split("T")[0],
          price: q.close,
        })) || [];

      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: ["assetProfile", "price"],
      });

      const domain = summary?.assetProfile?.website
        ?.replace("https://", "")
        ?.replace("http://", "")
        ?.split("/")[0];

      const token = process.env.LOGO_API_KEY
        ?.replace(/^["']|["']$/g, "")
        ?.replace(/%22/g, "")
        ?.trim();

      const logo = domain
        ? `https://img.logo.dev/${domain}?token=${token}`
        : null;

      const currencyCode = summary?.price?.currency;
      const currency = getCurrencySymbol(currencyCode);

      return {
        type: "chart",
        symbol,
        duration,
        company: summary?.price?.longName || symbol,
        logo,
        currency,
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