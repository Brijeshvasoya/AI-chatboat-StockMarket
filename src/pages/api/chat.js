import { stockAgent } from "@/components/Agent/StockAgent";
import { getStockChart } from "@/components/tool/stockChart";

function extractDuration(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role !== "user") continue;
    const text = (messages[i]?.content || "").toLowerCase();

    if (/\b(1\s*years?|one\s*years?|12\s*months?|annual|yearly|1y)\b/.test(text)) return "1y";
    if (/\b(6\s*months?|six\s*months?|half\s*year|6m)\b/.test(text)) return "6m";
    if (/\b(3\s*months?|three\s*months?|quarter|3m)\b/.test(text)) return "3m";
    if (/\b(1\s*months?|one\s*months?|30\s*days?|1m)\b/.test(text)) return "1m";
    if (/\b(1\s*weeks?|one\s*weeks?|7\s*days?|1w)\b/.test(text)) return "1w";

    if (/chart|graph|price history|price chart|plot|candlestick|line chart|bar chart|stock chart|technical analysis|price trend|market data|historical data|price movement|stock performance|trading view|market chart|price graph|stock graph|performance chart|price visualization|visualize/.test(text)) break;
  }
  return "1m";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array required" });
    }
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lastUserLower = lastUserMessage.toLowerCase();
    const isChartIntent =
      lastUserLower.includes("chart") ||
      lastUserLower.includes("graph") ||
      lastUserLower.includes("price history") ||
      lastUserLower.includes("price chart") ||
      lastUserLower.includes("plot") ||
      lastUserLower.includes("visualize") ||
      lastUserLower.includes("candlestick") ||
      lastUserLower.includes("line chart") ||
      lastUserLower.includes("bar chart") ||
      lastUserLower.includes("stock chart") ||
      lastUserLower.includes("technical analysis") ||
      lastUserLower.includes("price trend") ||
      lastUserLower.includes("market data") ||
      lastUserLower.includes("historical data") ||
      lastUserLower.includes("price movement") ||
      lastUserLower.includes("stock performance") ||
      lastUserLower.includes("trading view") ||
      lastUserLower.includes("market chart") ||
      lastUserLower.includes("price graph") ||
      lastUserLower.includes("stock graph") ||
      lastUserLower.includes("performance chart") ||
      lastUserLower.includes("price visualization");
    if (isChartIntent) {
      const duration = extractDuration(messages);
      const patchedMessages = messages.map((msg, idx) => {
        if (idx !== messages.length - 1) return msg;
        return {
          ...msg,
          content: `${msg.content}\n\n[MANDATORY: Call getStockChart with duration="${duration}". This exact value is required.]`,
        };
      });
      const result = await stockAgent.generate({ messages: patchedMessages });
      for (const step of result.steps || []) {
        for (const item of step.content || []) {
          if (item.type === "tool-result" || item.type === "toolResult") {
            const data = item.output?.value ?? item.output;
            if (data?.type === "chart") {
              let chartToSend = data;
              if (data.duration !== duration) {
                const corrected = await getStockChart.execute({ symbol: data.symbol, duration });
                if (corrected?.type === "chart") {
                  chartToSend = corrected;
                }
              }
              res.setHeader("Content-Type", "text/plain; charset=utf-8");
              res.setHeader("Cache-Control", "no-cache");
              res.setHeader("Transfer-Encoding", "chunked");
              res.setHeader("X-Accel-Buffering", "no");
              res.flushHeaders();
              res.write(`8:${JSON.stringify(chartToSend)}\n`);
              res.end();
              return;
            }
          }
        }
      }
      return res.status(500).json({ error: "Chart data not available" });
    }
    const result = await stockAgent.stream({ messages });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    for await (const chunk of result.textStream) {
      if (chunk) res.write(`0:${JSON.stringify(chunk)}\n`);
    }
    res.end();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
