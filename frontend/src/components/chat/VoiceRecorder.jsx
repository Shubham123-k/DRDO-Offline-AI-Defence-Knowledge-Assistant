import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { transcribeAudio } from "../../api/voiceApi";

const SILENCE_DURATION = 2000;
const SILENCE_THRESHOLD = 0.015;

export default function VoiceRecorder({ onTranscription, onVoiceBusyChange }) {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!recording) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [recording]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const animationFrameRef = useRef(null);
  const silenceStartRef = useRef(null);
  const audioChunksRef = useRef([]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.error("Failed to stop microphone track:", error);
        }
      });

      streamRef.current = null;
    }

    silenceStartRef.current = null;
    setRecording(false);
  };

  const monitorAudio = () => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    const isSilent = rms < SILENCE_THRESHOLD;

    if (isSilent) {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = Date.now();
      }

      const silenceDuration = Date.now() - silenceStartRef.current;

      if (silenceDuration >= SILENCE_DURATION) {
        stopRecording();

        return;
      }
    } else {
      // Speech detected again.
      silenceStartRef.current = null;
    }

    animationFrameRef.current = requestAnimationFrame(monitorAudio);
  };

  const startRecording = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Microphone recording is not supported by this browser.");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setProcessing(true);

          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });

          console.log("Recorded audio:", {
            type: audioBlob.type,
            size: audioBlob.size,
          });

          if (audioBlob.size === 0) {
            setError("No audio was recorded. Please speak and try again.");

            return;
          }

          const result = await transcribeAudio(audioBlob);
          if (result?.text?.trim()) {
            onTranscription?.(result.text.trim());
          } else {
            setError("No speech was detected. Please try speaking again.");
          }
          console.log("Voice transcription:", result);
          if (result?.text?.trim()) {
            onTranscription?.(result.text.trim());
          }
        } catch (err) {
          console.error("Voice transcription failed:", err);

          let detail = "Failed to transcribe audio.";

          if (err?.response) {
            detail =
              err.response.data?.detail ||
              `Voice service returned error ${err.response.status}.`;
          } else if (err?.request) {
            detail = "Unable to connect to the offline voice service.";
          } else if (err?.message) {
            detail = err.message;
          }

          setError(detail);
        } finally {
          setProcessing(false);
          onVoiceBusyChange?.(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
              track.stop();
            });
            streamRef.current = null;
          }

          if (audioContextRef.current) {
            try {
              await audioContextRef.current.close();
            } catch {
              // Ignore close errors.
            }
            audioContextRef.current = null;
          }

          analyserRef.current = null;
          silenceStartRef.current = null;
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;

      /*
       * Start recording.
       */
      mediaRecorder.start();

      setRecording(true);
      onVoiceBusyChange?.(true);

      // Create Web Audio analyser.

      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();

      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      silenceStartRef.current = Date.now();

      animationFrameRef.current = requestAnimationFrame(monitorAudio);
    } catch (err) {
      console.error("Microphone access failed:", err);

      if (err?.name === "NotAllowedError") {
        setError("Microphone permission was denied.");
      } else if (err?.name === "NotFoundError") {
        setError("No microphone was found.");
      } else {
        setError("Unable to access the microphone.");
      }
    }
  };

  const handleClick = () => {
    if (processing) {
      return;
    }

    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={processing}
          title={
            processing
              ? "Transcribing..."
              : recording
                ? "Stop listening"
                : "Record voice"
          }
          className={`flex h-9 items-center justify-center gap-2 rounded-lg px-2.5 transition-all duration-200 ${
            recording
              ? theme === "light"
                ? "bg-red-50 text-red-600"
                : "bg-red-500/10 text-red-400"
              : theme === "light"
                ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
          } ${processing ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {processing ? (
            <>
              <Loader2 size={18} className="animate-spin" />

              <span className="text-xs font-medium">Transcribing...</span>
            </>
          ) : recording ? (
            <>
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute h-5 w-5 animate-ping rounded-full bg-red-500/20" />

                <span className="relative h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>

              <span className="text-xs font-semibold">Listening...</span>

              <span className="font-mono text-xs tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
            </>
          ) : (
            <Mic size={19} />
          )}
        </button>

        {recording && (
          <button
            type="button"
            onClick={stopRecording}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              theme === "light"
                ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Stop listening"
          >
            <Square size={16} fill="currentColor" />
          </button>
        )}
      </div>

      {error && (
        <div
          className={`absolute bottom-12 left-0 z-50 w-72 rounded-lg border px-3 py-2 text-xs shadow-lg ${
            theme === "light"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
}
