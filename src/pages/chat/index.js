/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatLayout from "@/layouts/index";
import { useChat } from "@/context/ChatContext";

const NewChatPage = () => {
  const router = useRouter();
  const messagesEndRef = useRef(null);
 const { user, saveChat, authReady } = useChat();

  const [messages, setMessages] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");

  useEffect(() => {
    if (!authReady) return; 
    if (!user) router.push("/");
  }, [user, authReady]);

  if (!authReady) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messages.trim()) return;

    const userMsg = messages;
    setMessages("");
    setChatHistory((p) => [...p, { type: "user", content: userMsg }]);
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiReply = "";

      setIsThinking(false);
      setIsTyping(true);
      setCurrentTypingMessage("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsTyping(false);
          setCurrentTypingMessage("");
          setChatHistory((p) => [...p, { type: "ai", content: aiReply }]);
          const resolvedId = saveChat(currentChatId, userMsg, aiReply, setCurrentChatId);
          if (!currentChatId) {
            router.replace(`/chat/${resolvedId}`, undefined, { shallow: false });
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.startsWith("0:"));
        for (const line of lines) {
          try {
            const text = JSON.parse(line.slice(2));
            aiReply += text;
            setCurrentTypingMessage(aiReply);
          } catch (parseError) {
            console.warn("⚠️ Parse error:", line, parseError);
          }
        }
      }
    } catch (error) {
      setIsThinking(false);
      setIsTyping(false);
      setCurrentTypingMessage("");
      setChatHistory((p) => [
        ...p,
        { type: "ai", content: "Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <ChatLayout>
      <ChatMessages
        chatHistory={chatHistory}
        isThinking={isThinking}
        isTyping={isTyping}
        currentTypingMessage={currentTypingMessage}
        messagesEndRef={messagesEndRef}
        user={user}
        className="backdrop-blur-sm"
      />
      <ChatInput
        messages={messages}
        setMessages={setMessages}
        handleSubmit={handleSubmit}
        isThinking={isThinking}
      />
    </ChatLayout>
  );
};

export default NewChatPage;