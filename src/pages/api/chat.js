import { stockAgent } from "@/components/Agent/StockAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    const { toolResults } = await stockAgent.run(message);

    const allStockData = toolResults ?? [];

    if (allStockData.length === 0) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      res.write(`0:${JSON.stringify("Sorry, can't fetch data. We provide data for stock market related queries only.")}\n`);
      res.end();
      return;
    }

    let injectedContent;
    if (allStockData.length === 1) {
      injectedContent = `Here is the real-time stock data:\`\`\`json${JSON.stringify(allStockData[0], null, 2)}\`\`\`Now write the SINGLE STOCK FORMAT analysis.`;
    } else {
      const stocksText = allStockData
        .map((data, i) => `Stock ${i + 1} (${data.symbol}):\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``)
        .join("\n\n");

      injectedContent = `Here is the real-time data for ALL
                          ${allStockData.length} stocks:${stocksText}
                          Now write the MULTI STOCK FORMAT:
                          - First show individual table + analysis for EACH stock
                          - Then MANDATORY: show Head-to-Head Comparison table
                          - Then MANDATORY: show Final Verdict`;
    }

    const analysisResult = await stockAgent.stream(injectedContent);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    for await (const chunk of analysisResult.textStream) {
      res.write(`0:${JSON.stringify(chunk)}\n`);
      if (res.flush) res.flush();
    }

    res.end();
    return;
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
