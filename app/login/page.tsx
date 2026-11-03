import { Suspense } from "react";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm text-gray-400">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
