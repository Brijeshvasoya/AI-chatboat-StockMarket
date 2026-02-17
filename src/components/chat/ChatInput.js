const ChatInput = ({
  messages,
  setMessages,
  handleSubmit,
  isThinking,
  isTyping,
  className,
}) => {
  return (
    <div className={`text-center p-4 lg:p-6 pt-0 lg:pt-0 ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-gray-800/50 gap-3 rounded-2xl p-2 hover-lift focus-within:ring-2 glass-effect focus-within:ring-blue-500/50"
      >
        <input
          type="text"
          className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-gray-400 text-sm"
          placeholder="Type your message..."
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
          // disabled={isThinking || isTyping}
        />
        <button
          type="submit"
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-600/20"
          disabled={isThinking || isTyping}
        >
          {" "}
          {isThinking ? "Thinking..." : isTyping ? "Typing..." : "Send"}{" "}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
