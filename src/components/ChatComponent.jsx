import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import { sendChat } from "../services/api";
import ReactMarkdown from "react-markdown";

const ChatComponent = ({ codeContext, language, messages, setMessages }) => {
  const [input, setInput] = useState("");
  //   const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendChat(input, codeContext, language, messages);
      const botMsg = { role: "assistant", content: result.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to Sensei." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-900/50 rounded-lg border border-gray-700/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            <p>Ask a question about this function.</p>
            <p className="text-xs mt-1">e.g., "How can I make this O(n)?"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-blue-600" : "bg-green-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            <div
              className={`p-3 rounded-lg text-sm max-w-[85%] ${
                msg.role === "user"
                  ? "bg-blue-600/20 text-blue-100 rounded-tr-none border border-blue-600/30"
                  : "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700"
              }`}
            >
              {/* MARKDOWN RENDERER */}
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <div className="bg-black/50 rounded-md p-2 my-2 overflow-x-auto border border-gray-700 font-mono text-xs text-yellow-300">
                        {children}
                      </div>
                    ) : (
                      <code
                        className="bg-black/30 px-1 py-0.5 rounded font-mono text-xs text-yellow-200"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-4 mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-4 mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-bold text-white mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  strong: ({ children }) => (
                    <span className="font-bold text-blue-300">{children}</span>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-700 text-gray-400 text-sm flex items-center">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700/50 bg-gray-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask specific questions..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
