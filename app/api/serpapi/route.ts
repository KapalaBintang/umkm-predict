import { getJson } from "serpapi";

export async function POST(req: Request) {
  const body = await req.json();
  const { query } = body;

  try {
    const response = await getJson({
      engine: "google_trends",
      q: query,
      hl: "id",
      gl: "ID",
      data_type: "TIMESERIES",
      api_key: process.env.SERPAPI_API_KEY,
    });

    // Ambil bagian "interest_over_time" dari response
    const interestOverTime = response.interest_over_time;

    return Response.json(interestOverTime);
  } catch (error) {
    console.error("SerpAPI error:", error);
    return new Response("Failed to fetch data from SerpAPI", { status: 500 });
  }
}
