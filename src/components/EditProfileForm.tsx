'use client'

import { Link, useNavigate } from "react-router-dom"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { UserPen, Upload, X } from 'lucide-react'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Updated form schema without password fields
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Role is required'),
})

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar?: string;
}

export default function EditProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      role: 'HR',
    },
  })

  // Function to fetch current user data from server
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      console.log('Fetching fresh user data from server...') // Debug log

      const response = await fetch('http://localhost:5000/api/hr/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        
        console.log('Fresh user data received:', userData) // Debug log
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        // Set form values
        form.reset({
          name: userData.name || '',
          email: userData.email || '',
          department: userData.department || '',
          role: userData.role || 'HR',
        })

        // Set preview image if exists - handle both absolute and relative paths
        if (userData.avatar) {
          const avatarUrl = userData.avatar.startsWith('http') 
            ? userData.avatar 
            : `http://localhost:5000${userData.avatar}`
          console.log('Setting avatar preview:', avatarUrl) // Debug log
          setPreviewImage(avatarUrl)
        } else {
          console.log('No avatar found in user data') // Debug log
          setPreviewImage(null)
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        console.error('Failed to fetch user data, status:', response.status)
        // Fallback to localStorage data
        loadUserDataFromStorage()
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Fallback to localStorage data
      loadUserDataFromStorage()
    }
  }

  // Fallback function to load from localStorage
  const loadUserDataFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        
        // Set form values
        form.reset({
          name: userData.name || '',
          email: userData.email || '',
          department: userData.department || '',
          role: userData.role || 'HR',
        })

        // Set preview image if exists
        if (userData.avatar) {
          const avatarUrl = userData.avatar.startsWith('http') 
            ? userData.avatar 
            : `http://localhost:5000${userData.avatar}`
          setPreviewImage(avatarUrl)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Error loading user data')
    }
  }

  // Load user data on component mount
  useEffect(() => {
    fetchUserData()
  }, [form, navigate])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, or GIF)')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setSelectedFile(null)
    if (user?.avatar) {
      const avatarUrl = user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:5000${user.avatar}`
      setPreviewImage(avatarUrl)
    } else {
      setPreviewImage(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get user initials for default avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error('User data not found')
      return
    }

    setIsLoading(true)
    
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData()
      
      // Add text fields
      formData.append('name', values.name)
      formData.append('email', values.email)
      formData.append('department', values.department)
      formData.append('role', values.role)
      
      // Add image file if selected
      if (selectedFile) {
        formData.append('profileImage', selectedFile)
        console.log('Uploading new profile image:', selectedFile.name) // Debug log
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/hr/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      console.log('Profile update response:', data) // Debug log

      if (response.ok) {
        // Update localStorage with new user data
        const updatedUser = { 
          ...user, 
          ...data.user,
          avatar: data.user.avatar || user.avatar // Keep the avatar path from response
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        
        // Update preview image with new avatar - handle both absolute and relative paths
        if (data.user.avatar) {
          const avatarUrl = data.user.avatar.startsWith('http') 
            ? data.user.avatar 
            : `http://localhost:5000${data.user.avatar}`
          setPreviewImage(avatarUrl)
          console.log('Profile picture updated successfully:', avatarUrl) // Debug log
        }
        
        // Dispatch a custom event to notify sidebar about user update
        window.dispatchEvent(new CustomEvent('userUpdated', { 
          detail: updatedUser 
        }))
        
        toast.success('Profile updated successfully!')
        
        // Clear selected file after successful update
        setSelectedFile(null)
        
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Edit Profile' }
  ]

  if (!user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BreadcrumbSeparator className="hidden md:block" />
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
                  <div>Loading...</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <BreadcrumbSeparator className="hidden md:block" />
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
                        <UserPen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h1 className="text-2xl font-bold">Edit Profile</h1>
                    </div>
                    <p className="text-gray-600">
                      Update your profile information.
                    </p>
                  </div>

                  <Card>
                    <CardContent className="pt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                          {/* Profile Picture Upload */}
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt="Profile"
                                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl border-4 border-gray-200">
                                  {getInitials(user.name)}
                                </div>
                              )}
                              
                              {selectedFile && (
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-center gap-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Photo
                              </Button>
                              <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                            </div>
                          </div>

                          {/* Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="name">Full Name</FormLabel>
                                <FormControl>
                                  <Input id="name" placeholder="John Doe" disabled={isLoading} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email */}
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@example.com"
                                    autoComplete="email"
                                    disabled={isLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Department */}
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="department">Department</FormLabel>
                                <FormControl>
                                  <Input
                                    id="department"
                                    placeholder="Human Resources"
                                    disabled={isLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Role - Fixed as HR */}
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="role">Role</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="role" 
                                    value="HR" 
                                    readOnly 
                                    className="cursor-not-allowed bg-gray-100" 
                                    disabled={isLoading}
                                    {...field} 
                                  />
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
                              onClick={() => navigate('/dashboard')}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                              {isLoading ? 'Updating...' : 'Update Profile'}
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
      </main>
    </SidebarProvider>
  )
}