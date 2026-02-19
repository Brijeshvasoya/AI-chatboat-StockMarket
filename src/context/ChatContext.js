import React, { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext(null);
const STORAGE_KEY = "ALL_USERS_CHAT_HISTORY";

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sidebarHistory, setSidebarHistory] = useState([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(storedUser);
      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const currentUser = allUsers.find((u) => u.userId === storedUser.id);
      setSidebarHistory(currentUser?.chats || []);
    }
    setAuthReady(true);
  }, []);

  const saveChat = (chatId, userMessage, aiResponse, setChatId) => {
    const resolvedId = chatId || Date.now().toString();

    setSidebarHistory((prev) => {
      const existingChat = prev.find((c) => c.id === resolvedId);
      const updated = [
        {
          id: resolvedId,
          title: existingChat?.title || userMessage.slice(0, 40),
          messages: [
            ...(existingChat?.messages || []),
            { type: "user", content: userMessage },
            { type: "ai", content: aiResponse },
          ],
          timestamp: Date.now(),
        },
        ...prev.filter((c) => c.id !== resolvedId),
      ];

      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const index = allUsers.findIndex((u) => u.userId === user?.id);
      if (index !== -1) allUsers[index].chats = updated;
      else allUsers.push({ userId: user?.id, chats: updated });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));

      return updated;
    });

    if (!chatId && setChatId) setChatId(resolvedId);
    return resolvedId;
  };

  const deleteChat = (id, e) => {
    e?.stopPropagation();
    setSidebarHistory((prev) => prev.filter((c) => c.id !== id));
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = allUsers.map((u) =>
      u.userId === user?.id
        ? { ...u, chats: u.chats.filter((chat) => chat.id !== id) }
        : u
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const logout = (router) => {
    localStorage.removeItem("user");
    setUser(null);
    setSidebarHistory([]);
    router.push("/");
  };

  const loadUserHistory = (loggedInUser) => {
    setUser(loggedInUser);
    const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const currentUser = allUsers.find((u) => u.userId === loggedInUser.id);
    setSidebarHistory(currentUser?.chats || []);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        authReady,
        sidebarHistory,
        setSidebarHistory,
        loadUserHistory,
        saveChat,
        deleteChat,
        logout,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};