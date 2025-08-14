import { ForgotPasswordForm } from "@/components/forgot-password-form";

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm className="w-full" />
      </div>
    </div>
  );
}

export default ForgotPasswordPage;