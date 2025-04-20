"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { motion } from "framer-motion"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { useIsMobile } from "@/hooks/use-mobile"

export default function UseLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar variant="desktop" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Mobile Header */}
          {isMobile && (
            <header className="flex items-center justify-between h-16 px-4 border-b md:hidden">
              <MobileNav />
              <div className="font-semibold flex items-center">
                <span className="bg-primary/10 p-1.5 rounded-lg mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </span>
                UMKM Insight
              </div>
            </header>
          )}

          {/* Page Content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto relative md:pl-72"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  )
}