export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">
          {title}
        </h1>
        <p className="text-gray-400">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}