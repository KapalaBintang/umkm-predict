"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"
import { useState, useEffect } from "react"
import NotificationDropdown from "./notification-dropdown"
import { motion, AnimatePresence } from "framer-motion"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full hover:bg-primary/10 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="p-0 w-[300px] border-r-0 rounded-r-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <AnimatePresence mode="wait">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 350,
                damping: 30
              }}
            >
              <AppSidebar variant="mobile" onNavItemClick={() => setOpen(false)} />
            </motion.div>
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      <div className="md:hidden">
        <NotificationDropdown />
      </div>
    </div>
  )
}
