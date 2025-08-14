import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { UserPen, Upload, X } from "lucide-react"
import { toast } from "sonner"

export default function EmployeeEditProfilePage() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
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
        
        // Initialize form with existing data
        setFormData({
          name: parsedUserData.name || "",
          email: parsedUserData.email || "",
          department: parsedUserData.department || "",
        })
        
        // Load profile image if exists
        const savedImage = localStorage.getItem(`profileImage_${parsedUserData.id || parsedUserData.email}`)
        if (savedImage) {
          setPreviewImage(savedImage)
        }
        
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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

  const removeImage = () => {
    setSelectedFile(null)
    // Reset to original image if exists
    const savedImage = localStorage.getItem(`profileImage_${userData?.id || userData?.email}`)
    if (savedImage) {
      setPreviewImage(savedImage)
    } else {
      setPreviewImage("")
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('userToken')
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        navigate('/employee/login')
        return
      }

      // Create FormData for multipart/form-data (to handle image upload)
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('department', formData.department)
      
      // Add image file if selected
      if (selectedFile) {
        formDataToSend.append('profileImage', selectedFile)
      }

      const response = await fetch(`http://localhost:5000/api/employee/profile/${userData.id || userData.email}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      console.log('Profile update response:', data)

      if (response.ok) {
        // Update user data with server response
        const updatedUserData = {
          ...userData,
          ...data.user,
          avatar: data.user.avatar || userData.avatar
        }

        // Update localStorage with new user data
        localStorage.setItem('userData', JSON.stringify(updatedUserData))
        setUserData(updatedUserData)

        // Update preview image if new avatar was uploaded
        if (data.user.avatar) {
          const avatarUrl = data.user.avatar.startsWith('http') 
            ? data.user.avatar 
            : `http://localhost:5000${data.user.avatar}`
          setPreviewImage(avatarUrl)
          // Also save to localStorage for offline access
          localStorage.setItem(`profileImage_${userData.id || userData.email}`, avatarUrl)
        } else if (selectedFile && previewImage) {
          // If no server avatar but we have a local image, save it
          localStorage.setItem(`profileImage_${userData.id || userData.email}`, previewImage)
        }

        // Trigger custom event to notify sidebar to update
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { 
            userData: updatedUserData, 
            profileImage: data.user.avatar ? (data.user.avatar.startsWith('http') ? data.user.avatar : `http://localhost:5000${data.user.avatar}`) : previewImage
          }
        }))

        toast.success('Profile updated successfully!')
        
        // Clear selected file after successful update
        setSelectedFile(null)
        
        // Redirect back to dashboard after a short delay
        setTimeout(() => {
          navigate('/employee/dashboard')
        }, 1500)
        
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check if the server is running.')
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const breadcrumbs = [
    { label: 'Employee Portal', href: '/employee/dashboard' },
    { label: 'Edit Profile' }
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
                      <div className="flex flex-col gap-6">
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
                              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl border-4 border-gray-200">
                                {getInitials(formData.name || userData.email || 'E')}
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
                              disabled={saving}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </Button>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-4">
                          {/* Full Name */}
                          <div className="grid gap-3">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={saving}
                              required
                            />
                          </div>

                          {/* Email */}
                          <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={saving}
                              required
                            />
                          </div>

                          {/* Department */}
                          <div className="grid gap-3">
                            <Label htmlFor="department">Department</Label>
                            <Input
                              id="department"
                              name="department"
                              type="text"
                              placeholder="Enter your department"
                              value={formData.department}
                              onChange={handleInputChange}
                              disabled={saving}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => navigate('/employee/dashboard')}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSave}
                            className="flex-1" 
                            disabled={saving}
                          >
                            {saving ? 'Updating...' : 'Update Profile'}
                          </Button>
                        </div>
                      </div>
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