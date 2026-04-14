import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api.js";

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Leadrift AI. How can I help you manage your pipeline today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (isOpen && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: userMessage.content });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops, I'm having trouble connecting right now. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-card mb-4 flex h-[480px] w-[340px] flex-col overflow-hidden shadow-2xl dark:border-[#2E4A5A] dark:bg-[#1A2F3A]/95"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 bg-white/50 px-4 py-3 dark:border-[#2E4A5A] dark:bg-[#243B47]/80">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cyan text-white shadow-neon">
                  <span className="text-xs">AI</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#E0F7FA]">Leadrift AI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 dark:text-[#80CBC4] dark:hover:bg-[#243B47] dark:hover:text-[#E0F7FA]"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-brand-cyan text-white shadow-md shadow-brand-cyan/20"
                        : "bg-slate-100 text-slate-800 dark:bg-[#243B47] dark:text-[#E0F7FA] border border-slate-200/50 dark:border-[#2E4A5A]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm bg-slate-100 text-slate-800 dark:bg-[#243B47] dark:text-[#E0F7FA] border border-slate-200/50 dark:border-[#2E4A5A]">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-200/50 bg-white/50 p-3 dark:border-[#2E4A5A] dark:bg-[#243B47]/80">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 rounded-lg border border-slate-300/80 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-cyan/60 dark:border-[#2E4A5A] dark:bg-[#1A2F3A] dark:text-[#E0F7FA] dark:placeholder:text-[#80CBC4]/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-brand-cyan px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan text-white shadow-neon transition-transform hover:scale-105 active:scale-95"
        >
          <ChatIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}