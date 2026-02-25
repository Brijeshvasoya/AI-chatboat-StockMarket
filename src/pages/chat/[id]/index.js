/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatLayout from "@/layouts/index";
import { useChat } from "@/context/ChatContext";

const ChatDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef(null);
  const { user, sidebarHistory, saveChat } = useChat();

  const [messages, setMessages] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");

  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  useEffect(() => {
    if (!id || !sidebarHistory.length) return;
    const chat = sidebarHistory.find((c) => c.id === id);
    if (chat) {
      setChatHistory(chat.messages);
    } else {
      router.replace("/chat");
    }
  }, [id, sidebarHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messages.trim()) return;

    const userMsg = messages.trim();
    setMessages("");

    setChatHistory((prev) => [...prev, { type: "user", content: userMsg }]);
    setIsThinking(true);

    try {
      const trimmedHistory = chatHistory
        .filter(
          (msg) =>
            msg.type === "user" ||
            (msg.type === "ai" && msg.content && msg.content.trim() !== "")
        )
        .slice(-20);

      const formattedMessages = [
        ...trimmedHistory.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMsg },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiReply = "";
      let wordQueue = [];
      let isProcessingQueue = false;

      const processQueue = () => {
        if (isProcessingQueue) return;
        isProcessingQueue = true;

        const tick = () => {
          if (wordQueue.length === 0) {
            isProcessingQueue = false;
            return;
          }
          const next = wordQueue.shift();
          aiReply += next;
          setCurrentTypingMessage(aiReply);
          setTimeout(tick, 18);
        };

        tick();
      };

      setIsThinking(false);
      setIsTyping(true);
      setCurrentTypingMessage("");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const waitForQueue = () => {
            if (wordQueue.length > 0 || isProcessingQueue) {
              setTimeout(waitForQueue, 20);
            } else {
              setIsTyping(false);
              setCurrentTypingMessage("");
              setChatHistory((prev) => [
                ...prev,
                { type: "ai", content: aiReply },
              ]);
              saveChat?.(id || null, userMsg, aiReply, null);
            }
          };

          waitForQueue();
          break;
        }

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n").filter(Boolean);

        for (const line of lines) {
          const prefix = line[0];
          const payload = line.slice(2);

          try {
            if (prefix === "0") {
              // Text chunk
              const text = JSON.parse(payload);
              const tokens = text.split(/(\s+)/);
              wordQueue.push(...tokens);
              processQueue();

            } else if (prefix === "8") {
              // Chart data — bail out of text streaming immediately
              const chartData = JSON.parse(payload);
              setIsTyping(false);
              setCurrentTypingMessage("");
              setChatHistory((prev) => [
                ...prev,
                { type: "ai", content: "", chart: chartData },
              ]);
              saveChat?.(id || null, userMsg, "", null, chartData);
              return; // ← exit handleSubmit entirely

            } else if (prefix === "3") {
              // Error sent from server
              const errMsg = JSON.parse(payload);
              throw new Error(errMsg);
            }
          } catch (err) {
            console.warn("Stream parse error:", err);
          }
        }
      }
    } catch (error) {
      console.log("Stream error:", error);
      setIsThinking(false);
      setIsTyping(false);
      setCurrentTypingMessage("");
      setChatHistory((prev) => [
        ...prev,
        { type: "ai", content: "Sorry, something went wrong." },
      ]);
    }
  };

  return (
    <>
      <Head>
        <title>{sidebarHistory?.map((chat) => { if (chat?.id === id) return chat?.title })}</title>
      </Head>
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
          isTyping={isTyping}
        />
      </ChatLayout>
    </>
  );
};

export default ChatDetailPage;
