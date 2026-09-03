import { Link, useNavigate } from "react-router-dom";
import { Mail, User, ShieldCheck, LockKeyhole,CheckCircle2, Circle, HelpCircle, KeyRound, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/common/InputField";
import PasswordField from "../components/auth/PasswordField";
import PrimaryButton from "../components/common/PrimaryButton";

import { signup } from "../api/authApi";
import useTheme from "../hooks/useTheme";


const SECURITY_QUESTIONS = [
  "What was the name of your first school?",
  "What is the name of your childhood best friend?",
  "What was the name of your first pet?",
  "What is your favorite childhood place?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "What was your first vehicle?",
  "What is your favorite book?",
  "What was the first concert you attended?",
];


export default function SignUp() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === "light";


  const [loading, setLoading] =
    useState(false);


  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });


  const [securityQuestions, setSecurityQuestions] =
    useState([
      {
        question: "",
        answer: "",
      },
      {
        question: "",
        answer: "",
      },
      {
        question: "",
        answer: "",
      },
    ]);

  const handleChange =
    (field) => (event) => {

      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

    };

  const handleSecurityQuestionChange =
    (index, field, value) => {

      setSecurityQuestions((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                [field]: value,
              }
            : item
        )
      );

    };

  const passwordChecks = useMemo(() => {

    const password =
      formData.password;

    return {
      length:
        password.length >= 8,

      uppercase:
        /[A-Z]/.test(password),

      lowercase:
        /[a-z]/.test(password),

      number:
        /[0-9]/.test(password),
    };

  }, [formData.password]);

  const passwordStrength = useMemo(() => {

    const checks =
      Object.values(passwordChecks)
        .filter(Boolean)
        .length;


    if (!formData.password) {

      return {
        label: "Enter a password",
        width: "w-0",
        color: "bg-gray-400",
      };

    }


    if (checks <= 1) {

      return {
        label: "Weak password",
        width: "w-1/4",
        color: "bg-red-500",
      };

    }


    if (checks === 2) {

      return {
        label: "Fair password",
        width: "w-2/4",
        color: "bg-orange-500",
      };

    }


    if (checks === 3) {

      return {
        label: "Good password",
        width: "w-3/4",
        color: "bg-yellow-500",
      };

    }


    return {
      label: "Strong password",
      width: "w-full",
      color: "bg-green-500",
    };

  }, [
    formData.password,
    passwordChecks,
  ]);

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password ===
      formData.confirmPassword;

  const strongPassword =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number;


  const securityQuestionsComplete =
    securityQuestions.every(
      (item) =>
        item.question.trim() !== "" &&
        item.answer.trim() !== ""
    );

  const hasDuplicateQuestions =
    securityQuestions.some(
      (item, index) =>
        item.question &&
        securityQuestions.some(
          (other, otherIndex) =>
            index !== otherIndex &&
            other.question === item.question
        )
    );

  const handleSubmit = async () => {

    const username =
      formData.username.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();


    // Basic validation
    if (
      !username ||
      !email ||
      !formData.password
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }

    if (
      formData.password.length < 8
    ) {

      alert(
        "Password must contain at least 8 characters."
      );

      return;
    }
    if (!strongPassword) {

      alert(
        "Please create a stronger password using uppercase, lowercase and numbers."
      );

      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      alert(
        "Passwords do not match."
      );

      return;
    }

    if (!securityQuestionsComplete) {
      alert(
        "Please select all 3 security questions and provide an answer for each."
      );

      return;
    }

    if (hasDuplicateQuestions) {
      alert(
        "Please select three different security questions."
      );

      return;
    }

    try {
      setLoading(true);

      await signup({
        username,
        email,
        password:
          formData.password,

        security_questions:
          securityQuestions.map(
            (item) => ({
              question:
                item.question.trim(),

              answer:
                item.answer.trim(),
            })
          ),

      });

      alert(
        "Registration successful. Your account is pending admin approval."
      );

      navigate(
        "/pending-approval"
      );

    } catch (error) {

      console.error(
        "Signup failed:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  const Requirement =
    ({ valid, children }) => (

      <div
        className={`flex items-center gap-2 text-xs transition-colors ${
          valid
            ? "text-green-500"
            : isLight
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >

        {valid ? (
          <CheckCircle2
            size={14}
          />
        ) : (
          <Circle
            size={14}
          />
        )}

        <span>
          {children}
        </span>
      </div>
    );

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Register securely to access the Defence AI Assistant"
      >
        <div className="space-y-5">
          <div
            className={`relative overflow-hidden rounded-2xl border px-4 py-3 transition-colors duration-300 ${
              isLight
                ? "border-blue-200 bg-blue-50"
                : "border-blue-500/20 bg-blue-500/[0.06]"
            }`}
          >
            <div
              className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-xl ${
                isLight
                  ? "bg-blue-400/20"
                  : "bg-blue-500/10"
              }`}
            />

            <div className="relative flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isLight
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-600/10 text-blue-400"
                }`}
              >
                <ShieldCheck
                  size={19}
                />
              </div>
              <div>

                <p
                  className={`text-sm font-semibold ${
                    isLight
                      ? "text-gray-900"
                      : "text-white"
                  }`}
                >
                  Secure Defence Access
                </p>

                <p
                  className={`mt-0.5 text-xs leading-5 ${
                    isLight
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  Your account will require administrator
                  approval before access is granted.
                </p>
              </div>
            </div>
          </div>

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            icon={
              <User size={18} />
            }
            value={
              formData.fullName
            }
            onChange={
              handleChange("fullName")
            }
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={
              <Mail size={18} />
            }
            value={
              formData.email
            }
            onChange={
              handleChange("email")
            }
          />

          <InputField
            label="Username"
            placeholder="Choose a unique username"
            icon={
              <User size={18} />
            }
            value={
              formData.username
            }
            onChange={
              handleChange("username")
            }
          />

          <div>
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              value={
                formData.password
              }
              onChange={
                handleChange("password")
              }
            />


            {/* Password Strength */}
            {formData.password && (

              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wider ${
                      isLight
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Password strength
                  </span>

                  <span
                    className={`text-xs font-medium ${
                      strongPassword
                        ? "text-green-500"
                        : isLight
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {
                      passwordStrength.label
                    }
                  </span>
                </div>

                <div
                  className={`h-1.5 overflow-hidden rounded-full ${
                    isLight
                      ? "bg-gray-200"
                      : "bg-white/10"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.width} ${passwordStrength.color}`}
                  />

                </div>
              </div>
            )}
          </div>

          {formData.password && (
            <div
              className={`rounded-xl border p-3 transition-colors duration-300 ${
                isLight
                  ? "border-gray-200 bg-gray-50"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <LockKeyhole
                  size={14}
                  className={
                    isLight
                      ? "text-gray-500"
                      : "text-gray-400"
                  }
                />
                <span
                  className={`text-xs font-semibold ${
                    isLight
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  Password requirements
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">

                <Requirement
                  valid={
                    passwordChecks.length
                  }
                >
                  At least 8 characters
                </Requirement>

                <Requirement
                  valid={
                    passwordChecks.uppercase
                  }
                >
                  One uppercase letter
                </Requirement>

                <Requirement
                  valid={
                    passwordChecks.lowercase
                  }
                >
                  One lowercase letter
                </Requirement>

                <Requirement
                  valid={
                    passwordChecks.number
                  }
                >
                  One number
                </Requirement>

              </div>
            </div>
          )}

          <div>
            <PasswordField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={
                formData.confirmPassword
              }
              onChange={
                handleChange(
                  "confirmPassword"
                )
              }
            />

            {formData.confirmPassword && (
              <div
                className={`mt-2 flex items-center gap-1.5 text-xs ${
                  passwordsMatch
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >

                {passwordsMatch ? (
                  <CheckCircle2
                    size={14}
                  />
                ) : (
                  <AlertCircle
                    size={14}
                  />
                )}

                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match"}

              </div>
            )}
          </div>

          <div
            className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
              isLight
                ? "border-blue-200 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >
            {/* Recovery Header */}
            <div
              className={`border-b px-4 py-4 ${
                isLight
                  ? "border-blue-100 bg-blue-50/70"
                  : "border-white/10 bg-blue-500/[0.05]"
              }`}
            >

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isLight
                      ? "bg-blue-100 text-blue-600"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >

                  <HelpCircle
                    size={21}
                  />

                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        isLight
                          ? "text-gray-900"
                          : "text-white"
                      }`}
                    >
                      Account Recovery
                    </h3>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isLight
                          ? "bg-blue-100 text-blue-600"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      Required
                    </span>
                  </div>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Set three security questions to
                    recover your account if you forget
                    your password.
                  </p>
                </div>
              </div>
            </div>

            {/* Recovery Information */}
            <div className="px-4 pt-4">
              <div
                className={`flex items-start gap-2 rounded-xl border px-3 py-3 ${
                  isLight
                    ? "border-amber-200 bg-amber-50"
                    : "border-amber-500/20 bg-amber-500/[0.06]"
                }`}
              >

                <ShieldCheck
                  size={15}
                  className={`mt-0.5 shrink-0 ${
                    isLight
                      ? "text-amber-600"
                      : "text-amber-400"
                  }`}
                />

                <p
                  className={`text-[11px] leading-5 ${
                    isLight
                      ? "text-amber-700"
                      : "text-amber-300/80"
                  }`}
                >
                  Choose questions whose answers you can
                  remember. Your answers are securely stored
                  using one-way password hashing and are used
                  only for password recovery.
                </p>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4">
              {securityQuestions.map(
                (item, index) => (

                  <div
                    key={index}
                    className={`rounded-2xl border p-3 transition-all duration-300 ${
                      isLight
                        ? "border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/30"
                        : "border-white/10 bg-[#202020] hover:border-white/20 hover:bg-[#242424]"
                    }`}
                  >

                    {/* Question Number */}
                    <div className="mb-3 flex items-center gap-2">

                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${
                          isLight
                            ? "bg-blue-100 text-blue-600"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          isLight
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        Security Question{" "}
                        {index + 1}
                      </span>
                    </div>

                    {/* Question Select */}
                    <div className="relative">
                      <select
                        value={
                          item.question
                        }
                        onChange={(e) =>
                          handleSecurityQuestionChange(
                            index,
                            "question",
                            e.target.value
                          )
                        }
                        disabled={loading}
                        className={`w-full appearance-none rounded-xl border px-3 py-3 pr-10 text-sm outline-none transition-all duration-200 ${
                          isLight
                            ? "border-gray-300 bg-white text-gray-800 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            : "border-white/10 bg-[#1B1B1B] text-gray-200 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        } ${
                          item.question
                            ? ""
                            : isLight
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >

                        <option
                          value=""
                          disabled
                        >
                          Select a security question
                        </option>

                        {SECURITY_QUESTIONS.map(
                          (question) => {

                            const alreadyUsed =
                              securityQuestions.some(
                                (q, qIndex) =>
                                  qIndex !== index &&
                                  q.question ===
                                    question
                              );

                            return (
                              <option
                                key={question}
                                value={question}
                                disabled={
                                  alreadyUsed
                                }
                              >
                                {question}
                              </option>
                            );

                          }
                        )}

                      </select>

                      {/* Dropdown Arrow */}
                      <div
                        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                          isLight
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>

                    </div>

                    {/* Answer */}
                    <div className="relative mt-3">

                      <KeyRound
                        size={17}
                        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                          isLight
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />

                      <input
                        type="text"
                        value={
                          item.answer
                        }
                        onChange={(e) =>
                          handleSecurityQuestionChange(
                            index,
                            "answer",
                            e.target.value
                          )
                        }
                        disabled={loading}
                        placeholder="Enter your answer"
                        autoComplete="off"
                        className={`w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none transition-all duration-200 ${
                          isLight
                            ? "border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            : "border-white/10 bg-[#1B1B1B] text-gray-200 placeholder:text-gray-500 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        }`}
                      />

                    </div>
                  </div>

                )
              )}
            </div>

            {/* Security Footer */}
            <div
              className={`flex items-center gap-2 border-t px-4 py-3 ${
                isLight
                  ? "border-gray-200 bg-gray-50 text-gray-500"
                  : "border-white/10 bg-white/[0.02] text-gray-500"
              }`}
            >

              <ShieldCheck
                size={14}
                className={
                  isLight
                    ? "text-green-600"
                    : "text-green-500"
                }
              />

              <span className="text-[11px]">
                Security answers are protected with
                one-way password hashing.
              </span>
            </div>

          </div>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={
              loading ||
              !securityQuestionsComplete
            }
          >

            {loading ? (

              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating Account...
              </span>

            ) : (

              <span className="flex items-center justify-center gap-2">
                <ShieldCheck
                  size={18}
                />
                Create Secure Account
              </span>
            )}

          </PrimaryButton>

          <p
            className={`pt-1 text-center text-sm ${
              isLight
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>

          <div
            className={`flex items-center justify-center gap-2 pt-1 text-[11px] ${
              isLight
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >

            <ShieldCheck
              size={13}
            />

            <span>
              Protected Defence Environment
            </span>
          </div>
        </div>

      </AuthCard>
    </AuthLayout>

  );
}