import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeAppSidebar } from "@/components/employee-app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const token = localStorage.getItem('userToken')
        const storedUserData = localStorage.getItem('userData')

        console.log('Token:', token)
        console.log('Stored User Data:', storedUserData)

        if (!token || !storedUserData) {
          console.log('No token or user data found, redirecting to login')
          navigate('/employee/login')
          return
        }

        const parsedUserData = JSON.parse(storedUserData)
        console.log('Parsed User Data:', parsedUserData)
        setUserData(parsedUserData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
        navigate('/employee/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAuth()
  }, [navigate])

  const handleLogout = () => {
    try {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      navigate('/employee/login')
    } catch (error) {
      console.error('Error during logout:', error)
      navigate('/employee/login')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No user data found. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <EmployeeAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/employee/dashboard">
                    Employee Portal
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Header Section */}
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome back, {userData.name || userData.email || 'User'}!
                </h1>
                <p className="text-blue-100 text-sm">
                  Employee • Learning Portal
                </p>
              </div>
             
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}