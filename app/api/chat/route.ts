import ai from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = body.prompt;

  if (!prompt) {
    return new Response("Prompt is required", { status: 400 });
  }

  const history = body.history || [];

  const formattedHistory = history.map(({ role, content }: { role: string; content: string }) => ({
    role,
    parts: [{ text: content }],
  }));

  console.log("formattedHistory", formattedHistory)
  console.log("is formattedHistory array?", Array.isArray(formattedHistory))

  const response = await ai.models.generateContentStream({
    model: "gemini-1.5-flash",
    contents: [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: prompt }],
      },
      {
        role: "assistant",
        parts: [
          {
            text: `You are a helpful assistant for a website that supports small and medium businesses (UMKM) in Indonesia. Your job is to provide accurate, actionable, and friendly suggestions to help improve their business. You can give insights on product recommendations, marketing strategies, customer engagement, pricing, and inventory prediction. You speak in simple Indonesian, are easy to understand, and always use an encouraging tone.

Always tailor your advice based on the user’s input. If the user asks about selling a specific product, provide suggestions for pricing, target audience, and how to promote it online. If the user gives sales data, help predict demand or identify trends.

Your goal is to help UMKM grow sustainably and become more competitive in the digital economy of Indonesia. Use Indonesian language as the default language.
`
          },
        ],
      },
    ],
  });

  console.log("response", response)

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text;
          console.log("text", text)
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
