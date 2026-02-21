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
              Examples:
              AAPL
              TSLA
              INFY.NS
              RELIANCE.BO
              `,

  parameters: z.object({
    symbol: z.string().min(1, "Symbol required"),
  }),

  execute: async ({ symbol }) => {
    try {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      const chart = await yahooFinance.chart(symbol, {
        period1: oneMonthAgo,
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

      const logo = domain
        ? `https://img.logo.dev/${domain}?token=${process.env.LOGO_API_KEY}`
        : null;

      const currencyCode = summary?.price?.currency;
      const currency = getCurrencySymbol(currencyCode);

      return {
        type: "chart",
        symbol,
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
