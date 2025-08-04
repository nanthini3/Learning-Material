import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";

function LoginPage() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <div className="mb-4">

        </div>
        
        {/* Login Form */}
        <LoginForm className="w-full" />
      </div>
    </div>
  );
}

export default LoginPage;