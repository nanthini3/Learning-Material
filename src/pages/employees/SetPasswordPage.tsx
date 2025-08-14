// src/pages/employee/SetPasswordPage.tsx (Create this new file)
'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { toast } from "sonner"
import { Eye, EyeOff, Lock, User, CheckCircle } from "lucide-react"

export function EmployeeSetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  const token = searchParams.get('token')

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      toast.error('Invalid password setup link')
      navigate('/employee/login')
      return
    }

    verifyToken()
  }, [token, navigate])

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employee/verify-password-token/${token}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setIsValidToken(true)
        setEmployeeData(data.employee)
      } else {
        toast.error(data.message || 'Invalid or expired password setup link')
        navigate('/employee/login')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      toast.error('Failed to verify password setup link')
      navigate('/employee/login')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/employee/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Password set successfully! Redirecting to login...')
        
        // Redirect to employee login after password is set
        setTimeout(() => {
          navigate('/employee/login')
        }, 2000)
      } else {
        toast.error(data.message || 'Failed to set password')
      }
    } catch (error) {
      console.error('Set password error:', error)
      toast.error('Failed to set password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken && !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verifying password setup link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Set Your Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to the Learning Management System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {employeeData?.name}!
            </CardTitle>
            <CardDescription>
              Please set a secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <p><strong>Email:</strong> {employeeData?.email}</p>
                  <p><strong>Department:</strong> {employeeData?.department}</p>
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {formData.password && formData.confirmPassword && (
                <div className={`text-sm flex items-center gap-2 ${
                  formData.password === formData.confirmPassword 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  {formData.password === formData.confirmPassword 
                    ? 'Passwords match' 
                    : 'Passwords do not match'
                  }
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || formData.password !== formData.confirmPassword || formData.password.length < 8}
              >
                {isLoading ? 'Setting Password...' : 'Set Password & Continue'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                After setting your password, you'll be redirected to the login page to sign in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}