import EnhancedDashboard from "@/components/enhanced-dashboard"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
        <EnhancedDashboard />
    </ProtectedRoute>
  )
}
