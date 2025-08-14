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
import { useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Mail, Send } from "lucide-react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Sending request to:', 'http://localhost:5000/api/hr/forgot-password');
      console.log('Email:', email);

      const response = await fetch('http://localhost:5000/api/hr/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('Response status:', response.status);
      const data = await response.json()
      console.log('Response data:', data);

      if (response.ok) {
        setEmailSent(true)
        toast.success('Reset link sent to your email!')
      } else {
        // Handle different error status codes
        if (response.status === 400 && data.error === 'EMAIL_NOT_REGISTERED') {
          toast.error('❌ The email you entered is not registered. Please check your email and try again.')
        } else if (response.status === 404) {
          toast.error('❌ The email you entered is not registered. Please check your email and try again.')
        } else if (response.status === 400) {
          toast.error(data.message || 'Please enter a valid email address.')
        } else {
          toast.error(data.message || 'Failed to send reset email. Please try again.')
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Failed to send reset email. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/hr/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Reset link sent again to your email!')
      } else {
        const data = await response.json()
        if (response.status === 400 && data.error === 'EMAIL_NOT_REGISTERED') {
          toast.error('❌ The email you entered is not registered. Please check your email and try again.')
        } else {
          toast.error(data.message || 'Failed to resend email.')
        }
      }
    } catch (error) {
      console.error('Resend email error:', error)
      toast.error('Failed to resend email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLogin}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>
                {emailSent ? 'Check your email' : 'Forgot your password?'}
              </CardTitle>
              <CardDescription>
                {emailSent 
                  ? `We've sent a password reset link to ${email}`
                  : 'Enter your email address and we\'ll send you a link to reset your password'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If an account with this email exists, you'll receive a password reset link shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          {!emailSent && (
            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <button 
                type="button" 
                onClick={handleBackToLogin}
                className="underline underline-offset-4 hover:text-primary text-blue-600"
              >
                Back to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}