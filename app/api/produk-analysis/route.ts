import { NextResponse } from "next/server";
import ai from "@/lib/gemini";

// Cache em memória para análises recentes (reduz chamadas à API durante a mesma sessão)
const analysisCache: Record<string, { data: any, timestamp: number }> = {};

// Tempo de expiração do cache em memória (1 hora)
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, timeline, kategori, konsumsiMingguan } = body;

    if (!keyword || !timeline || timeline.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }
    
    // Criar uma chave única para o cache baseada nos parâmetros
    const cacheKey = `${keyword}-${timeline[timeline.length - 1].time}`;
    
    // Verificar cache em memória
    const cachedAnalysis = analysisCache[cacheKey];
    if (cachedAnalysis && (Date.now() - cachedAnalysis.timestamp) < CACHE_EXPIRY_MS) {
      console.log(`Using in-memory cache for ${keyword}`);
      return NextResponse.json(cachedAnalysis.data);
    }

    // Siapkan data untuk dianalisis
    const currentValue = timeline[timeline.length - 1].value;
    const previousValues = timeline.length > 1 
      ? timeline.slice(-5, -1).map((item: any) => item.value) 
      : [currentValue];
    
    // Hitung perubahan persentase
    let perubahan = 0;
    if (timeline.length > 1) {
      const previousValue = timeline[timeline.length - 2].value;
      if (previousValue > 0) {
        perubahan = ((currentValue - previousValue) / previousValue) * 100;
      }
    }

    // Format tanggal untuk data
    const formattedTimeline = timeline.map((item: { time: string, value: number }) => {
      const date = new Date(parseInt(item.time) * 1000);
      return {
        date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        value: item.value
      };
    });

    // Prompt untuk Gemini
    const prompt = `
    Analisis data tren popularitas untuk produk "${keyword}" yang termasuk dalam kategori "${kategori}" dengan konsumsi mingguan ${konsumsiMingguan} kg.
    
    Data tren popularitas (nilai 0-100) dalam beberapa periode terakhir:
    ${formattedTimeline.map((item: { date: string, value: number }) => `- ${item.date}: ${item.value}`).join('\n')}
    
    Nilai terbaru: ${currentValue}
    Perubahan persentase dari periode sebelumnya: ${perubahan.toFixed(2)}%
    
    Berikan analisis dalam format JSON dengan struktur berikut:
    {
      "status": "naik" atau "turun" atau "stabil",
      "perubahan": nilai perubahan persentase (angka),
      "analisis": analisis singkat tentang tren popularitas produk (maksimal 2 kalimat),
      "prediksi": prediksi singkat tentang kemungkinan tren popularitas ke depan (maksimal 2 kalimat),
      "rekomendasi": rekomendasi bisnis untuk UMKM berdasarkan tren produk ini (maksimal 2 kalimat),
      "faktor": array berisi 3-4 faktor yang mungkin mempengaruhi popularitas ${keyword},
      "trendFuture": array berisi 4 nilai prediksi popularitas untuk 4 minggu ke depan (nilai 0-100)
    }
    
    Berikan analisis dalam Bahasa Indonesia yang formal namun mudah dipahami. Pastikan analisis berdasarkan data tren yang diberikan.
    Jangan tambahkan informasi lain di luar format JSON yang diminta.
    `;

    // Dapatkan respons dari Gemini
    let text = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      
      // Verifica se o resultado tem um texto
      if (!result || typeof result.text !== 'string') {
        console.error("Respons Gemini tidak valid");
        return NextResponse.json({
          status: perubahan > 1 ? "naik" : perubahan < -1 ? "turun" : "stabil",
          perubahan: parseFloat(perubahan.toFixed(2)),
          analisis: "Analisis tidak tersedia saat ini.",
          prediksi: "Prediksi tidak tersedia saat ini.",
          rekomendasi: "Rekomendasi tidak tersedia saat ini.",
          faktor: [
            "Permintaan dan penawaran di pasar",
            "Kondisi cuaca dan musim",
            "Kebijakan pemerintah",
            "Tren konsumsi masyarakat"
          ],
          trendFuture: [
            Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
          ]
        });
      }
      
      text = result.text;
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError);
      // Fallback data jika Gemini API error
      return NextResponse.json({
        status: perubahan > 1 ? "naik" : perubahan < -1 ? "turun" : "stabil",
        perubahan: parseFloat(perubahan.toFixed(2)),
        analisis: "Analisis tidak tersedia saat ini.",
        prediksi: "Prediksi tidak tersedia saat ini.",
        rekomendasi: "Rekomendasi tidak tersedia saat ini.",
        faktor: [
          "Permintaan dan penawaran di pasar",
          "Kondisi cuaca dan musim",
          "Kebijakan pemerintah",
          "Tren konsumsi masyarakat"
        ],
        trendFuture: [
          Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
        ]
      });
    }
    
    // Parse respons JSON
    try {
      // Cari teks JSON dalam respons
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Format JSON tidak ditemukan dalam respons");
        // Fallback data jika format JSON tidak ditemukan
        const fallbackData = {
          status: perubahan > 1 ? "naik" : perubahan < -1 ? "turun" : "stabil",
          perubahan: parseFloat(perubahan.toFixed(2)),
          analisis: "Analisis sedang diproses.",
          prediksi: "Prediksi sedang diproses.",
          rekomendasi: "Rekomendasi sedang diproses.",
          faktor: [
            "Permintaan dan penawaran di pasar",
            "Kondisi cuaca dan musim",
            "Kebijakan pemerintah",
            "Tren konsumsi masyarakat"
          ],
          trendFuture: [
            Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
          ]
        };
        
        // Salvar no cache em memória
        analysisCache[cacheKey] = {
          data: fallbackData,
          timestamp: Date.now()
        };
        
        return NextResponse.json(fallbackData);
      }
      
      try {
        const jsonText = jsonMatch[0];
        const analysisData = JSON.parse(jsonText);
        
        // Garantir que trendFuture existe
        if (!analysisData.trendFuture) {
          analysisData.trendFuture = [
            Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
          ];
        }
        
        // Salvar no cache em memória
        analysisCache[cacheKey] = {
          data: analysisData,
          timestamp: Date.now()
        };
        
        return NextResponse.json(analysisData);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        if (text) {
          console.log("Raw response:", text);
        }
        
        // Fallback data jika parsing JSON gagal
        const fallbackData = {
          status: perubahan > 1 ? "naik" : perubahan < -1 ? "turun" : "stabil",
          perubahan: parseFloat(perubahan.toFixed(2)),
          analisis: "Analisis sedang diproses.",
          prediksi: "Prediksi sedang diproses.",
          rekomendasi: "Rekomendasi sedang diproses.",
          faktor: [
            "Permintaan dan penawaran di pasar",
            "Kondisi cuaca dan musim",
            "Kebijakan pemerintah",
            "Tren konsumsi masyarakat"
          ],
          trendFuture: [
            Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
            Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
          ]
        };
        
        // Salvar no cache em memória
        analysisCache[cacheKey] = {
          data: fallbackData,
          timestamp: Date.now()
        };
        
        return NextResponse.json(fallbackData);
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      if (text) {
        console.log("Raw response:", text);
      }
      
      // Fallback jika parsing gagal - gunakan data sederhana
      return NextResponse.json({
        status: perubahan > 1 ? "naik" : perubahan < -1 ? "turun" : "stabil",
        perubahan: parseFloat(perubahan.toFixed(2)),
        analisis: "Analisis tidak tersedia saat ini.",
        prediksi: "Prediksi tidak tersedia saat ini.",
        rekomendasi: "Rekomendasi tidak tersedia saat ini.",
        faktor: [
          "Permintaan dan penawaran di pasar",
          "Kondisi cuaca dan musim",
          "Kebijakan pemerintah",
          "Tren konsumsi masyarakat"
        ],
        trendFuture: [
          Math.min(100, Math.max(0, currentValue + (Math.random() * 10 - 5))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 15 - 7))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 20 - 10))),
          Math.min(100, Math.max(0, currentValue + (Math.random() * 25 - 12)))
        ]
      });
    }
  } catch (error) {
    console.error("Error in produk-analysis API:", error);
    // Sempre retornar 200 com dados de fallback em vez de 500
    return NextResponse.json({
      status: "stabil",
      perubahan: 0,
      analisis: "Analisis tidak tersedia saat ini.",
      prediksi: "Prediksi tidak tersedia saat ini.",
      rekomendasi: "Rekomendasi tidak tersedia saat ini.",
      faktor: [
        "Permintaan dan penawaran di pasar",
        "Kondisi cuaca dan musim",
        "Kebijakan pemerintah",
        "Tren konsumsi masyarakat"
      ],
      trendFuture: [
        Math.min(100, Math.max(0, Math.random() * 20)),
        Math.min(100, Math.max(0, Math.random() * 30)),
        Math.min(100, Math.max(0, Math.random() * 40)),
        Math.min(100, Math.max(0, Math.random() * 50))
      ]
    });
  }
}
