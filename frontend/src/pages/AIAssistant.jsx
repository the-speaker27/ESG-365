import { useEffect, useRef, useState } from "react";
import { DEMO_AI_RESPONSES } from "../services/demoData.js";

const QUICK_ACTIONS = [
  { label: "Explain my ESG status", response: "status" },
  { label: "Show pending submissions", response: "pending" },
  { label: "Show energy trend", response: "energy" },
  { label: "Explain BRSR", response: "brsr" },
  { label: "What needs my attention?", response: "attention" },
];

function responseFor(question) {
  const value = question.toLowerCase();
  if (value.includes("pending") || value.includes("review")) return DEMO_AI_RESPONSES.pending;
  if (value.includes("energy") || value.includes("trend") || value.includes("consumption")) return DEMO_AI_RESPONSES.energy;
  if (value.includes("brsr") || value.includes("report")) return DEMO_AI_RESPONSES.brsr;
  if (value.includes("attention") || value.includes("correction")) return DEMO_AI_RESPONSES.attention;
  if (value.includes("status") || value.includes("submission")) return DEMO_AI_RESPONSES.status;
  return DEMO_AI_RESPONSES.fallback;
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([{ id: 1, role: "assistant", content: "Hello. I can help you understand the ESG reporting workspace, review submission status, and explain BRSR concepts. What would you like to explore?", time: timestamp() }]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timer = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function sendMessage(text) {
    const content = text.trim();
    if (!content || isTyping) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", content, time: timestamp() }]);
    setQuestion("");
    setIsTyping(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: responseFor(content), time: timestamp() }]);
      setIsTyping(false);
    }, 650);
  }

  return (
    <section className="page-content assistant-page page-enter">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">AI & SUPPORT</p><h1>ESG-365 Assistant</h1><p>AI-powered assistance for ESG reporting and BRSR</p></div>
        <span className="demo-tag">FRONTEND DEMO ONLY</span>
      </div>
      <div className="assistant-shell">
        <aside className="assistant-aside">
          <div className="assistant-mark" aria-hidden="true">✦</div>
          <h2>How can I help?</h2>
          <p>Choose a prompt to explore your reporting workspace.</p>
          <div className="assistant-quick-actions">
            {QUICK_ACTIONS.map((action) => <button key={action.response} onClick={() => sendMessage(action.label)} type="button">{action.label}<span aria-hidden="true">→</span></button>)}
          </div>
          <p className="assistant-disclaimer">Responses are predefined examples. No external AI service is connected.</p>
        </aside>
        <div className="chat-panel">
          <div className="chat-header"><div><strong>ESG Assistant</strong><span><i /> Demo conversation</span></div><span className="chat-header-icon" aria-hidden="true">✦</span></div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message) => (
              <article className={`chat-message message-${message.role}`} key={message.id}>
                {message.role === "assistant" && <span className="chat-avatar" aria-hidden="true">M</span>}
                <div className="chat-bubble"><p>{message.content}</p><time>{message.time}</time></div>
              </article>
            ))}
            {isTyping && <div className="chat-message message-assistant"><span className="chat-avatar" aria-hidden="true">M</span><div className="chat-bubble typing-bubble" aria-label="Assistant is typing"><i /><i /><i /></div></div>}
            <div ref={bottom} />
          </div>
          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(question); }}>
            <input aria-label="Message the ESG assistant" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about ESG reporting..." value={question} />
            <button aria-label="Send message" disabled={!question.trim() || isTyping} type="submit"><span aria-hidden="true">↑</span></button>
          </form>
        </div>
      </div>
    </section>
  );
}
