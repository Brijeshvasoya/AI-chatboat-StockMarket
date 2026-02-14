import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import YahooFinance from "yahoo-finance2";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const yahooFinance = new YahooFinance();

async function findSymbol(message) {
  try {
    const text = message.toUpperCase();
    const matches = text.match(/\b[A-Z]{2,5}(\.[A-Z]{2})?\b/g);
    if (matches?.length) {
      for (const word of matches.reverse()) {
        try {
          const result = await yahooFinance.search(word);
          if (!result?.quotes?.length) {
            continue;
          }
          const stock = result.quotes.find(
            (q) => q.symbol === word && q.quoteType === "EQUITY"
          );
          if (stock) {
            return word;
          }
        } catch (err) {
        }
      }
    }

    // Step 2 — fallback: search full message
    const result = await yahooFinance.search(message);
    if (!result?.quotes?.length) {
      return null;
    }
    const stock = result.quotes.find((q) => q.quoteType === "EQUITY");
    const finalSymbol = stock?.symbol || result.quotes[0].symbol;
    return finalSymbol;
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    let stockData = "";
    let symbol = null;

    // Step 1 — detect symbol
    symbol = await findSymbol(message);
    // Step 2 — fetch market data
    if (symbol) {
      try {
        const quote = await yahooFinance.quote(symbol);
        stockData = `
              Stock: ${quote.longName || quote.shortName || symbol}
              Symbol: ${symbol}
              Price: ${quote.regularMarketPrice}
              Previous Close: ${quote.regularMarketPreviousClose}
              Change: ${quote.regularMarketChangePercent}%
              Currency: ${quote.currency}
              Exchange: ${quote.fullExchangeName}
              Market Time: ${new Date(quote.regularMarketTime * 1000).toLocaleString()}
        `;
      } catch (err) {
        stockData = `Could not fetch market data for ${symbol}`;
      }
    } else {
    }
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `
        You are a professional stock market analyst.
        RULES:
        - NEVER generate stock prices.
        - ONLY use provided market data.
        - If market data is missing, say you cannot fetch it.
        - Keep answers concise and professional.
      `,
      prompt: `
        User question: ${message}
        Market data: ${stockData || "No market data available"}
      `,
    });

    return res.status(200).json({ reply: text });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Groq API error",
    });
  }
}
