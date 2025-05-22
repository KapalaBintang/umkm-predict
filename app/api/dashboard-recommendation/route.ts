import ai from "../../../lib/gemini";
import { Type } from "@google/genai";

export async function GET(req: Request) {

    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Buatkan saya data dalam format JSON berisi:
          1. Top 4 bahan pokok/makanan tergacor minggu ini dalam array bernama "prediksiRingkasan", masing-masing item memiliki:
            - id
            - nama
            - perubahan (dalam persen)
            - status ("naik", "turun", atau "stabil")
            - hargaSekarang
            - hargaSebelumnya
            - satuan (contoh: "kg", "liter")
          
          2. Rekomendasi AI dalam array "rekomendasiAI", masing-masing item memiliki:
            - id
            - judul
            - pesan
            - prioritas ("tinggi", "sedang", atau "rendah")
          
          3. Data tren harga 6 bulan terakhir dalam array "trenData", dengan struktur:
            - bulan (Jan, Feb, dst)
            - data harga per komoditas (telur, cabai, minyak, beras)
          
          Pastikan format JSON valid.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  prediksiRingkasan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.NUMBER },
                        nama: { type: Type.STRING },
                        perubahan: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        hargaSekarang: { type: Type.NUMBER },
                        hargaSebelumnya: { type: Type.NUMBER },
                        satuan: { type: Type.STRING },
                      },
                      propertyOrdering: ["id", "nama", "perubahan", "status", "hargaSekarang", "hargaSebelumnya", "satuan"],
                    },
                  },
                  rekomendasiAI: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.NUMBER },
                        judul: { type: Type.STRING },
                        pesan: { type: Type.STRING },
                        prioritas: { type: Type.STRING },
                      },
                      propertyOrdering: ["id", "judul", "pesan", "prioritas"],
                    },
                  },
                  trenData: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        bulan: { type: Type.STRING },
                        telur: { type: Type.NUMBER },
                        cabai: { type: Type.NUMBER },
                        minyak: { type: Type.NUMBER },
                        beras: { type: Type.NUMBER },
                      },
                      propertyOrdering: ["bulan", "telur", "cabai", "minyak", "beras"],
                    },
                  },
                },
                propertyOrdering: ["prediksiRingkasan", "rekomendasiAI", "trenData"],
              },
            },
          });
          
        
          if (typeof response.text === 'string') {
            const parsedResponse = JSON.parse(response.text);
            return Response.json(parsedResponse);
          } else {
            return Response.json({ error: "Response text is undefined" }, { status: 500 });
          }
          
    } catch (error) {
        console.error("Error fetching recommendation data from Gemini:", error);
        return Response.json({ error: "Failed to fetch recommendation data" }, { status: 500 });
    }

}