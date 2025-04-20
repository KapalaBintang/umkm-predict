"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  // Add other auth methods as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    // This could be a call to your API or checking localStorage
    const checkAuth = async () => {
      try {
        // Example: Check localStorage or cookies for auth token
        const token = localStorage.getItem("authToken")
        
        if (token) {
          // Example: Fetch user data from API
          // const response = await fetch("/api/user", {
          //   headers: { Authorization: `Bearer ${token}` }
          // })
          // const userData = await response.json()
          
          // For now, just mock a user
          setUser({
            id: "1",
            name: "User",
            email: "user@example.com"
          })
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Implement your login logic here
      // Example:
      // const response = await fetch("/api/login", {
      //   method: "POST",
      //   body: JSON.stringify({ email, password }),
      //   headers: { "Content-Type": "application/json" }
      // })
      // const data = await response.json()
      
      // Mock successful login
      setUser({
        id: "1",
        name: "User",
        email: email
      })
      
      // Store auth token
      localStorage.setItem("authToken", "mock-token")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      // Implement your logout logic here
      // Example:
      // await fetch("/api/logout", { method: "POST" })
      
      // Clear user data and token
      setUser(null)
      localStorage.removeItem("authToken")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}