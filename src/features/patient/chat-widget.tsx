"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { getDefaultWelcome, type SupportLang } from "@/lib/chat/triage";

interface Reply {
  title: string;
  summary: string;
  urgency: "EMERGENCY" | "HIGH" | "MODERATE" | "LOW";
  emergency: boolean;
  selfCare: string[];
  seeDoctorWhen: string[];
  matches: string[];
  isGreeting: boolean;
}

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  reply?: Reply;
}

let messageId = 0;

function toSupportLang(lang: string): SupportLang {
  return lang === "hi" || lang === "te" ? lang : "en";
}

export function PatientChatWidget() {
  const { lang, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supportLang = toSupportLang(lang);

  const isSupported = typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (open && messages.length === 0) {
      const welcome = getDefaultWelcome(supportLang);
      setMessages([
        { id: messageId++, role: "bot", text: `${welcome.title} — ${welcome.message}` }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, waiting]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setVoiceError("Voice input works in Chrome or Edge browsers. Please type instead.");
      return;
    }
    setVoiceError(null);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = navigator.language || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        if (transcript.trim()) {
          setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
        }
        setListening(false);
        recognitionRef.current = null;
      };
      recognition.onerror = () => {
        setListening(false);
        recognitionRef.current = null;
        setVoiceError("Could not use the microphone. Please type instead.");
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
      setVoiceError("Could not start voice input. Please type instead.");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || waiting) return;

    setInput("");
    setMessages((prev) => [...prev, { id: messageId++, role: "user", text: trimmed }]);
    setWaiting(true);

    try {
      const res = await fetch("/api/patient-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language: supportLang })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        const reply: Reply = data.reply;
        const headline = reply.emergency
          ? `${reply.title}. ${t("chat.callNow")}`
          : reply.title;
        setMessages((prev) => [
          ...prev,
          { id: messageId++, role: "bot", text: headline, reply }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: messageId++, role: "bot", text: data.error || t("chat.fallback") }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: messageId++, role: "bot", text: t("chat.fallback") }
      ]);
    } finally {
      setWaiting(false);
    }
  }

  function urgencyPill(urgency: Reply["urgency"]) {
    const style: Record<string, string> = {
      EMERGENCY: "bg-red-100 text-red-700 border-red-200",
      HIGH: "bg-orange-100 text-orange-700 border-orange-200",
      MODERATE: "bg-amber-100 text-amber-700 border-amber-200",
      LOW: "bg-green-100 text-green-700 border-green-200"
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style[urgency]}`}>
        {t(`chat.urgency.${urgency}`)}
      </span>
    );
  }

  function renderReply(reply: Reply) {
    return (
      <div className="mt-2 space-y-3">
        {reply.emergency && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
            {t("chat.callNow")}
          </div>
        )}
        {reply.selfCare.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">{t("chat.selfCare")}</div>
            <ul className="space-y-1">
              {reply.selfCare.map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {reply.seeDoctorWhen.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">{t("chat.seeDoctor")}</div>
            <ul className="space-y-1">
              {reply.seeDoctorWhen.map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl border shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">{t("chat.title")}</div>
                <div className="text-[11px] text-green-50">{t("chat.online")}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center"
              aria-label={t("chat.close")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm whitespace-pre-wrap">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[90%] bg-white border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{m.text}</span>
                      {m.reply && !m.reply.isGreeting && urgencyPill(m.reply.urgency)}
                    </div>
                    {m.reply && (
                      <p className="text-sm text-muted-foreground mt-1">{m.reply.summary}</p>
                    )}
                    {m.reply && renderReply(m.reply)}
                  </div>
                </div>
              )
            )}
            {waiting && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {voiceError && (
            <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs border-t border-amber-100">
              {voiceError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t bg-white p-3 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              aria-label="Voice input"
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                listening ? "bg-red-100 text-red-600" : "bg-slate-100 text-green-700 hover:bg-green-50"
              }`}
            >
              {listening ? (
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1 input py-2"
              disabled={waiting}
            />
            <button
              type="submit"
              disabled={waiting || !input.trim()}
              className="shrink-0 btn-primary w-10 h-10 p-0 rounded-full"
              aria-label={t("chat.send")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>

          <div className="px-4 py-2 bg-slate-50 border-t text-[11px] text-muted-foreground leading-snug">
            {t("chat.disclaimer")}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label={t("chat.title")}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </>
  );
}