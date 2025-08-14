import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  department: string
  role: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      {/* Removed duplicate padding - now handled by DashboardLayout globally */}
      <div className="space-y-6">
        {/* Welcome Section - Enhanced */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                Welcome back, {user.name}!
              </h1>
              <p className="text-blue-100 text-base opacity-90">
                {user.department} • {user.role}
              </p>
            </div>
            <div className="text-center sm:text-right bg-white/10 rounded-lg p-4 sm:bg-transparent sm:p-0">
              <div className="text-3xl sm:text-4xl font-bold">850</div>
              <p className="text-blue-100">Total Points</p>
            </div>
          </div>
        </div>

        {/* Module Progress - Cleaned up */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-lg">📚</span>
              </div>
              Module Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-orange-500 text-white p-2 rounded-full">
                  <span className="text-sm">📖</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Introduction</p>
                  <p className="text-sm text-muted-foreground">
                    Basic concepts and overview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white rounded-full p-1">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section - Updated with better responsive grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <span className="text-lg">🏆</span>
                </div>
                Badges
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/rewards')}
                className="text-sm"
              >
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Improved responsive grid - follows global pattern */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              {/* Beginner Badge */}
              <div className="flex flex-col items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg transition-all hover:shadow-md hover:scale-105">
                <div className="bg-yellow-500 p-3 rounded-lg text-white mb-3 relative">
                  <span className="text-base">⭐</span>
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <p className="font-medium text-sm text-center">Beginner</p>
                <p className="text-xs text-green-600 mt-1 font-medium">Completed</p>
              </div>

              {/* Intermediate Badge */}
              <div className="flex flex-col items-center p-4 bg-green-50 border border-green-200 rounded-lg transition-all hover:shadow-md hover:scale-105">
                <div className="bg-green-500 p-3 rounded-lg text-white mb-3 relative">
                  <span className="text-base">🏆</span>
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <p className="font-medium text-sm text-center">Intermediate</p>
                <p className="text-xs text-green-600 mt-1 font-medium">Completed</p>
              </div>

              {/* Advanced Badge */}
              <div className="flex flex-col items-center p-4 bg-blue-50 border border-blue-200 rounded-lg transition-all hover:shadow-md hover:scale-105">
                <div className="bg-red-500 p-3 rounded-lg text-white mb-3 relative">
                  <span className="text-base">🎖️</span>
                </div>
                <p className="font-medium text-sm text-center">Advanced</p>
                <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs mt-1 font-medium">
                  60%
                </div>
              </div>

              {/* Expert Badge */}
              <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60 transition-all hover:shadow-md">
                <div className="bg-blue-500 p-3 rounded-lg text-white mb-3 relative">
                  <span className="text-base">🎯</span>
                </div>
                <p className="font-medium text-sm text-center text-gray-700">Expert</p>
                <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 mt-1">
                  <span className="text-xs">🔒</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Better responsive behavior */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold text-orange-600">7 days</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <span className="text-xl">🔥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">12/20</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="text-xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all hover:scale-105 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rank</p>
                  <p className="text-2xl font-bold text-purple-600">#42</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <span className="text-xl">🏅</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}