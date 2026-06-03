import { ProfileForm } from "@/components/profile/profile-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileForm />
    </AuthGuard>
  );
}
