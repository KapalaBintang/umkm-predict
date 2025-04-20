"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"
import { MobileNav } from "./mobile-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { PageTransition } from "./ui/page-transition"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"

interface ResponsiveLayoutProps {
  children: ReactNode
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()

  // In a real app, you would get this from cookies on the server
  const defaultOpen = true

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen bg-background transition-all duration-300 ease-in-out">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar variant="desktop" />
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <div className="md:hidden">
            <AppSidebar variant="mobile" onNavItemClick={() => setOpenMobile(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header with Hamburger */}
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

          {/* Desktop Header with Sidebar Toggle */}
          <header className="hidden md:flex items-center h-16 px-4 border-b">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">{/* Add any header icons/buttons here */}</div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
