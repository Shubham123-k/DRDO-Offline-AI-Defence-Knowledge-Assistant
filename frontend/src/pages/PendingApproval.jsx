import { Clock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";

export default function PendingApproval() {
  return (
    <AuthLayout>
      <div className="max-w-lg rounded-3xl border border-yellow-500/30 bg-white/10 p-10 text-center backdrop-blur-xl">

        <Clock
          size={60}
          className="mx-auto mb-6 text-yellow-400"
        />

        <h1 className="mb-4 text-3xl font-bold">
          Registration Submitted
        </h1>

        <p className="text-gray-300">
          Your account has been created successfully.
        </p>

        <p className="mt-4 text-gray-400">
          Your account is currently waiting for
          administrator approval.
        </p>

        <p className="mt-2 text-gray-400">
          Once approved, you can sign in.
        </p>

      </div>
    </AuthLayout>
  );
}