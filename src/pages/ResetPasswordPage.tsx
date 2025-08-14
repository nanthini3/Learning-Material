import { ResetPasswordForm } from "@/components/reset-password-form";

function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm className="w-full" />
      </div>
    </div>
  );
}

export default ResetPasswordPage;