import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sendChatMessage } from "../api/actions/chat";
import "./ChatWidget.css";

function ChatBubbleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.5 4V17H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.4 20.4 21 12 3.4 3.6 3 10l13 2-13 2 .4 6.4Z" />
    </svg>
  );
}

export function ChatWidget() {
  const { t } = useTranslation("marketing");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const res = await sendChatMessage({ message: text, history });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setError(err.message || t("chatWidget.errorFallback"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget__panel" role="dialog" aria-label={t("chatWidget.title")}>
          <div className="chat-widget__header">
            <div>
              <p className="chat-widget__title">{t("chatWidget.title")}</p>
              <p className="chat-widget__subtitle">{t("chatWidget.subtitle")}</p>
            </div>
            <button type="button" className="chat-widget__close" onClick={() => setOpen(false)} aria-label={t("chatWidget.close")}>
              <CloseIcon width={18} height={18} />
            </button>
          </div>

          <div className="chat-widget__messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="chat-widget__bubble chat-widget__bubble--assistant">
                {t("chatWidget.greeting")}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-widget__bubble chat-widget__bubble--${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="chat-widget__bubble chat-widget__bubble--assistant chat-widget__bubble--typing">
                <span /><span /><span />
              </div>
            )}
            {error && <p className="chat-widget__error">{error}</p>}
          </div>

          <form className="chat-widget__form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatWidget.placeholder")}
              maxLength={1000}
              aria-label={t("chatWidget.placeholder")}
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label={t("chatWidget.send")}>
              <SendIcon width={18} height={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-widget__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("chatWidget.close") : t("chatWidget.open")}
      >
        {open ? <CloseIcon width={24} height={24} /> : <ChatBubbleIcon width={24} height={24} />}
      </button>
    </div>
  );
}
