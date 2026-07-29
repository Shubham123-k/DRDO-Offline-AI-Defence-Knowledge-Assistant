import { useMemo, useState } from "react";
import {
  BookOpen,
  Shield,
  Mail,
  HelpCircle,
  Info,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useTheme from "../hooks/useTheme";
import ThemeToggle from "../components/common/ThemeToggle";
import ParticleBackground from "../components/particles/ParticleBackground";

import FAQItem from "../components/help/FAQItem";
import HelpCard from "../components/help/HelpCard";
import QuickAction from "../components/help/QuickAction";
import SearchBar from "../components/help/SearchBar";

export default function Help() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [search, setSearch] = useState("");

  const faqs = [
    {
      question: "How do I upload documents?",
      answer:
        "Open the Documents section and click Upload Document. Only supported file types can be uploaded.",
    },
    {
      question: "What are clearance levels?",
      answer:
        "The system supports Public, Confidential and Secret clearance levels. Access depends on your assigned clearance.",
    },
    {
      question: "Why can't I access Secret documents?",
      answer:
        "Only users with Secret clearance assigned by the Administrator can access Secret documents.",
    },
    {
      question: "How can I change my password?",
      answer:
        "Open Profile or Settings and choose Change Password once the backend feature is enabled.",
    },
    {
      question: "Why is my account pending?",
      answer:
        "Every newly registered account must be approved by the Administrator before it can log in.",
    },
    {
      question: "Can I delete my account?",
      answer:
        "Yes. Open Settings → Danger Zone → Delete Account.",
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
  <div
    className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
      theme === "light"
        ? "bg-gradient-to-b from-gray-100 via-gray-50 to-white"
        : "bg-gradient-to-br from-[#050505] via-[#0B0B0B] to-[#151515]"
    }`}
  >
    {/* =========================== */}
    {/* Background Effects */}
    {/* =========================== */}

    {theme === "dark" && (
      <>
        <div className="absolute inset-0 opacity-40">
          <ParticleBackground />
        </div>

        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[180px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </>
    )}

    <div className="relative z-10 mx-auto max-w-7xl px-8 py-12">

      {/* Header */}

      <div className="mb-14 flex items-center justify-between">

        <div className="flex items-center gap-5">

          <button
            onClick={() => navigate("/chat")}
            className={`rounded-2xl border p-3 transition-all duration-300 hover:scale-105 ${
              theme === "light"
                ? "border-gray-300 bg-white shadow hover:bg-gray-100"
                : "border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10"
            }`}
          >
            ←
          </button>

          <div>

            <h1 className="text-5xl font-bold">
              Help Center
            </h1>

            <p
              className={`mt-3 text-lg ${
                theme === "light"
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              Find answers, learn the platform, and resolve common issues.
            </p>

          </div>

        </div>

        <ThemeToggle />

      </div>

      {/* Search */}

      <div
        className={`mb-12 rounded-3xl border p-6 backdrop-blur-xl ${
          theme === "light"
            ? "border-gray-200 bg-white shadow-xl"
            : "border-white/10 bg-[#171717]/75"
        }`}
      >
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Actions */}

      <div className="mb-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <QuickAction
          icon={<BookOpen size={34} />}
          title="User Guide"
          subtitle="Learn every feature of the DRDO AI Assistant."
          onClick={() =>
            alert("User Guide coming soon.")
          }
        />

        <QuickAction
          icon={<HelpCircle size={34} />}
          title="FAQs"
          subtitle="Frequently asked questions."
          onClick={() =>
            document
              .getElementById("faq")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        />

        <QuickAction
          icon={<Shield size={34} />}
          title="Security"
          subtitle="Security recommendations."
          onClick={() =>
            document
              .getElementById("security")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        />

        <QuickAction
          icon={<Mail size={34} />}
          title="Contact Admin"
          subtitle="Need additional help?"
          onClick={() => {

            navigator.clipboard.writeText(
              "support@drdo.local"
            );

            alert(
              "Administrator email copied."
            );

          }}
        />

      </div>

      {/* FAQ */}

      <div id="faq">

        <HelpCard title="Frequently Asked Questions">

          <div className="space-y-5">

            {filteredFaqs.length === 0 ? (

              <div className="py-12 text-center text-gray-500">

                No help topics found.

              </div>

            ) : (

              filteredFaqs.map((faq) => (

                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />

              ))

            )}

          </div>

        </HelpCard>

      </div>

      {/* Security */}

      <div
        id="security"
        className="mt-12"
      >

        <HelpCard title="Security Best Practices">

          <ul className="space-y-5 text-lg">

            <li>
              ✅ Never share your account credentials.
            </li>

            <li>
              ✅ Always logout after your session.
            </li>

            <li>
              ✅ Upload documents using the correct classification.
            </li>

            <li>
              ✅ Report suspicious activities to the Administrator.
            </li>

            <li>
              ✅ Keep Secret documents within authorized systems only.
            </li>

          </ul>

        </HelpCard>

      </div>

      {/* System */}

      <div className="mt-12">

        <HelpCard title="System Information">

          <div className="grid gap-6 md:grid-cols-2">

            <InfoRow
              title="Application"
              value="DRDO AI Assistant"
            />

            <InfoRow
              title="Version"
              value="v1.0"
            />

            <InfoRow
              title="Frontend"
              value="React + TailwindCSS"
            />

            <InfoRow
              title="Backend"
              value="FastAPI"
            />

            <InfoRow
              title="LLM"
              value="Gemma 4 (Ollama)"
            />

            <InfoRow
              title="Vector Database"
              value="ChromaDB"
            />

          </div>

        </HelpCard>

      </div>

      {/* Contact */}

      <div className="mt-12">

        <HelpCard title="Need More Help?">

          <p
            className={`mb-8 text-lg ${
              theme === "light"
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            If you are unable to resolve your issue using this Help Center,
            please contact your DRDO System Administrator.
          </p>

          <button
            onClick={() => {

              navigator.clipboard.writeText(
                "support@drdo.local"
              );

              alert("Administrator email copied.");

            }}
            className="rounded-2xl bg-blue-600 px-8 py-4 text-white transition hover:bg-blue-700"
          >
            Copy Administrator Email
          </button>

        </HelpCard>

      </div>

    </div>

  </div>
);
}

function InfoRow({ title, value }) {
  const { theme } = useTheme();

  return (
    <div
      className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        theme === "light"
          ? "border-gray-200 bg-white shadow hover:border-blue-500 hover:shadow-lg"
          : "border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500 hover:bg-white/10"
      }`}
    >
      <p
        className={`text-sm ${
          theme === "light"
            ? "text-gray-500"
            : "text-gray-400"
        }`}
      >
        {title}
      </p>

      <h3 className="mt-3 text-xl font-bold">
        {value}
      </h3>
    </div>
  );
}