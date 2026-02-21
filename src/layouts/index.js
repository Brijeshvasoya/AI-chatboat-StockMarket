import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import { MenuIcon } from "@/components/chat/Icons";
import { useChat } from "@/context/ChatContext";

const ChatLayout = ({ children }) => {
  const router = useRouter();
  const id = router.query.id;
  const { user, sidebarHistory, deleteChat, logout } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    const chat = sidebarHistory.find((c) => c.id === id);
    if (chat) {
      router.push(`/chat/${id}`);
    }
  }, [id]);

  const formatTimestamp = (ts) => new Date(ts).toLocaleDateString();

  const handleLogout = () => logout(router);

  const loadChatFromHistory = (id) => {
    router.push(`/chat/${id}`);
  };

  const startNewChat = () => {
    router.push("/chat");
  };

  return (
    <div className="h-screen flex justify-center bg-gray-900">
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50"
        >
          <MenuIcon />
        </button>
      )}

      {/* Sidebar — shared across /chat and /chat/[id] */}
      <ChatSidebar
        sidebarHistory={sidebarHistory}
        currentChatId={router.query.id || null}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        startNewChat={startNewChat}
        loadChatFromHistory={loadChatFromHistory}
        deleteChat={deleteChat}
        formatTimestamp={formatTimestamp}
        className="bg-gray-800/60 backdrop-blur-xl border-r border-gray-700/30"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          user={user}
          handleLogout={handleLogout}
          className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50"
        />

        <div className="flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;