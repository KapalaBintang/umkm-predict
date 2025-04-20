"use client"

import { Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface Event {
  id: number
  title: string
  date: string
  time: string
}

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
    return new Date(dateString).toLocaleDateString("id-ID", options)
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Tidak ada event mendatang</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(event.date)}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
