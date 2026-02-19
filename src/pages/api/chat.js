import { stockAgent } from "@/components/Agent/StockAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sendStream = async (prompt) => {
    const result = await stockAgent.stream({ prompt });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    for await (const chunk of result.textStream) {
      res.write(`0:${JSON.stringify(chunk)}\n`);
      if (res.flush) res.flush();
    }
    res.end();
  };

  try {
    const { message } = req.body;

    const toolResults = await stockAgent.generate({ prompt: message });

    const allStockData = [];
    for (const step of toolResults.steps || []) {
      for (const item of step.content || []) {
        if (item.type === "tool-result" || item.type === "toolResult") {
          const output = item.output ?? item.result;
          const data = output?.value ?? output;
          if (data && !data.error && data.symbol) {
            const alreadyAdded = allStockData.some((d) => d.symbol === data.symbol);
            if (!alreadyAdded) allStockData.push(data);
          }
        }
      }
    }

    if (allStockData.length === 0) {
      const lastStep = toolResults.steps?.[toolResults.steps.length - 1];
      const textContent = lastStep?.content?.find((c) => c.type === "text");

      if (textContent?.text) {
        await sendStream(
          `Repeat this answer exactly as-is, no changes:\n\n${textContent.text}`
        );
        return;
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      res.write(`0:${JSON.stringify("Sorry, I can only help with stock market related queries.")}\n`);
      res.end();
      return;
    }

    let injectedContent;
    if (allStockData.length === 1) {
      injectedContent = `Here is the real-time stock data:\n\`\`\`json\n${JSON.stringify(
        allStockData[0], null, 2
      )}\n\`\`\`\nNow write the SINGLE STOCK FORMAT analysis.`;
    } else {
      const stocksText = allStockData
        .map((data, i) => `Stock ${i + 1} (${data.symbol}):\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``)
        .join("\n\n");
      injectedContent = `Here is the real-time data for ALL ${allStockData.length} stocks:\n\n${stocksText}\n\nNow write the COMPARISON FORMAT only:
                        - DO NOT show any individual stock tables
                        - DO NOT show any individual stock analysis
                        - Show only: one-line summary per stock, then Head-to-Head Comparison table, then Final Verdict`;
    }

    await sendStream(injectedContent);
    return;
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}