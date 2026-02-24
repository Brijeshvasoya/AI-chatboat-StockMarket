/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
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

    const userMsg = messages.trim();
    setMessages("");

    setChatHistory((prev) => [...prev, { type: "user", content: userMsg }]);
    setIsThinking(true);

    try {
      const trimmedHistory = chatHistory
        .filter(
          (msg) =>
            msg.type === "user" ||
            (msg.type === "ai" &&
              msg.content &&
              msg.content.trim() !== "")
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

      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const json = await res.json();

        if (json.type === "chart") {
          setIsThinking(false);

          setChatHistory((prev) => [
            ...prev,
            { type: "ai", content: "", chart: json },
          ]);

          const resolvedId = saveChat?.(currentChatId || null, userMsg, "", null, json);
          console.log("🚀 ~ handleSubmit ~ resolvedId:", resolvedId)
          if (!currentChatId) router.replace(`/chat/${resolvedId}`, undefined, {
            shallow: false,
          });

          return;
        }
      }

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

              const resolvedId = saveChat?.(
                currentChatId || null,
                userMsg,
                aiReply,
                setCurrentChatId
              );

              if (!currentChatId && resolvedId) {
                router.replace(`/chat/${resolvedId}`, undefined, {
                  shallow: false,
                });
              }
            }
          };

          waitForQueue();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("0:"));

        for (const line of lines) {
          try {
            const text = JSON.parse(line.slice(2));
            const tokens = text.split(/(\s+)/);
            wordQueue.push(...tokens);
            processQueue();
          } catch (err) {
            console.warn("Stream parse error:", err);
          }
        }
      }
    } catch (error) {
      console.error(error);
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
        <title>StockSense AI - New Chat</title>
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

export default NewChatPage;
