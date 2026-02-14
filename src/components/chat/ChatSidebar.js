import { MessageIcon, TrashIcon, CloseIcon } from "./Icons";

const ChatSidebar = ({
  sidebarHistory,
  currentChatId,
  isSidebarOpen,
  setIsSidebarOpen,
  startNewChat,
  loadChatFromHistory,
  deleteChat,
  formatTimestamp,
  className,
}) => {
  return (
    <div
      className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative w-80 bg-gray-800/95 backdrop-blur-sm lg:bg-gray-800 border-r border-gray-700 h-full z-40 transition-transform duration-300 ease-in-out flex flex-col ${className}`}
    >
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Chat History</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-700 rounded"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-xs text-gray-500">Your personal conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div
          onClick={startNewChat}
          className="p-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 cursor-pointer flex items-center gap-3 hover-lift"
        >
          <MessageIcon />
          <p className="text-sm text-white font-medium">New Chat</p>
        </div>

        {sidebarHistory.map((chat) => (
          <div
            key={chat.id}
            onClick={() => loadChatFromHistory(chat.id)}
            className={`p-3 rounded-xl cursor-pointer group hover-lift ${
              currentChatId === chat.id
                ? "bg-gray-700/50 border border-blue-500/30"
                : "hover:bg-gray-700/30"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-300 truncate">{chat.title}</p>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(chat.timestamp)}
                </p>
              </div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
