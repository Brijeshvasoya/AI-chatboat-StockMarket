import { generateText, streamText } from "ai";
import { createMistral } from '@ai-sdk/mistral';
import { SYSTEM_PROMPT } from "@/components/constant";
import { getStockData } from "@/components/tool/stockData";

const LLM = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    const toolResult = await generateText({
      model: LLM("mistral-large-latest"),
      tools: { getStockData },
      maxSteps: 10,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });
    const allStockData = (toolResult.steps ?? [])
      .flatMap(step => step.toolResults ?? [])
      .map(r => r.result ?? r.output)
      .filter(Boolean);
    if (allStockData.length === 0) {
      const fallbackText = toolResult.text;
      if (fallbackText) {
        return res.status(200).json({ reply: fallbackText });
      }
      return res.status(200).json({ reply: "Sorry, can't fetch data." });
    }
    let injectedContent;
    if (allStockData.length === 1) {
      injectedContent = `Here is the real-time stock data:
                          \`\`\`json
                          ${JSON.stringify(allStockData[0], null, 2)}
                          \`\`\`
                          Now write the SINGLE STOCK FORMAT analysis.`;
    } else {
      const stocksText = allStockData
        .map((data, i) => `Stock ${i + 1} (${data.symbol}):\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``)
        .join("\n\n");

      injectedContent = `Here is the real-time data for ALL ${allStockData.length} stocks:
                          ${stocksText}
                          Now write the MULTI STOCK FORMAT:
                          - First show individual table + analysis for EACH stock
                          - Then MANDATORY: show Head-to-Head Comparison table
                          - Then MANDATORY: show Final Verdict`;
    }
    const analysisResult = await streamText({
      model: LLM("mistral-large-latest"),
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: message },
        { role: "user", content: injectedContent },
      ],
    });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    for await (const chunk of analysisResult.textStream) {
      const formatted = `0:${JSON.stringify(chunk)}\n`;
      res.write(formatted);
      if (res.flush) res.flush();
    }
    res.end();
    return;
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}