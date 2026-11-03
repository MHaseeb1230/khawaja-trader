import { Suspense } from "react";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm text-gray-400">Loading...</p>}>
      <RegisterForm />
    </Suspense>
  );
}
