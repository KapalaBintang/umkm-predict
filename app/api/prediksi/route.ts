import { getJson } from "serpapi";

export async function POST() {
  const keywords = [
    "cabe", "bawang", "daging ayam", "beras", "minyak goreng",
    "telur", "gula", "tepung", "ikan", "susu",
    "mie instan", "tempe", "tahu"
  ];

  const combinedResults: {
    keyword: string;
    timeline: { time: string; value: number }[];
  }[] = [];

  try {
    for (const keyword of keywords) {
      const response = await getJson({
        engine: "google_trends",
        q: keyword,
        hl: "id",
        gl: "ID",
        date: "today 3-m",
        data_type: "TIMESERIES",
        api_key: process.env.SERPAPI_API_KEY,
      });

      const timeline = response?.interest_over_time?.timeline_data;


      if (timeline && Array.isArray(timeline)) {
        const parsedTimeline = timeline.map((entry: any) => {
          // Extract the value from the values array structure
          const valueObj = entry.values && entry.values.length > 0 ? entry.values.find((v: any) => v.query === keyword) : null;
          const extractedValue = valueObj ? valueObj.extracted_value : 0;
          
          return {
            time: entry.date,
            value: extractedValue
          };
        });
      
        combinedResults.push({
          keyword,
          timeline: parsedTimeline,
        });
      }      

      // OPTIONAL: Delay agar tidak kena rate limit
      await new Promise((res) => setTimeout(res, 500));
    }

    return Response.json(combinedResults);
  } catch (error) {
    console.error("SerpAPI error:", error);
    return new Response("Failed to fetch timeseries data", { status: 500 });
  }
}
