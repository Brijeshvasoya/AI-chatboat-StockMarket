import React from "react";

const ChatHeader = ({ user, handleLogout, className }) => {

  return (
    <div className={`p-6 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-sm animate-fadeIn ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 via-purple-500 to-emerald-400 text-transparent bg-clip-text">
            AI Assistant
          </h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-400">Powered by</span>
            <span className="text-xs font-medium text-blue-400">
              Advanced AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-600/30">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-gray-400">{user?.email || ""}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-linear-to-r cursor-pointer from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-red-600/20"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
