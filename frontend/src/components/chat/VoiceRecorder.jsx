import { Mic, Square } from "lucide-react";
import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";

export default function VoiceRecorder() {
  const { theme } = useTheme();

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recording]);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setSeconds(0);
    } else {
      setRecording(true);
    }
  };

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <button
      onClick={toggleRecording}
      className={`flex items-center gap-2 rounded-full px-3 py-2 transition hover:cursor-pointer ${
        recording
          ? "bg-red-500 text-white"
          : theme === "light"
          ? "hover:bg-gray-100"
          : "hover:bg-[#2A2A2A]"
      }`}
    >
      {recording ? <Square size={18} /> : <Mic size={18} />}

      {recording && (
        <span className="text-sm font-medium">
          {formatTime(seconds)}
        </span>
      )}
    </button>
  );
}