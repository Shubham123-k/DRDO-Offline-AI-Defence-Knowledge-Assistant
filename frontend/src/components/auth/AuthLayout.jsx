import ParticleBackground from "../particles/ParticleBackground";
import Navbar from "../layout/Navbar";

export default function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-6 py-28">
          {children}
        </div>
      </div>
    </main>
  );
}