// frontend/src/pages/Assistant.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Quick symptom suggestions shown before the first message
// These help users get started without thinking about what to type
const STARTER_PROMPTS = [
  "I have a fever and headache since yesterday",
  "My throat is sore and I find it hard to swallow",
  "I have chest tightness when I breathe deeply",
  "I have a rash on my arm that keeps spreading",
  "I feel dizzy when I stand up quickly",
  "I have had lower back pain for 3 days",
];

// API base URL — adjust this to match your existing setup
// If your other API calls use "/api/..." then keep this
// If they use "http://localhost:5000/api/..." then change accordingly
const API_BASE = import.meta.env.VITE_API_URL || "https://carewise-vphl.onrender.com";

export default function Assistant() {
  const navigate = useNavigate();

  // Check if user is logged in using whatever auth method your app uses
  // Adjust "cw_token" to match your localStorage key
  const token = localStorage.getItem("cw_token");

  // Full conversation history
  // Each message: { role: "user" | "assistant", content: "string" }
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I am CareWise, your AI health assistant 👋\n\nTell me what symptoms you are experiencing and I will help you understand what might be going on, suggest first aid steps, and recommend the right type of doctor.\n\nWhat are you feeling today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref to auto-scroll to the latest message
  const bottomRef = useRef(null);

  // Scroll to bottom every time messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Main function to send a message to the AI
  async function sendMessage(textToSend) {
    // Use provided text or whatever is in the input field
    const userText = textToSend || input.trim();
    if (!userText || loading) return;

    // Clear input and error
    setInput("");
    setError("");

    // Add user message to conversation
    const updatedMessages = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Get token for authenticated request
      const token = localStorage.getItem("cw_token");

      // Send full conversation to backend
      // Backend sends it to Gemini and returns the reply
      const response = await axios.post(
        `${API_BASE}/api/ai/chat`,
        {
          // Only send last 10 messages to avoid large payloads
          // This also stays within Gemini's context limits
          messages: updatedMessages.slice(-10),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 30000, // 30 second timeout
        }
      );

      // Add Gemini's reply to conversation
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Could not connect to AI. Please try again.");

      setError(errorMsg);

      // Add error as assistant message so it stays in conversation
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I had trouble responding. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Send on Enter key (Shift+Enter adds a new line)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Clear conversation and start fresh
  function handleClearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared. What health concern can I help you with today?",
      },
    ]);
    setError("");
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            🤖 AI Health Assistant
          </h1>
          <p className="text-xs text-slate-400">
            Powered by AI · Not a medical diagnosis
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          Clear chat
        </button>
      </div>

      {/* ── Chat Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        
        {/* Starter prompts — shown only before user sends first message */}
        {messages.length === 1 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-slate-400 text-center mb-3">
              Try one of these or type your own:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-full hover:border-blue-400 hover:text-blue-600 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render all messages */}
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}

          {/* Typing indicator while waiting for Gemini */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          
          {/* Error message above input */}
          {error && (
            <p className="text-red-500 text-xs mb-2 text-center">{error}</p>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms... (Enter to send)"
              rows={2}
              className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm flex-shrink-0"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-300 mt-2">
            ⚠️ For emergencies, call 108 immediately
          </p>
        </div>
      </div>
    </div>
  );
}

// ── MessageBubble Component ──────────────────────────────────────────────────
// Separate component to keep the main component clean
// Handles rendering of both user messages and AI responses

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
          🤖
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {/* Render message with line breaks preserved */}
        {message.content.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
          👤
        </div>
      )}
    </div>
  );
}
