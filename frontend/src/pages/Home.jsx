import { ArrowRight, BrainCircuit, Database, LockKeyhole, Mic, Network, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import ParticleBackground from "../components/particles/ParticleBackground";
import useTheme from "../hooks/useTheme";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-black text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl ${
            isDark
              ? "bg-blue-600/[0.08]"
              : "bg-blue-500/[0.06]"
          }`}
        />

        <div
          className={`absolute -right-40 top-[45%] h-[400px] w-[400px] rounded-full blur-3xl ${
            isDark
              ? "bg-cyan-500/[0.05]"
              : "bg-cyan-500/[0.04]"
          }`}
        />

        <div
          className={`absolute -left-40 top-[65%] h-[350px] w-[350px] rounded-full blur-3xl ${
            isDark
              ? "bg-indigo-500/[0.05]"
              : "bg-indigo-500/[0.04]"
          }`}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <section className="relative flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 pb-20 pt-16 text-center">

          {/* System status */}
          <div
            className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md transition-all ${
              isDark
                ? "border-white/10 bg-white/[0.04] text-gray-300"
                : "border-gray-200 bg-white/70 text-gray-600 shadow-sm"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>

            Offline AI System
            <span
              className={
                isDark
                  ? "text-gray-600"
                  : "text-gray-300"
              }
            >
              •
            </span>

            <span
              className={
                isDark
                  ? "text-green-400"
                  : "text-green-600"
              }
            >
              Operational
            </span>
          </div>

          {/* Small label */}
          <div
            className={`mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${
              isDark
                ? "text-blue-400"
                : "text-blue-600"
            }`}
          >
            <ShieldCheck size={15} />

            Defence Knowledge Intelligence
          </div>

          {/* Main heading */}
          <h1
            className={`max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl ${
              isDark
                ? "text-white"
                : "text-gray-950"
            }`}
          >
            DRDO AI
            <span
              className={`block ${
                isDark
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              Assistant
            </span>
          </h1>

          {/* Description */}
          <p
            className={`mt-7 max-w-3xl text-base leading-7 sm:text-lg md:text-xl ${
              isDark
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            A secure, offline-first artificial intelligence
            platform designed to provide intelligent access
            to defence knowledge through
            <span
              className={`font-medium ${
                isDark
                  ? "text-gray-200"
                  : "text-gray-800"
              }`}
            >
              {" "}
              Retrieval-Augmented Generation
            </span>
            .
          </p>

          {/* Technology line */}
          <div
            className={`mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs ${
              isDark
                ? "text-gray-500"
                : "text-gray-500"
            }`}
          >
            <span>RAG</span>
            <span>•</span>
            <span>Local LLM</span>
            <span>•</span>
            <span>Offline STT</span>
            <span>•</span>
            <span>Secure Knowledge Base</span>
          </div>

          {/* CTA */}
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">

            <a
              href="/signin"
              className={`group flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all duration-200 ${
                isDark
                  ? "bg-white text-black shadow-lg shadow-white/10 hover:bg-gray-200"
                  : "bg-gray-950 text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800"
              }`}
            >
              Access AI Assistant

              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>

            <a
              href="#capabilities"
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-medium transition-all duration-200 ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07] hover:text-white"
                  : "border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Explore Capabilities
            </a>
          </div>
          <div
            className={`mt-14 grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border backdrop-blur-md sm:grid-cols-4 ${
              isDark
                ? "border-white/[0.08] bg-white/[0.025]"
                : "border-gray-200 bg-white/70 shadow-sm"
            }`}
          >
            <StatusItem
              icon={<LockKeyhole size={15} />}
              label="Secure"
              isDark={isDark}
            />

            <StatusItem
              icon={<Database size={15} />}
              label="Local Data"
              isDark={isDark}
            />

            <StatusItem
              icon={<Network size={15} />}
              label="Offline"
              isDark={isDark}
            />

            <StatusItem
              icon={<ShieldCheck size={15} />}
              label="Protected"
              isDark={isDark}
            />
          </div>
        </section>

        <section
          id="capabilities"
          className="relative px-6 pb-24"
        >
          <div className="mx-auto max-w-6xl">

            {/* Section heading */}
            <div className="mb-10 text-center">
              <p
                className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${
                  isDark
                    ? "text-blue-400"
                    : "text-blue-600"
                }`}
              >
                Core Capabilities
              </p>

              <h2
                className={`text-3xl font-bold tracking-tight sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Built for secure intelligence
              </h2>

              <p
                className={`mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base ${
                  isDark
                    ? "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                Intelligent tools designed around privacy,
                offline operation and controlled access to
                defence knowledge.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              <FeatureCard
                icon={<BrainCircuit size={20} />}
                title="RAG Intelligence"
                description="Retrieve relevant knowledge from authorized documents and generate context-aware answers."
                isDark={isDark}
              />

              <FeatureCard
                icon={<LockKeyhole size={20} />}
                title="Secure Knowledge"
                description="Access is controlled through authentication, user roles and document clearance levels."
                isDark={isDark}
              />

              <FeatureCard
                icon={<Mic size={20} />}
                title="Offline Voice"
                description="Convert spoken questions into text locally using an offline speech-to-text pipeline."
                isDark={isDark}
              />

              <FeatureCard
                icon={<Database size={20} />}
                title="Local Knowledge Base"
                description="Process and retrieve information from locally managed documents without relying on external cloud storage."
                isDark={isDark}
              />

              <FeatureCard
                icon={<ShieldCheck size={20} />}
                title="Audit & Security"
                description="Maintain controlled access and audit activity across the AI knowledge environment."
                isDark={isDark}
              />

              <FeatureCard
                icon={<Zap size={20} />}
                title="Offline AI"
                description="Run the core AI pipeline within a controlled local environment without requiring internet connectivity."
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        <footer
          className={`border-t px-6 py-8 ${
            isDark
              ? "border-white/[0.07]"
              : "border-gray-200"
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

            <div
              className={`flex items-center gap-2 text-xs ${
                isDark
                  ? "text-gray-500"
                  : "text-gray-500"
              }`}
            >
              <ShieldCheck size={14} />

              Offline Defence Knowledge Environment
            </div>

            <div
              className={`flex items-center gap-2 text-[11px] ${
                isDark
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              <Sparkles size={12} />

              AI-powered • Local-first • Secure
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StatusItem({
  icon,
  label,
  isDark,
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 border-b px-4 py-4 text-xs font-medium sm:border-b-0 sm:border-r last:border-0 ${
        isDark
          ? "border-white/[0.07] text-gray-400"
          : "border-gray-200 text-gray-600"
      }`}
    >
      <span
        className={
          isDark
            ? "text-gray-300"
            : "text-gray-700"
        }
      >
        {icon}
      </span>

      {label}
    </div>
  );
}


function FeatureCard({
  icon,
  title,
  description,
  isDark,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        isDark
          ? "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.045]"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
      }`}
    >
      {/* Hover glow */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 ${
          isDark
            ? "bg-blue-500/10"
            : "bg-blue-500/10"
        }`}
      />

      <div
        className={`relative mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${
          isDark
            ? "bg-blue-500/10 text-blue-400"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`relative text-base font-semibold ${
          isDark
            ? "text-white"
            : "text-gray-900"
        }`}
      >
        {title}
      </h3>

      <p
        className={`relative mt-2 text-sm leading-6 ${
          isDark
            ? "text-gray-500"
            : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}