import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deactivatedError, setDeactivatedError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingLogin = () => {
      try {
        const token = localStorage.getItem('userToken')
        const userData = localStorage.getItem('userData')
        
        if (token && userData) {
          console.log('User already logged in, redirecting...')
          navigate('/employee/dashboard', { replace: true })
        }
      } catch (error) {
        console.error('Error checking existing login:', error)
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
      }
    }

    checkExistingLogin()
  }, [navigate])

  const handleNavigateToHrLogin = () => {
    navigate('/login')
  }

  const handleNavigateToSetPassword = () => {
    navigate('/employee/set-password')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear deactivated error when user starts typing
    if (deactivatedError) {
      setDeactivatedError("")
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setDeactivatedError("") // Clear any previous deactivation error

    try {
      console.log('Attempting employee login with:', formData.email)
      
      // Use the correct employee login endpoint
      const response = await fetch('http://localhost:5000/api/employee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Non-JSON response received:', textResponse)
        throw new Error('Server returned an error. Please try again.')
      }

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok) {
        // Check if we have the required data
        if (!data.token) {
          throw new Error('No token received from server')
        }

        if (!data.user) {
          throw new Error('No user data received from server')
        }

        // Ensure user data has all necessary fields
        const completeUserData = {
          id: data.user.id || data.user._id || data.user.email,
          name: data.user.name || data.user.fullName || '',
          email: data.user.email || '',
          department: data.user.department || '',
          role: data.user.role || 'Employee',
          avatar: data.user.avatar || '',
          isActive: data.user.isActive !== false, // Default to true if not specified
          createdAt: data.user.createdAt || new Date().toISOString(),
          updatedAt: data.user.updatedAt || new Date().toISOString(),
          ...data.user // spread any additional fields
        }

        // Store the token and complete user data
        localStorage.setItem('userToken', data.token)
        localStorage.setItem('userData', JSON.stringify(completeUserData))
        
        console.log('Login successful, data stored')
        console.log('Token exists:', !!localStorage.getItem('userToken'))
        console.log('User data stored:', completeUserData)
        
        toast.success('Welcome back! Login successful!')
        
        // Force navigation after a small delay to ensure localStorage is set
        setTimeout(() => {
          console.log('Attempting navigation to dashboard...')
          navigate('/employee/dashboard', { replace: true })
          
          // Double-check navigation after another short delay
          setTimeout(() => {
            if (window.location.pathname !== '/employee/dashboard') {
              console.log('Navigation may have failed, forcing reload...')
              window.location.href = '/employee/dashboard'
            }
          }, 100)
        }, 100)
        
      } else {
        console.error('Login failed with response:', data)
        const errorMessage = data.message || data.error || 'Login failed'
        
        // Handle specific deactivation error
        if (response.status === 403 && 
            (errorMessage.toLowerCase().includes('deactivated') || 
             errorMessage.toLowerCase().includes('inactive'))) {
          
          setDeactivatedError(errorMessage)
          // Don't show toast for deactivated accounts, use the alert instead
        } else {
          // Show toast for other errors
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Employee login error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check if the server is running on port 5000.')
      } else if (error instanceof SyntaxError) {
        toast.error('Server returned invalid response. Please check server configuration.')
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to login. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Employee Login</CardTitle>
          </div>
          <CardDescription className="text-center">
            Login to access your learning dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Deactivated Account Alert */}
          {deactivatedError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Account Deactivated:</strong> {deactivatedError}
                <br />
                
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required 
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={handleNavigateToSetPassword}
                  className="text-blue-600 hover:underline underline-offset-4"
                  disabled={isLoading}
                >
                  First time? Set your password
                </button>
                <button
                  type="button"
                  onClick={handleNavigateToHrLogin}
                  className="text-gray-600 hover:underline underline-offset-4"
                  disabled={isLoading}
                >
                  HR Login
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !!deactivatedError}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">📚 Employee Access</p>
              <p>Access your learning modules, track progress, and earn rewards!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}