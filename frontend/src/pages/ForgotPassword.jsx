import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldQuestion, LockKeyhole, Mail, CheckCircle2, AlertTriangle } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/common/InputField";
import PasswordField from "../components/auth/PasswordField";
import PrimaryButton from "../components/common/PrimaryButton";

import { getSecurityQuestions, verifySecurityAnswers, resetPassword } from "../api/authApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [attemptMessage, setAttemptMessage] = useState("");

  const handleFindAccount = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getSecurityQuestions(
          email.trim()
        );

      setQuestions(
        response.data.questions
      );

      const initialAnswers = {};

      response.data.questions.forEach(
        (question) => {
          initialAnswers[
            question.id
          ] = "";
        }
      );

      setAnswers(initialAnswers);

      setStep(2);

    } catch (error) {
      setError(
        error?.response?.data?.detail ||
          "Unable to find account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswers = async () => {
    const emptyAnswer =
      questions.some(
        (question) =>
          !answers[
            question.id
          ]?.trim()
      );

    if (emptyAnswer) {
      setError(
        "Please answer all security questions."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAttemptMessage("");

      const response =
        await verifySecurityAnswers({
          email: email.trim(),
          answers,
        });

      setResetToken(
        response.data.reset_token
      );

      setStep(3);

    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        "Security verification failed.";

      setError(detail);

      setAttemptMessage(detail);

    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
      });

      setStep(4);

    } catch (error) {
      setError(
        error?.response?.data?.detail ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title={
          step === 1
            ? "Forgot Password?"
            : step === 2
            ? "Security Verification"
            : step === 3
            ? "Create New Password"
            : "Password Reset Complete"
        }
        subtitle={
          step === 1
            ? "Recover your DRDO AI Assistant account securely"
            : step === 2
            ? "Answer your security questions"
            : step === 3
            ? "Choose a new secure password"
            : "Your password has been changed successfully"
        }
      >
        <div className="space-y-5">

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {attemptMessage &&
            step === 2 && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-600">
                {attemptMessage}
              </div>
            )}

          {/* STEP 1 */}

          {step === 1 && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Mail size={30} />
              </div>

              <InputField
                label="Email"
                placeholder="Enter your registered email"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <PrimaryButton
                onClick={handleFindAccount}
                disabled={loading}
              >
                {loading
                  ? "Finding Account..."
                  : "Continue"}
              </PrimaryButton>
            </>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <ShieldQuestion size={30} />
              </div>

              <div className="space-y-4">

                {questions.map(
                  (question, index) => (
                    <div
                      key={question.id}
                      className="space-y-2"
                    >
                      <label className="text-sm font-semibold">
                        {index + 1}.{" "}
                        {question.question}
                      </label>

                      <input
                        type="text"
                        value={
                          answers[
                            question.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setAnswers(
                            (prev) => ({
                              ...prev,
                              [question.id]:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Enter your answer"
                        className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none transition focus:border-blue-500 dark:border-white/10"
                      />
                    </div>
                  )
                )}

              </div>

              <PrimaryButton
                onClick={
                  handleVerifyAnswers
                }
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify Answers"}
              </PrimaryButton>
            </>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                <LockKeyhole size={30} />
              </div>

              <PasswordField
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
              />

              <PasswordField
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <PrimaryButton
                onClick={
                  handleResetPassword
                }
                disabled={loading}
              >
                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}
              </PrimaryButton>
            </>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div className="space-y-5 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 size={42} />
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Password Reset Successful
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Your password has been changed.
                  You can now sign in using your
                  new password.
                </p>
              </div>

              <PrimaryButton
                onClick={() =>
                  navigate("/signin")
                }
              >
                Back to Sign In
              </PrimaryButton>

            </div>
          )}

          {step !== 4 && (
            <p className="text-center text-sm">
              Remember your password?{" "}

              <Link
                to="/signin"
                className="font-semibold text-blue-500 hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}

        </div>
      </AuthCard>
    </AuthLayout>
  );
}