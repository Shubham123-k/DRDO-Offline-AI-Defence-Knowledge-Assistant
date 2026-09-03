import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, KeyRound, Sparkles, CircleHelp, RefreshCw } from "lucide-react";

import useTheme from "../hooks/useTheme";
import ThemeToggle from "../components/common/ThemeToggle";

import { getSecurityQuestions, verifySecurityAnswers, updateUserProfile } from "../api/profile";

export default function EditUser() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === "light";


  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [step, setStep] = useState(1);
  const [user, setUser] = useState(storedUser);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");


  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const MAX_ATTEMPTS = 3;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

  const attemptsExhausted = attemptsUsed >= MAX_ATTEMPTS;
  const [resetToken, setResetToken] = useState("");

  const [form, setForm] = useState({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordLength = form.new_password.length >= 8;

  const passwordsMatch =
    form.new_password.length > 0 &&
    form.new_password === form.confirm_password;

  const passwordEntered =
    form.new_password.length > 0 ||
    form.confirm_password.length > 0;

  useEffect(() => {
    if (!storedUser?.email) {
      navigate("/signin", {
        replace: true,
      });

      return;
    }

    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setSecurityLoading(true);
      setSecurityError("");

      const response =
        await getSecurityQuestions(
          storedUser.email
        );

      console.log(
        "Security questions response:",
        response.data
      );

      const receivedQuestions =
        response.data?.questions || [];

      if (!Array.isArray(receivedQuestions)) {
        setQuestions([]);

        setSecurityError(
          "Invalid security-question data received from the server."
        );

        return;
      }

      if (receivedQuestions.length !== 3) {
        setQuestions(receivedQuestions);

        if (receivedQuestions.length === 0) {
          setSecurityError(
            response.data?.detail ||
              "No security questions are configured for this account."
          );
        } else {
          setSecurityError(
            `Your account must have exactly 3 security questions configured. The server returned ${receivedQuestions.length}.`
          );
        }

        return;
      }

      const invalidQuestion =
        receivedQuestions.some(
          (question) =>
            !question?.id ||
            !question?.question
        );

      if (invalidQuestion) {
        setQuestions([]);

        setSecurityError(
          "The security questions returned by the server are invalid."
        );

        return;
      }

      setQuestions(receivedQuestions);

      setAnswers({});
    } catch (error) {
      console.error(
        "Unable to load security questions:",
        error
      );

      setQuestions([]);

      setSecurityError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load security questions."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleAnswerChange = (
    questionId,
    value
  ) => {

    if (attemptsExhausted) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    setSecurityError("");
  };

  const allQuestionsAnswered =
    questions.length === 3 &&
    questions.every(
      (question) =>
        typeof answers[question.id] === "string" &&
        answers[question.id].trim().length > 0
    );

  const verifySecurity = async () => {
    setSecurityError("");

    if (attemptsExhausted) {
      setSecurityError(
        "You have used all 3 verification attempts. Please contact the administrator or use the account recovery process."
      );

      return;
    }

    if (questions.length !== 3) {
      setSecurityError(
        "Exactly 3 security questions are required before verification."
      );

      return;
    }

    if (!allQuestionsAnswered) {
      setSecurityError(
        "Please answer all 3 security questions."
      );

      return;
    }

    try {
      setSecurityLoading(true);

      const currentAttempt =
        attemptsUsed + 1;

      setAttemptsUsed(currentAttempt);

      const response =
        await verifySecurityAnswers({
          email: storedUser.email,
          answers,
        });

      console.log(
        "Security verification response:",
        response.data
      );

      const token =
        response.data?.reset_token;

      if (!token) {
        throw new Error(
          "Security verification token was not returned."
        );
      }

      setResetToken(token);
      setSecurityError("");

      setStep(2);
    } catch (error) {
      console.error(
        "Security verification failed:",
        error
      );

      const responseData =
        error.response?.data || {};

      const backendRemaining =
        responseData.attempts_remaining ??
        responseData.remaining_attempts;

      if (
        typeof backendRemaining === "number"
      ) {
        const calculatedUsed =
          MAX_ATTEMPTS -
          Math.max(
            0,
            Math.min(
              MAX_ATTEMPTS,
              backendRemaining
            )
          );

        setAttemptsUsed(calculatedUsed);
      }

      const message =
        responseData.detail ||
        responseData.message ||
        error.message ||
        "Security verification failed.";

      setSecurityError(message);

      const lowerMessage =
        String(message).toLowerCase();

      if (
        lowerMessage.includes(
          "maximum"
        ) ||
        lowerMessage.includes(
          "too many"
        ) ||
        lowerMessage.includes(
          "attempts exhausted"
        ) ||
        lowerMessage.includes(
          "no attempts"
        ) ||
        lowerMessage.includes(
          "locked"
        )
      ) {
        setAttemptsUsed(MAX_ATTEMPTS);
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaveError("");
  };

  const saveChanges = async () => {
    setSaveError("");

    if (!form.username.trim()) {
      setSaveError(
        "Username cannot be empty."
      );

      return;
    }

    if (!form.email.trim()) {
      setSaveError(
        "Email cannot be empty."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      setSaveError(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      form.new_password ||
      form.confirm_password
    ) {
      if (!passwordLength) {
        setSaveError(
          "New password must contain at least 8 characters."
        );

        return;
      }

      if (!passwordsMatch) {
        setSaveError(
          "New password and confirm password do not match."
        );

        return;
      }
    }

    if (!resetToken) {
      setSaveError(
        "Security verification has expired. Please verify your identity again."
      );

      setStep(1);
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateUserProfile({
          reset_token: resetToken,

          username:
            form.username.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          new_password:
            form.new_password || null,

          confirm_password:
            form.confirm_password || null,
        });

      console.log(
        "Profile update response:",
        response.data
      );

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        );

        setUser(
          response.data.user
        );
      } else {

        const updatedUser = {
          ...user,
          username:
            form.username.trim(),
          email:
            form.email
              .trim()
              .toLowerCase(),
        };

        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser
          )
        );

        setUser(updatedUser);
      }

      if (
        response.data?.access_token
      ) {
        localStorage.setItem(
          "token",
          response.data.access_token
        );
      }

      setResetToken("");

      setSuccess(true);
    } catch (error) {
      console.error(
        "Unable to update profile:",
        error
      );

      setSaveError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const goBackToVerification =
    () => {
      setStep(1);
      setResetToken("");
      setSaveError("");

      setSecurityError("");
      setAnswers({});
    };

  if (success) {
    return (
      <div
        className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
          isLight
            ? "bg-gradient-to-br from-gray-50 via-white to-blue-50 text-black"
            : "bg-gradient-to-br from-[#050505] via-[#0B0B0B] to-[#111827] text-white"
        }`}
      >
        {/* Background glow */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Theme toggle */}
        <div className="absolute right-6 top-6 z-20">
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div
            className={`w-full max-w-xl rounded-3xl border p-10 text-center shadow-2xl backdrop-blur-xl ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#171717]/90"
            }`}
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2
                size={54}
                className="text-green-500"
              />
            </div>

            <h1 className="mt-7 text-3xl font-bold">
              User Updated Successfully
            </h1>

            <p
              className={`mx-auto mt-3 max-w-md ${
                isLight
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Your username, email and password
              information has been updated
              securely.
            </p>

            <div
              className={`mt-8 rounded-2xl border p-5 text-left ${
                isLight
                  ? "border-green-200 bg-green-50"
                  : "border-green-500/20 bg-green-500/5"
              }`}
            >
              <div className="flex gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-green-500"
                />

                <div>
                  <p className="font-semibold text-green-600">
                    Security verification completed
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isLight
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    All three security questions
                    were verified successfully before
                    your account information was changed.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <User size={19} />
              Return to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-5 py-8 transition-colors duration-300 sm:px-8 ${
        isLight
          ? "bg-gradient-to-br from-gray-50 via-white to-blue-50 text-black"
          : "bg-gradient-to-br from-[#050505] via-[#0B0B0B] to-[#151515] text-white"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() =>
              navigate("/profile")
            }
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
              isLight
                ? "hover:bg-gray-200"
                : "hover:bg-white/5"
            }`}
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>

          {/* Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden rounded-full border px-4 py-2 text-xs font-medium sm:flex ${
                isLight
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-green-500/20 bg-green-500/10 text-green-400"
              }`}
            >
              <ShieldCheck
                size={15}
                className="mr-2"
              />
              Secure Account Settings
            </div>

            <ThemeToggle />
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isLight
                  ? "bg-blue-100"
                  : "bg-blue-600/10"
              }`}
            >
              <KeyRound
                size={25}
                className="text-blue-500"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Edit User
              </h1>

              <p
                className={`mt-1 text-sm ${
                  isLight
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Securely manage your account
                information
              </p>
            </div>
          </div>
        </div>

        <div
          className={`mb-8 rounded-2xl border p-5 ${
            isLight
              ? "border-gray-200 bg-white shadow-sm"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <div className="flex items-center gap-4">

            <StepIndicator
              number="1"
              label="Verify Identity"
              active={step === 1}
              completed={step === 2}
              isLight={isLight}
            />

            <div
              className={`h-px flex-1 ${
                step === 2
                  ? "bg-blue-500"
                  : isLight
                    ? "bg-gray-200"
                    : "bg-white/10"
              }`}
            />

            <StepIndicator
              number="2"
              label="Edit Information"
              active={step === 2}
              completed={false}
              isLight={isLight}
            />

          </div>
        </div>

        {step === 1 && (
          <div
            className={`overflow-hidden rounded-3xl border shadow-xl ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#141414]"
            }`}
          >

            <div
              className={`border-b p-7 ${
                isLight
                  ? "border-gray-100"
                  : "border-white/10"
              }`}
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
                  <ShieldCheck
                    size={25}
                    className="text-blue-500"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    Verify Your Identity
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Answer all 3 security questions
                    correctly before changing account
                    information.
                  </p>
                </div>
              </div>

              <div
                className={`mt-5 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  attemptsExhausted
                    ? isLight
                      ? "border-red-200 bg-red-50"
                      : "border-red-500/20 bg-red-500/5"
                    : isLight
                      ? "border-amber-200 bg-amber-50"
                      : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={19}
                    className={`mt-0.5 shrink-0 ${
                      attemptsExhausted
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}
                  />

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        attemptsExhausted
                          ? isLight
                            ? "text-red-800"
                            : "text-red-300"
                          : isLight
                            ? "text-amber-800"
                            : "text-amber-300"
                      }`}
                    >
                      {attemptsExhausted
                        ? "Verification attempts exhausted"
                        : "Security verification required"}
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        attemptsExhausted
                          ? isLight
                            ? "text-red-700"
                            : "text-red-400"
                          : isLight
                            ? "text-amber-700"
                            : "text-amber-400"
                      }`}
                    >
                      {attemptsExhausted
                        ? "You have used all 3 attempts."
                        : `You have ${attemptsRemaining} of ${MAX_ATTEMPTS} attempts remaining.`}
                    </p>
                  </div>
                </div>

                {/* Attempt indicators */}
                <div className="flex gap-2">
                  {[1, 2, 3].map(
                    (attempt) => (
                      <div
                        key={attempt}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          attempt <= attemptsUsed
                            ? "bg-red-500 text-white"
                            : isLight
                              ? "bg-gray-200 text-gray-500"
                              : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {attempt}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-6 p-7">

              {/* Loading */}
              {securityLoading &&
              questions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

                  <p
                    className={`mt-4 text-sm ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Loading your security questions...
                  </p>
                </div>
              ) : questions.length === 0 ? (

                <div
                  className={`rounded-2xl border p-8 text-center ${
                    isLight
                      ? "border-red-200 bg-red-50"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle
                      size={27}
                      className="text-red-500"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    Security Questions Unavailable
                  </h3>

                  <p
                    className={`mx-auto mt-2 max-w-xl text-sm ${
                      isLight
                        ? "text-red-700"
                        : "text-red-400"
                    }`}
                  >
                    {securityError ||
                      "No security questions are configured for this account."}
                  </p>

                  <button
                    onClick={loadQuestions}
                    disabled={securityLoading}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={17}
                      className={
                        securityLoading
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Try Again
                  </button>
                </div>

              ) : (

                <>
                  {questions.map(
                    (question, index) => (
                      <div
                        key={question.id}
                        className={`rounded-2xl border p-5 transition ${
                          isLight
                            ? "border-gray-200 bg-gray-50"
                            : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        {/* Question header */}
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-500">
                            {index + 1}
                          </div>

                          <div className="flex gap-2">
                            <CircleHelp
                              size={19}
                              className="mt-0.5 shrink-0 text-blue-500"
                            />

                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                                Security Question{" "}
                                {index + 1}
                              </p>

                              <p className="mt-1 font-medium leading-6">
                                {question.question}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Answer */}
                        <input
                          type="text"
                          value={
                            answers[
                              question.id
                            ] || ""
                          }
                          onChange={(e) =>
                            handleAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          disabled={
                            attemptsExhausted ||
                            securityLoading
                          }
                          placeholder="Enter your answer"
                          autoComplete="off"
                          className={`w-full rounded-xl border px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isLight
                              ? "border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              : "border-white/10 bg-[#0D0D0D] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          }`}
                        />
                      </div>
                    )
                  )}

                  {questions.length !== 3 && (
                    <div
                      className={`rounded-2xl border p-4 ${
                        isLight
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-red-500/20 bg-red-500/5 text-red-400"
                      }`}
                    >
                      <div className="flex gap-3">
                        <AlertTriangle
                          size={19}
                          className="shrink-0"
                        />

                        <div>
                          <p className="font-medium">
                            Exactly 3 questions are required
                          </p>

                          <p className="mt-1 text-sm">
                            The server returned{" "}
                            {questions.length}{" "}
                            question
                            {questions.length !== 1
                              ? "s"
                              : ""}
                            . Please configure exactly
                            3 security questions for this
                            account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {securityError && (
                    <div
                      className={`rounded-2xl border p-4 ${
                        isLight
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-red-500/20 bg-red-500/5 text-red-400"
                      }`}
                    >
                      <div className="flex gap-3">
                        <AlertTriangle
                          size={19}
                          className="shrink-0"
                        />

                        <div>
                          <p className="font-medium">
                            Verification failed
                          </p>

                          <p className="mt-1 text-sm">
                            {securityError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {questions.length === 3 &&
                    !securityError &&
                    !attemptsExhausted && (
                      <div
                        className={`rounded-xl border p-4 ${
                          allQuestionsAnswered
                            ? isLight
                              ? "border-green-200 bg-green-50"
                              : "border-green-500/20 bg-green-500/5"
                            : isLight
                              ? "border-gray-200 bg-gray-50"
                              : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {allQuestionsAnswered ? (
                            <CheckCircle2
                              size={19}
                              className="text-green-500"
                            />
                          ) : (
                            <CircleHelp
                              size={19}
                              className="text-blue-500"
                            />
                          )}

                          <p
                            className={`text-sm ${
                              allQuestionsAnswered
                                ? "text-green-600"
                                : isLight
                                  ? "text-gray-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {allQuestionsAnswered
                              ? "All 3 security questions have been answered. You can verify your identity."
                              : "Please answer all 3 security questions before continuing."}
                          </p>
                        </div>
                      </div>
                    )}

                  <button
                    onClick={verifySecurity}
                    disabled={
                      securityLoading ||
                      questions.length !== 3 ||
                      !allQuestionsAnswered ||
                      attemptsExhausted
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {securityLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </>
                    ) : attemptsExhausted ? (
                      <>
                        <AlertTriangle size={19} />
                        Attempts Exhausted
                      </>
                    ) : (
                      <>
                        Verify All 3 Answers
                        <ArrowRight size={19} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div
            className={`overflow-hidden rounded-3xl border shadow-xl ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#141414]"
            }`}
          >

            <div
              className={`border-b p-7 ${
                isLight
                  ? "border-gray-100"
                  : "border-white/10"
              }`}
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle2
                    size={25}
                    className="text-green-500"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Update Account Information
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Identity verified successfully.
                    You can now update your account
                    information.
                  </p>
                </div>
              </div>

              {/* Verification status */}
              <div
                className={`mt-5 flex items-center gap-3 rounded-xl border p-4 ${
                  isLight
                    ? "border-green-200 bg-green-50"
                    : "border-green-500/20 bg-green-500/5"
                }`}
              >
                <ShieldCheck
                  size={20}
                  className="text-green-500"
                />

                <p
                  className={`text-sm ${
                    isLight
                      ? "text-green-700"
                      : "text-green-400"
                  }`}
                >
                  All 3 security questions were
                  answered correctly.
                </p>
              </div>
            </div>
            <div className="space-y-6 p-7">

              {/* Username */}
              <EditField
                icon={<User size={19} />}
                label="Username"
                description="Your display name"
                value={form.username}
                onChange={(e) =>
                  handleChange(
                    "username",
                    e.target.value
                  )
                }
                isLight={isLight}
              />

              {/* Email */}
              <EditField
                icon={<Mail size={19} />}
                label="Email Address"
                description="Your account email"
                value={form.email}
                type="email"
                onChange={(e) =>
                  handleChange(
                    "email",
                    e.target.value
                  )
                }
                isLight={isLight}
              />

              <div
                className={`rounded-2xl border p-5 ${
                  isLight
                    ? "border-gray-200 bg-gray-50"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Lock size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Change Password
                    </h3>

                    <p
                      className={`text-xs ${
                        isLight
                          ? "text-gray-500"
                          : "text-gray-500"
                      }`}
                    >
                      Leave both fields empty if you
                      don't want to change your password.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  {/* New password */}
                  <PasswordInput
                    label="New Password"
                    value={
                      form.new_password
                    }
                    visible={showPassword}
                    setVisible={
                      setShowPassword
                    }
                    onChange={(e) =>
                      handleChange(
                        "new_password",
                        e.target.value
                      )
                    }
                    isLight={isLight}
                  />

                  {/* Confirm password */}
                  <PasswordInput
                    label="Confirm New Password"
                    value={
                      form.confirm_password
                    }
                    visible={
                      showConfirmPassword
                    }
                    setVisible={
                      setShowConfirmPassword
                    }
                    onChange={(e) =>
                      handleChange(
                        "confirm_password",
                        e.target.value
                      )
                    }
                    isLight={isLight}
                  />

                  {/* Password rules */}
                  {passwordEntered && (
                    <div
                      className={`rounded-xl border p-4 ${
                        isLight
                          ? "border-gray-200 bg-white"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <PasswordRule
                        valid={passwordLength}
                        text="At least 8 characters"
                      />

                      <PasswordRule
                        valid={passwordsMatch}
                        text="Passwords match"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex gap-3 rounded-2xl border p-4 ${
                  isLight
                    ? "border-blue-200 bg-blue-50"
                    : "border-blue-500/20 bg-blue-500/5"
                }`}
              >
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <div>
                  <p className="font-semibold text-blue-600">
                    Secure Update
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isLight
                        ? "text-blue-800"
                        : "text-blue-300"
                    }`}
                  >
                    Your identity was verified using
                    all 3 security questions. The
                    verification token is temporary and
                    can only be used for this account
                    update.
                  </p>
                </div>
              </div>

              {saveError && (
                <div
                  className={`rounded-2xl border p-4 ${
                    isLight
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-red-500/20 bg-red-500/5 text-red-400"
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={19}
                      className="shrink-0"
                    />

                    <p className="text-sm">
                      {saveError}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                {/* Back */}

                <button
                  onClick={
                    goBackToVerification
                  }
                  disabled={saving}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLight
                      ? "border-gray-300 hover:bg-gray-100"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                {/* Save */}
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={19} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Sparkles size={13} />
          DRDO Offline Defence Knowledge Assistant
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
  isLight,
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
          completed
            ? "bg-green-500 text-white"
            : active
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : isLight
                ? "bg-gray-100 text-gray-400"
                : "bg-white/5 text-gray-500"
        }`}
      >
        {completed ? (
          <CheckCircle2 size={18} />
        ) : (
          number
        )}
      </div>

      <span
        className={`hidden text-sm font-medium sm:block ${
          active
            ? ""
            : isLight
              ? "text-gray-400"
              : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}


function EditField({
  icon,
  label,
  description,
  value,
  onChange,
  type = "text",
  isLight,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isLight
          ? "border-gray-200 bg-gray-50"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
          {icon}
        </div>

        <div>
          <label className="block font-semibold">
            {label}
          </label>

          <p className="text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={
          type === "email"
            ? "email"
            : "username"
        }
        className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
          isLight
            ? "border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            : "border-white/10 bg-[#0D0D0D] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        }`}
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  setVisible,
  onChange,
  isLight,
}) {
  return (
    <div>
      <label
        className={`mb-2 block text-sm font-medium ${
          isLight
            ? "text-gray-700"
            : "text-gray-300"
        }`}
      >
        {label}
      </label>

      <div className="relative">
        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          placeholder={label}
          className={`w-full rounded-xl border py-3 pl-4 pr-12 outline-none transition ${
            isLight
              ? "border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              : "border-white/10 bg-[#0D0D0D] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          }`}
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (prev) => !prev
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-blue-500"
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </div>
  );
}

function PasswordRule({
  valid,
  text,
}) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <CheckCircle2
        size={16}
        className={
          valid
            ? "text-green-500"
            : "text-gray-400"
        }
      />

      <span
        className={
          valid
            ? "text-green-500"
            : "text-gray-500"
        }
      >
        {text}
      </span>
    </div>
  );
}