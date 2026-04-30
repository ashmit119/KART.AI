import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chat as chatApi } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { formatPrice } from "@/lib/format";

type Msg = { role: "user" | "assistant"; content: string; products?: any[] };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (messages.length > 0) return;
    (async () => {
      const sessionId = getSessionId();
      if (!sessionId) return;
      try {
        const res = await chatApi.getChatHistory(sessionId);
        const loaded: Msg[] = (res.messages ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        if (loaded.length === 0) {
          loaded.push({
            role: "assistant",
            content: "Hi! I'm your shopping assistant. Looking for something specific today?",
          });
        }
        setMessages(loaded);
      } catch {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm your shopping assistant. Looking for something specific today?",
        }]);
      }
    })();
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await chatApi.sendChat(getSessionId(), text);
      setMessages((m) => [...m, { role: "assistant", content: res.reply, products: res.products }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-background rounded-2xl shadow-lift border border-border flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-mint">
              <div>
                <p className="text-sm font-semibold text-foreground">Shopping Assistant</p>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-background/50 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={
                        m.role === "user"
                          ? "bg-foreground text-background rounded-2xl rounded-br-md px-4 py-2.5 text-sm"
                          : "bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2.5 text-sm prose prose-sm max-w-none [&>*]:my-1"
                      }
                    >
                      {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                    </div>
                    {m.products && m.products.length > 0 && (
                      <div className="space-y-2">
                        {m.products.map((p) => (
                          <Link
                            key={p.id}
                            to="/product/$id"
                            params={{ id: p.id }}
                            onClick={() => setOpen(false)}
                            className="flex gap-3 p-2 rounded-xl border border-border hover:border-sage hover:bg-mint/30 transition-colors"
                          >
                            <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold line-clamp-1">{p.title}</p>
                              <p className="text-sm font-bold mt-0.5">{formatPrice(p.price)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2 items-center bg-muted rounded-full pl-4 pr-1.5 py-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about products…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  className="p-2 rounded-full bg-foreground text-background disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-foreground text-background shadow-lift flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
