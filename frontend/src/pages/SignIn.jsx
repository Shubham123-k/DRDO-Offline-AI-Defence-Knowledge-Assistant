import { Link, useNavigate } from "react-router-dom";
import { User, ShieldCheck, LockKeyhole, CheckCircle2, KeyRound, ArrowRight } from "lucide-react";
import { useState } from "react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/common/InputField";
import PasswordField from "../components/auth/PasswordField";
import PrimaryButton from "../components/common/PrimaryButton";
import RememberMe from "../components/auth/RememberMe";

import { login } from "../api/authApi";

export default function SignIn() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    const identifier = formData.identifier.trim();

    if (!identifier || !formData.password) {
      alert("Please enter your username/email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        identifier,
        password: formData.password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Login Successful!");

      if (
        response.data.user.role?.toLowerCase() === "admin"
      ) {
        navigate("/admin");
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Login failed:", error);

      alert(
        error?.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in securely to continue to the Defence AI Assistant"
      >
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-green-500/[0.06] px-4 py-3">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/10 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                <ShieldCheck size={20} />
              </div>

              <div className="flex-1">

                <div className="flex items-center gap-2">

                  <p className="text-sm font-semibold">
                    Secure Sign In
                  </p>

                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Protected
                  </span>

                </div>

                <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Authentication is protected by your local
                  security environment.
                </p>
              </div>
            </div>
          </div>

          <InputField
            label="Username or Email"
            placeholder="Enter username or email"
            icon={<User size={18} />}
            value={formData.identifier}
            onChange={handleChange("identifier")}
          />

          <PasswordField
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange("password")}
          />

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <LockKeyhole size={14} />

            <span>
              Never share your password with anyone.
            </span>

          </div>

          <div className="flex items-center justify-between">

            <RememberMe />
            <Link
              to="/forgotpassword"
              className="group flex items-center gap-1.5 text-sm font-medium text-blue-500 transition-all duration-200 hover:text-blue-600"
            >
              <KeyRound
                size={15}
                className="transition-transform duration-200 group-hover:-rotate-12"
              />
              <span>
                Forgot Password?
              </span>

              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />

            </Link>
          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
          >

            {loading ? (

              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Authenticating...

              </span>

            ) : (

              <span className="flex items-center justify-center gap-2">
                <ShieldCheck size={18} />
                Sign In Securely
              </span>
            )}

          </PrimaryButton>


          <div className="flex items-start gap-3 rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-3 py-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <KeyRound size={15} />
            </div>
            <div>

              <p className="text-xs font-semibold">
                Forgot your password?
              </p>

              <p className="mt-0.5 text-[11px] leading-5 text-gray-500 dark:text-gray-400">
                Use your registered security questions to
                securely recover your account.
              </p>
            </div>
          </div>


          <p className="pt-1 text-center text-sm text-gray-500 dark:text-gray-400">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-semibold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
            >
              Create Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
            <CheckCircle2 size={13} />

            <span>
              Offline Defence Knowledge Environment
            </span>

          </div>

        </div>
      </AuthCard>
    </AuthLayout>
  );
}