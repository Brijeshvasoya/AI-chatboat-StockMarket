// import { stockAgent } from "@/components/Agent/StockAgent";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "Messages array required" });
//     }

//     const lastUserMessage =
//       messages[messages.length - 1]?.content?.toLowerCase() || "";

//     const isChartIntent =
//       lastUserMessage.includes("chart") ||
//       lastUserMessage.includes("graph") ||
//       lastUserMessage.includes("price history");

//     if (isChartIntent) {
//       const result = await stockAgent.generate({ messages });

//       for (const step of result.steps || []) {
//         for (const item of step.content || []) {
//           if (
//             item.type === "tool-result" ||
//             item.type === "toolResult"
//           ) {
//             const data = item.output?.value ?? item.output;
//             if (data?.type === "chart") {
//               res.setHeader("Content-Type", "application/json");
//               return res.json(data);
//             }
//           }
//         }
//       }

//       return res.status(500).json({
//         error: "Chart data not available",
//       });
//     }
//     const result = await stockAgent.stream({ messages });

//     res.setHeader("Content-Type", "text/plain; charset=utf-8");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Transfer-Encoding", "chunked");
//     res.setHeader("X-Accel-Buffering", "no");
//     res.flushHeaders();

//     for await (const chunk of result.textStream) {
//       if (chunk) {
//         res.write(`0:${JSON.stringify(chunk)}\n`);
//       }
//     }

//     res.end();
//   } catch (error) {
//     console.error("❌ Handler error:", error);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// }
// console.log(`🚀 ~ handler ~ import { stockAgent } from "@/components/Agent/StockAgent";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "Messages array required" });
//     }

//     const lastUserMessage =
//       messages[messages.length - 1]?.content?.toLowerCase() || "";

//     const isChartIntent =
//       lastUserMessage.includes("chart") ||
//       lastUserMessage.includes("graph") ||
//       lastUserMessage.includes("price history");

//     if (isChartIntent) {
//       const result = await stockAgent.generate({ messages });

//       for (const step of result.steps || []) {
//         for (const item of step.content || []) {
//           if (
//             item.type === "tool-result" ||
//             item.type === "toolResult"
//           ) {
//             const data = item.output?.value ?? item.output;
//             if (data?.type === "chart") {
//               res.setHeader("Content-Type", "application/json");
//               return res.json(data);
//             }
//           }
//         }
//       }

//       return res.status(500).json({
//         error: "Chart data not available",
//       });
//     }
//     const result = await stockAgent.stream({ messages });

//     res.setHeader("Content-Type", "text/plain; charset=utf-8");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Transfer-Encoding", "chunked");
//     res.setHeader("X-Accel-Buffering", "no");
//     res.flushHeaders();

//     for await (const chunk of result.textStream) {
//       if (chunk) {
//         res.write(`0:${JSON.stringify(chunk)}\n`);
//       }
//     }

//     res.end();
//   } catch (error) {
//     console.error("❌ Handler error:", error);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// }:`, import { stockAgent } from "@/components/Agent/StockAgent";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "Messages array required" });
//     }

//     const lastUserMessage =
//       messages[messages.length - 1]?.content?.toLowerCase() || "";

//     const isChartIntent =
//       lastUserMessage.includes("chart") ||
//       lastUserMessage.includes("graph") ||
//       lastUserMessage.includes("price history");

//     if (isChartIntent) {
//       const result = await stockAgent.generate({ messages });

//       for (const step of result.steps || []) {
//         for (const item of step.content || []) {
//           if (
//             item.type === "tool-result" ||
//             item.type === "toolResult"
//           ) {
//             const data = item.output?.value ?? item.output;
//             if (data?.type === "chart") {
//               res.setHeader("Content-Type", "application/json");
//               return res.json(data);
//             }
//           }
//         }
//       }

//       return res.status(500).json({
//         error: "Chart data not available",
//       });
//     }
//     const result = await stockAgent.stream({ messages });

//     res.setHeader("Content-Type", "text/plain; charset=utf-8");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Transfer-Encoding", "chunked");
//     res.setHeader("X-Accel-Buffering", "no");
//     res.flushHeaders();

//     for await (const chunk of result.textStream) {
//       if (chunk) {
//         res.write(`0:${JSON.stringify(chunk)}\n`);
//       }
//     }

//     res.end();
//   } catch (error) {
//     console.error("❌ Handler error:", error);
//     return res.status(500).json({
//       error: "Server error",
//     });
//   }
// })

import { stockAgent } from "@/components/Agent/StockAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array required" });
    }

    // 🔥 Always use generate (not stream first)
    const result = await stockAgent.generate({ messages });

    let chartData = null;
    let textResponse = "";

    for (const step of result.steps || []) {
      for (const item of step.content || []) {
        // 🛠 Tool result
        if (
          item.type === "tool-result" ||
          item.type === "toolResult"
        ) {
          const data = item.output?.value ?? item.output;

          if (data?.type === "chart") {
            chartData = data;
          }
        }

        // 📝 Text result
        if (item.type === "text") {
          textResponse += item.text || "";
        }
      }
    }

    // ✅ If chart tool was used → return structured JSON
    if (chartData) {
      return res.status(200).json({
        messages: [
          {
            type: "ai",
            chart: {
              data: chartData.data,
              symbol: chartData.symbol,
              logo: chartData.logo,
              currency: chartData.currency,
              duration: chartData.duration,
            },
          },
          {
            type: "ai",
            content: textResponse.trim(),
          },
        ],
      });
    }

    // ✅ Otherwise return normal text
    return res.status(200).json({
      messages: [
        {
          type: "ai",
          content: textResponse.trim(),
        },
      ],
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}