import { UserLoginForm } from "@/components/user-login-form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserLoginPage() {
  const navigate = useNavigate()

  // Additional check at page level
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('userToken')
        const userData = localStorage.getItem('userData')
        
        if (token && userData) {
          console.log('User already authenticated, redirecting from page level...')
          navigate('/employee/dashboard', { replace: true })
        }
      } catch (error) {
        console.error('Error checking auth status on page load:', error)
        // Clear any corrupted data
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
      }
    }

    checkAuthStatus()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <UserLoginForm className="w-full" />
      </div>
    </div>
  );
}

export default UserLoginPage;