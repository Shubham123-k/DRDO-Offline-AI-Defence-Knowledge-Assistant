import Navbar from "../components/layout/Navbar";
import ParticleBackground from "../components/particles/ParticleBackground";
import useTheme from "../hooks/useTheme";

export default function Home() {
  const { theme } = useTheme();

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <ParticleBackground />

      <div className="relative z-10">
        <Navbar />

        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            DRDO AI Assistant
          </h1>

          <p className={`max-w-3xl text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"} md:text-xl`}>
            Offline AI Defence Knowledge Assistant Powered by RAG • Gemma 4 •
            Offline
          </p>
        </section>
      </div>
    </main>
  );
}
