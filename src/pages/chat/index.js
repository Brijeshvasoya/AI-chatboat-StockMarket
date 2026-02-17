/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import { MenuIcon } from "@/components/chat/Icons";

const STORAGE_KEY = "ALL_USERS_CHAT_HISTORY";

const Index = () => {
  const router = useRouter();
  const messagesEndRef = useRef(null);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  const [messages, setMessages] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarHistory, setSidebarHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getUserId = () => user?.id;

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const currentUser = allUsers.find((u) => u.userId === getUserId());
    setSidebarHistory(currentUser?.chats || []);
    setCurrentChatId(null);
    setChatHistory([]);
  }, []);

  const saveCurrentChatToHistory = (userMessage, aiResponse) => {
    const chatId = currentChatId || Date.now().toString();
    setSidebarHistory((prev) => {
      const updated = [
        {
          id: chatId,
          title: userMessage.slice(0, 40),
          messages: [
            ...(prev.find((c) => c.id === chatId)?.messages || []),
            { type: "user", content: userMessage },
            { type: "ai", content: aiResponse },
          ],
          timestamp: Date.now(),
        },
        ...prev.filter((c) => c.id !== chatId),
      ];
      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const index = allUsers.findIndex((u) => u.userId === getUserId());
      if (index !== -1) allUsers[index].chats = updated;
      else allUsers.push({ userId: getUserId(), chats: updated });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
      return updated;
    });
    if (!currentChatId) setCurrentChatId(chatId);
  };

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
          saveCurrentChatToHistory(userMsg, aiReply);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.startsWith("0:"));
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
  const loadChatFromHistory = (id) => {
    const chat = sidebarHistory.find((c) => c.id === id);
    if (!chat) return;
    setCurrentChatId(id);
    setChatHistory(chat.messages);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const userId = getUserId();
    setSidebarHistory((prev) => prev.filter((c) => c.id !== id));
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const updated = history.map((user) => {
      if (user.userId === userId) {
        return {
          ...user,
          chats: user.chats.filter((chat) => chat.id !== id),
        };
      }
      return user;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };


  const startNewChat = () => {
    setChatHistory([]);
    setCurrentChatId(null);
  };

  const formatTimestamp = (ts) => new Date(ts).toLocaleDateString();
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50"
        >
          <MenuIcon />
        </button>
      )}

      <ChatSidebar
        sidebarHistory={sidebarHistory}
        currentChatId={currentChatId}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        startNewChat={startNewChat}
        loadChatFromHistory={loadChatFromHistory}
        deleteChat={deleteChat}
        formatTimestamp={formatTimestamp}
        className="bg-gray-800/60 backdrop-blur-xl border-r border-gray-700/30"
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          user={user}
          handleLogout={handleLogout}
          className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50"
        />
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
      </div>
    </div>
  );
};

export default Index;
