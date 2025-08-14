import { SetPasswordForm } from "@/components/set-password-form";

function SetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        <SetPasswordForm className="w-full" />
      </div>
    </div>
  );
}

export default SetPasswordPage;