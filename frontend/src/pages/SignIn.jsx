import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
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
    email: "",
    password: "",
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: formData.email,
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

      navigate("/chat");

    } catch (error) {
      alert(
        error?.response?.data?.detail ||
        "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to continue securely"
      >
        <div className="space-y-5">

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={<User size={18} />}
            value={formData.email}
            onChange={handleChange("email")}
          />

          <PasswordField
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange("password")}
          />

          <div className="flex items-center justify-between">
            <RememberMe />

            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </PrimaryButton>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-500"
            >
              Create Account
            </Link>
          </p>

        </div>
      </AuthCard>
    </AuthLayout>
  );
}