import { Link, useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import { useState } from "react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/common/InputField";
import PasswordField from "../components/auth/PasswordField";
import PrimaryButton from "../components/common/PrimaryButton";

import { signup } from "../api/authApi";

export default function SignUp() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert(
        "Registration successful. Your account is pending admin approval."
      );

      navigate("/pending-approval");
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Register to access the Defence AI Assistant"
      >
        <div className="space-y-5">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            icon={<User size={18} />}
            value={formData.fullName}
            onChange={handleChange("fullName")}
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={handleChange("email")}
          />

          <InputField
            label="Username"
            placeholder="Choose a username"
            icon={<User size={18} />}
            value={formData.username}
            onChange={handleChange("username")}
          />

          <PasswordField
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange("password")}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </PrimaryButton>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-blue-500"
            >
              Sign In
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}