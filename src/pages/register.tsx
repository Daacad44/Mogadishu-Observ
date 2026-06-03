import { RegisterForm } from "@/components/auth/register-form";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function RegisterPage() {
  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <GuestGuard>
        <RegisterForm />
      </GuestGuard>
    </div>
  );
}
