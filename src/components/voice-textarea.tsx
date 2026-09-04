"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  id?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  label,
  id,
  required,
  rows = 3,
  disabled
}: VoiceTextareaProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice input is not supported in this browser. Please type the text instead.");
      return;
    }

    setError(null);

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = navigator.language || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        if (transcript.trim()) {
          onChange(value ? `${value} ${transcript}`.trim() : transcript);
        }
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event: any) => {
        setListening(false);
        recognitionRef.current = null;
        if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else if (event.error === "audio-capture") {
          setError("Microphone not found. Please check your microphone.");
        } else if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else {
          setError("Voice input failed. Please type the text instead.");
        }
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("Failed to start voice input. Please type the text instead.");
    }
  }, [isSupported, value, onChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
      setListening(false);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label" htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium transition-colors ${
            listening
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          }`}
          title={!isSupported ? "Voice input not supported in this browser" : undefined}
        >
          {listening ? (
            <>
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Voice
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-amber-600 mb-1">{error}</p>
      )}
      {listening && (
        <p className="text-xs text-blue-600 mb-1">Listening... Speak now</p>
      )}
      <textarea
        id={id}
        className="input min-h-[80px]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
      />
      {value && (
        <p className="text-xs text-muted-foreground mt-1">Please review the text before saving.</p>
      )}
    </div>
  );
}
