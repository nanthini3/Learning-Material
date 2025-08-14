import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Key, Eye, EyeOff } from 'lucide-react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Form schema for password change
const formSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function EmployeeChangePasswordPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    const checkUserAuth = () => {
      try {
        const token = localStorage.getItem('userToken')
        const storedUserData = localStorage.getItem('userData')

        if (!token || !storedUserData) {
          navigate('/employee/login')
          return
        }

        const parsedUserData = JSON.parse(storedUserData)
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('userToken')
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        navigate('/employee/login')
        return
      }

      const response = await fetch('http://localhost:5000/api/employee/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: values.newPassword,
        }),
      })

      const data = await response.json()
      console.log('Change password response:', data)

      if (response.ok) {
        toast.success("Password changed successfully!")
        
        // Clear form
        form.reset()
        
        // Redirect back to dashboard after success
        setTimeout(() => {
          navigate('/employee/dashboard')
        }, 1500)
      } else {
        toast.error(data.message || "Failed to change password")
      }
      
    } catch (error) {
      console.error('Change password error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check if the server is running.')
      } else {
        toast.error("Failed to change password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Employee Portal', href: '/employee/dashboard' },
    { label: 'Change Password' }
  ]

  if (loading) {
    return (
      <SidebarProvider>
        <EmployeeAppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <div className="flex flex-1 justify-center">
            <div className="w-full max-w-7xl">
              <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-7xl">
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
              <div className="flex min-h-[60vh] h-full w-full items-center justify-center px-4">
                <div className="mx-auto max-w-md w-full">
                  {/* External Header with Icon */}
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Key className="h-6 w-6 text-blue-600" />
                      </div>
                      <h1 className="text-2xl font-bold">Change Password</h1>
                    </div>
                    <p className="text-gray-600">
                      Update your password to keep your account secure.
                    </p>
                  </div>

                  <Card>
                    <CardContent className="pt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                          {/* New Password */}
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="new-password">New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      id="new-password"
                                      type={showNewPassword ? "text" : "password"}
                                      placeholder="Enter new password"
                                      disabled={isLoading}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      disabled={isLoading}
                                    >
                                      {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-gray-500">
                                  Password must be at least 8 characters long
                                </p>
                              </FormItem>
                            )}
                          />

                          {/* Confirm New Password */}
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="confirm-password">Confirm New Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      id="confirm-password"
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Confirm new password"
                                      disabled={isLoading}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      disabled={isLoading}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate('/employee/dashboard')}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                              {isLoading ? 'Changing Password...' : 'Change Password'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}