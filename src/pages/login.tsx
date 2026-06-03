import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <GuestGuard>
        <Suspense
          fallback={
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          }
        >
          <LoginForm />
        </Suspense>
      </GuestGuard>
    </div>
  );
}
