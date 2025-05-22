import { NextRequest, NextResponse } from 'next/server';
import ai from '@/lib/gemini';

// Interface untuk notifikasi
interface Notifikasi {
  judul: string;
  pesan: string;
  status: "naik" | "turun" | "stabil" | "penting";
  dibaca: boolean;
  icon: string;
  userId: string;
  kategori: "harga" | "produk" | "sistem" | "lainnya";
  targetUrl?: string;
}

// Interface untuk data prediksi
interface PrediksiData {
  id: string;
  keyword: string;
  kategori?: string;
  hargaSekarang?: number;
  prediksiHarga?: number;
  persentasePerubahan?: number;
  tren?: 'naik' | 'turun' | 'stabil';
  lastUpdated?: any;
  analisis?: string;
  createdAt?: any;
  updatedAt?: any;
  timeline?: Array<{time: string; value: number}>;
}

// Ambang batas persentase perubahan untuk mengirim notifikasi
const THRESHOLD_PERUBAHAN = 5; // 5%

/**
 * Endpoint untuk memproses notifikasi otomatis
 */
export async function POST(request: NextRequest) {
  try {
    // Verifikasi keamanan dengan API key sederhana
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.NOTIFICATION_API_KEY;
    
    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dapatkan data dari request body
    const body = await request.json();
    const { users, prediksiData } = body;
    
    if (!users || !prediksiData || !Array.isArray(users) || !Array.isArray(prediksiData)) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    
    // Analisis prediksi menggunakan Gemini AI
    const signifikanPrediksi = await analisisPrediksiDenganAI(prediksiData);

    console.log(signifikanPrediksi);
    
    // Buat notifikasi untuk setiap pengguna
    const notifikasi: Notifikasi[] = [];
    
    users.forEach(user => {
      const userId = user.id;
      
      // Buat notifikasi untuk setiap prediksi signifikan
      signifikanPrediksi.forEach(prediksi => {
        const notif = buatNotifikasiDariPrediksi(prediksi, userId);
        console.log(notif);
        if (notif) {
          notifikasi.push(notif);
        }
      });
    });

    console.log(notifikasi);
    
    return NextResponse.json({
      success: true,
      notifikasi,
      message: `${notifikasi.length} notifikasi telah dibuat`,
      prediksiSignifikan: signifikanPrediksi.length
    });
    
  } catch (error) {
    console.error('Error in auto notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Analisis prediksi menggunakan Gemini AI untuk menentukan perubahan signifikan
 */
async function analisisPrediksiDenganAI(prediksiData: PrediksiData[]): Promise<PrediksiData[]> {
  try {
    console.log("Prediksi data original:", prediksiData);
    
    // Preprocessing: hitung persentase perubahan dari timeline
    prediksiData.forEach(prediksi => {
      if (prediksi.timeline && prediksi.timeline.length >= 2) {
        // Ambil nilai terbaru dan nilai sebelumnya
        const latestValue = prediksi.timeline[prediksi.timeline.length - 1].value;
        const previousValue = prediksi.timeline[prediksi.timeline.length - 2].value;
        
        // Hitung persentase perubahan
        const persentase = ((latestValue - previousValue) / previousValue) * 100;
        
        // Tambahkan properti yang dibutuhkan
        prediksi.hargaSekarang = previousValue;
        prediksi.prediksiHarga = latestValue;
        prediksi.persentasePerubahan = persentase;
        prediksi.tren = persentase > 0 ? 'naik' : persentase < 0 ? 'turun' : 'stabil';
        
        // Tambahkan juga kategori jika belum ada
        if (!prediksi.kategori) {
          prediksi.kategori = 'bahan pokok';
        }
      }
    });
    
    console.log("Prediksi data setelah preprocessing:", prediksiData);
    // Filter prediksi yang memiliki perubahan signifikan
    const signifikanPrediksi = prediksiData.filter(prediksi => {
      // Jika sudah ada persentase perubahan, gunakan itu
      if (prediksi.persentasePerubahan) {
        return Math.abs(prediksi.persentasePerubahan) >= THRESHOLD_PERUBAHAN;
      }
      
      // Jika ada harga sekarang dan prediksi harga, hitung persentase perubahan
      if (prediksi.hargaSekarang && prediksi.prediksiHarga) {
        const persentase = ((prediksi.prediksiHarga - prediksi.hargaSekarang) / prediksi.hargaSekarang) * 100;
        prediksi.persentasePerubahan = persentase;
        prediksi.tren = persentase > 0 ? 'naik' : persentase < 0 ? 'turun' : 'stabil';
        return Math.abs(persentase) >= THRESHOLD_PERUBAHAN;
      }
      
      // Jika sudah ada tren, gunakan itu
      return prediksi.tren === 'naik' || prediksi.tren === 'turun';
    });
    
    // Jika tidak ada prediksi signifikan, kembalikan array kosong
    if (signifikanPrediksi.length === 0) {
      return [];
    }
    
    // Gunakan Gemini AI untuk menganalisis prediksi signifikan
    // Buat prompt untuk Gemini AI
    const prompt = `
    Analisis perubahan harga bahan pokok berikut dan berikan rekomendasi untuk UMKM:
    
    ${signifikanPrediksi.map(p => `
    - ${p.keyword} (${p.kategori}): 
      Tren: ${p.tren}
      Persentase Perubahan: ${p.persentasePerubahan ? Math.abs(p.persentasePerubahan).toFixed(2) + '%' : 'Tidak diketahui'}
    `).join('\n')}
    
    Untuk setiap item, berikan:
    1. Analisis singkat mengapa harga berubah (maksimal 1 kalimat)
    2. Rekomendasi untuk UMKM (maksimal 1 kalimat)
    
    Format respons dalam JSON dengan struktur:
    {
      "items": [
        {
          "keyword": "nama item",
          "analisis": "analisis singkat",
          "rekomendasi": "rekomendasi singkat"
        }
      ]
    }
    `;
    
    // Dapatkan respons dari Gemini
    let responseText = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      
      if (result && typeof result.text === 'string') {
        responseText = result.text;
      } else {
        console.error("Respons Gemini tidak valid");
        // Lanjutkan dengan respons kosong, akan ditangani di blok berikutnya
      }
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError);
      // Lanjutkan dengan respons kosong, akan ditangani di blok berikutnya
    }
    
    // Parse respons JSON dari Gemini AI
    try {
      console.log("Respons Gemini:", responseText);
      
      // Ekstrak JSON dari respons (mungkin ada teks tambahan)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Tidak dapat menemukan JSON dalam respons');
        // Buat analisis manual jika tidak bisa parse JSON
        signifikanPrediksi.forEach(prediksi => {
          if (prediksi.tren === 'naik') {
            prediksi.analisis = `Harga ${prediksi.keyword} naik karena permintaan tinggi. Sebaiknya UMKM menyesuaikan harga jual produk.`;
          } else if (prediksi.tren === 'turun') {
            prediksi.analisis = `Harga ${prediksi.keyword} turun karena pasokan melimpah. Ini waktu yang tepat untuk membeli stok lebih banyak.`;
          } else {
            prediksi.analisis = `Harga ${prediksi.keyword} relatif stabil. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
          }
        });
        return signifikanPrediksi;
      }
      
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Coba perbaiki JSON yang tidak valid
        const fixedJson = jsonMatch[0]
          .replace(/([\{,])\s*([\w]+)\s*:/g, '$1"$2":')
          .replace(/\'([^']*)\'\s*:/g, '"$1":')
          .replace(/:\s*\'([^']*)\'\s*/g, ':"$1"');
        
        try {
          jsonResponse = JSON.parse(fixedJson);
        } catch (fixError) {
          console.error('Gagal memperbaiki JSON:', fixError);
          // Buat analisis manual
          signifikanPrediksi.forEach(prediksi => {
            if (prediksi.tren === 'naik') {
              prediksi.analisis = `Harga ${prediksi.keyword} naik karena permintaan tinggi. Sebaiknya UMKM menyesuaikan harga jual produk.`;
            } else if (prediksi.tren === 'turun') {
              prediksi.analisis = `Harga ${prediksi.keyword} turun karena pasokan melimpah. Ini waktu yang tepat untuk membeli stok lebih banyak.`;
            } else {
              prediksi.analisis = `Harga ${prediksi.keyword} relatif stabil. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
            }
          });
          return signifikanPrediksi;
        }
      }
      
      console.log("JSON Response:", jsonResponse);
      
      // Periksa apakah jsonResponse memiliki property items
      if (!jsonResponse.items || !Array.isArray(jsonResponse.items)) {
        console.error('Format JSON tidak valid, tidak ada property items');
        // Buat analisis manual
        signifikanPrediksi.forEach(prediksi => {
          if (prediksi.tren === 'naik') {
            prediksi.analisis = `Harga ${prediksi.keyword} naik karena permintaan tinggi. Sebaiknya UMKM menyesuaikan harga jual produk.`;
          } else if (prediksi.tren === 'turun') {
            prediksi.analisis = `Harga ${prediksi.keyword} turun karena pasokan melimpah. Ini waktu yang tepat untuk membeli stok lebih banyak.`;
          } else {
            prediksi.analisis = `Harga ${prediksi.keyword} relatif stabil. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
          }
        });
        return signifikanPrediksi;
      }
      
      // Update prediksi dengan analisis dari AI
      signifikanPrediksi.forEach(prediksi => {
        const aiItem = jsonResponse.items.find((item: any) => 
          (item.keyword && item.keyword.toLowerCase().includes(prediksi.keyword.toLowerCase())) ||
          (item.keyword && prediksi.keyword.toLowerCase().includes(item.keyword.toLowerCase()))
        );
        
        if (aiItem) {
          prediksi.analisis = `${aiItem.analisis || ''} ${aiItem.rekomendasi || ''}`;
        } else {
          // Jika tidak ada item yang cocok, buat analisis manual
          if (prediksi.tren === 'naik') {
            prediksi.analisis = `Harga ${prediksi.keyword} naik karena permintaan tinggi. Sebaiknya UMKM menyesuaikan harga jual produk.`;
          } else if (prediksi.tren === 'turun') {
            prediksi.analisis = `Harga ${prediksi.keyword} turun karena pasokan melimpah. Ini waktu yang tepat untuk membeli stok lebih banyak.`;
          } else {
            prediksi.analisis = `Harga ${prediksi.keyword} relatif stabil. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
          }
        }
      });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Jika gagal parse, tetap lanjutkan dengan prediksi tanpa analisis AI
      signifikanPrediksi.forEach(prediksi => {
        if (prediksi.tren === 'naik') {
          prediksi.analisis = `Harga ${prediksi.keyword} naik karena permintaan tinggi. Sebaiknya UMKM menyesuaikan harga jual produk.`;
        } else if (prediksi.tren === 'turun') {
          prediksi.analisis = `Harga ${prediksi.keyword} turun karena pasokan melimpah. Ini waktu yang tepat untuk membeli stok lebih banyak.`;
        } else {
          prediksi.analisis = `Harga ${prediksi.keyword} relatif stabil. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
        }
      });
    }

    console.log(signifikanPrediksi)
    
    return signifikanPrediksi;
  } catch (error) {
    console.error('Error analyzing predictions with AI:', error);
    // Jika ada error dengan AI, kembalikan prediksi signifikan tanpa analisis AI
    return prediksiData.filter(prediksi => {
      if (prediksi.persentasePerubahan) {
        return Math.abs(prediksi.persentasePerubahan) >= THRESHOLD_PERUBAHAN;
      }
      return prediksi.tren === 'naik' || prediksi.tren === 'turun';
    });
  }
}

/**
 * Buat notifikasi dari data prediksi
 */
function buatNotifikasiDariPrediksi(prediksi: PrediksiData, userId: string): Notifikasi | null {
  // Pastikan prediksi memiliki keyword
  if (!prediksi.keyword) {
    console.log("Prediksi tidak memiliki keyword:", prediksi);
    return null;
  }

  console.log(prediksi)
  
  // Jika tren tidak ada, gunakan default "penting"
  const status = (prediksi.tren || "penting") as "naik" | "turun" | "stabil" | "penting";
  const icon = getIconForItem(prediksi.kategori);
  
  // Buat pesan notifikasi
  let pesan = '';
  
  if (prediksi.analisis) {
    // Gunakan analisis dari AI jika ada
    pesan = prediksi.analisis;
  } else {
    // Buat pesan default berdasarkan tren
    if (status === 'naik') {
      pesan = `Harga ${prediksi.keyword} diprediksi naik ${Math.abs(prediksi.persentasePerubahan || 0).toFixed(1)}%. Pertimbangkan untuk menyesuaikan harga produk Anda.`;
    } else if (status === 'turun') {
      pesan = `Harga ${prediksi.keyword} diprediksi turun ${Math.abs(prediksi.persentasePerubahan || 0).toFixed(1)}%. Ini waktu yang tepat untuk membeli stok.`;
    } else if (status === 'stabil') {
      pesan = `Harga ${prediksi.keyword} diprediksi stabil dalam waktu dekat.`;
    } else {
      pesan = `Informasi penting tentang ${prediksi.keyword}. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
    }
  }
  
  // Pastikan pesan tidak kosong
  if (!pesan || pesan.trim() === '') {
    pesan = `Informasi penting tentang ${prediksi.keyword}. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
  }
  
  // Log notifikasi yang dibuat
  console.log("Membuat notifikasi untuk:", prediksi.keyword, "dengan status:", status);
  
  return {
    judul: prediksi.keyword,
    pesan,
    status,
    dibaca: false,
    icon,
    userId,
    kategori: "harga",
    targetUrl: `/prediksi?keyword=${encodeURIComponent(prediksi.keyword)}`
  };
}



/**
 * Dapatkan ikon berdasarkan kategori
 */
function getIconForItem(kategori: string = ''): string {
  const lowerKategori = kategori.toLowerCase();
  
  if (lowerKategori.includes('beras') || lowerKategori.includes('padi')) return 'rice';
  if (lowerKategori.includes('telur')) return 'egg';
  if (lowerKategori.includes('cabai') || lowerKategori.includes('cabe')) return 'chili';
  if (lowerKategori.includes('minyak')) return 'oil';
  if (lowerKategori.includes('bawang')) return 'onion';
  if (lowerKategori.includes('gula')) return 'sugar';
  if (lowerKategori.includes('ayam') || lowerKategori.includes('daging')) return 'chicken';
  if (lowerKategori.includes('tomat')) return 'tomato';
  
  return 'package';
}
