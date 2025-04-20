"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { motion } from "framer-motion"
import { AnimatedContainer } from "@/components/ui/animated-container"

interface EventType {
  date: Date
  name: string
  type: "religious" | "national" | "international"
  description: string
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for seasonal events
  const events: EventType[] = [
    {
      date: new Date(2023, 11, 25), // December 25, 2023
      name: "Natal",
      type: "religious",
      description: "Perayaan Natal dengan permintaan tinggi untuk hampers, kue kering, dan hadiah.",
    },
    {
      date: new Date(2024, 0, 1), // January 1, 2024
      name: "Tahun Baru",
      type: "international",
      description: "Perayaan Tahun Baru dengan permintaan tinggi untuk souvenir, dekorasi, dan hampers.",
    },
    {
      date: new Date(2024, 1, 10), // February 10, 2024
      name: "Imlek",
      type: "religious",
      description: "Tahun Baru Imlek dengan permintaan tinggi untuk hampers, kue, dan dekorasi merah.",
    },
    {
      date: new Date(2024, 1, 14), // February 14, 2024
      name: "Valentine",
      type: "international",
      description: "Hari Valentine dengan permintaan tinggi untuk cokelat, bunga, dan hadiah pasangan.",
    },
    {
      date: new Date(2024, 2, 11), // March 11, 2024
      name: "Ramadhan (Perkiraan)",
      type: "religious",
      description: "Bulan Ramadhan dengan permintaan tinggi untuk makanan berbuka, parcel, dan kue lebaran.",
    },
    {
      date: new Date(2024, 3, 10), // April 10, 2024
      name: "Idul Fitri (Perkiraan)",
      type: "religious",
      description: "Hari Raya Idul Fitri dengan permintaan tinggi untuk parcel, kue lebaran, dan baju lebaran.",
    },
  ]

  // Find selected date event
  const selectedDateEvents = events.filter(
    (event) =>
      date &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear(),
  )

  // Function to highlight dates with events
  const isDayWithEvent = (day: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear(),
    )
  }

  return (
    
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Kalender Musiman</h2>
          <p className="text-muted-foreground">Jadwal event musiman dan rekomendasi persiapan produk</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedContainer animation="slide-up" delay={100}>
            <Card hover>
              <CardHeader>
                <CardTitle>Kalender Event</CardTitle>
                <CardDescription>Pilih tanggal untuk melihat detail event dan rekomendasi produk</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner text="Memuat kalender..." />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      modifiers={{
                        event: (date) => isDayWithEvent(date),
                      }}
                      modifiersStyles={{
                        event: {
                          fontWeight: "bold",
                          backgroundColor: "hsl(var(--primary) / 0.1)",
                          color: "hsl(var(--primary))",
                          borderRadius: "0",
                        },
                      }}
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer animation="slide-up" delay={200}>
            <Card hover>
              <CardHeader>
                <CardTitle>Detail Event</CardTitle>
                <CardDescription>Informasi event dan rekomendasi persiapan produk</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-6">
                    {selectedDateEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">{event.name}</h3>
                          <Badge
                            variant={
                              event.type === "religious"
                                ? "default"
                                : event.type === "national"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {event.type === "religious"
                              ? "Keagamaan"
                              : event.type === "national"
                                ? "Nasional"
                                : "Internasional"}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground">{event.description}</p>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Rekomendasi Persiapan:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Mulai produksi 3-4 minggu sebelum event</li>
                            <li>Siapkan pre-order 1 bulan sebelumnya</li>
                            <li>Tingkatkan promosi 2 minggu sebelum event</li>
                            <li>Persiapkan stok tambahan untuk permintaan mendadak</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Produk Potensial:</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.name === "Natal" && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Hampers Eco-friendly
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kue Kering Tema Korea
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Souvenir Handmade
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Dekorasi Natal
                                </Badge>
                              </>
                            )}
                            {event.name === "Tahun Baru" && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Souvenir Handmade
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Hampers Tahun Baru
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Dekorasi Pesta
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kalender Kreatif
                                </Badge>
                              </>
                            )}
                            {event.name === "Imlek" && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Hampers Merah
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kue Kering Tema Imlek
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Dekorasi Imlek
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Amplop Merah Kreatif
                                </Badge>
                              </>
                            )}
                            {event.name === "Valentine" && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Cokelat Handmade
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Hampers Pasangan
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kartu Ucapan Kreatif
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Gift Box Romantis
                                </Badge>
                              </>
                            )}
                            {event.name.includes("Ramadhan") && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Makanan Berbuka
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kue Lebaran
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Parcel Lebaran
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Dekorasi Ramadhan
                                </Badge>
                              </>
                            )}
                            {event.name.includes("Idul Fitri") && (
                              <>
                                <Badge variant="outline" className="hover-lift">
                                  Parcel Lebaran
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Kue Kering Lebaran
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Hampers Idul Fitri
                                </Badge>
                                <Badge variant="outline" className="hover-lift">
                                  Souvenir Lebaran
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center h-[300px] text-center"
                  >
                    <p className="text-muted-foreground">
                      Pilih tanggal dengan event untuk melihat detail dan rekomendasi produk
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      (Tanggal dengan event ditandai dengan warna berbeda di kalender)
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card hover>
            <CardHeader>
              <CardTitle>Timeline Persiapan Produk Musiman</CardTitle>
              <CardDescription>Jadwal rekomendasi untuk persiapan produk musiman</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="relative min-w-[600px]">
                <div className="absolute h-full w-px bg-border left-7 top-0" />

                <div className="space-y-8">
                  {[
                    {
                      time: "3 Bulan",
                      title: "Perencanaan Awal",
                      desc: "Mulai riset tren, desain produk, dan perencanaan bahan baku",
                    },
                    {
                      time: "2 Bulan",
                      title: "Persiapan Produksi",
                      desc: "Siapkan bahan baku, alat produksi, dan mulai uji coba produk",
                    },
                    {
                      time: "1 Bulan",
                      title: "Produksi & Pemasaran",
                      desc: "Mulai produksi batch pertama, buka pre-order, dan tingkatkan pemasaran",
                    },
                    {
                      time: "2 Minggu",
                      title: "Peak Production",
                      desc: "Produksi maksimal untuk memenuhi permintaan yang meningkat",
                    },
                    { time: "Event", title: "Hari H", desc: "Fokus pada pengiriman dan layanan pelanggan" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="relative pl-16"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border bg-background"
                      >
                        <span className="text-sm font-semibold">{item.time}</span>
                      </motion.div>
                      <div className="pt-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground mt-2">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
   
  )
}
