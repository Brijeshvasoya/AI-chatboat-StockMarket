/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ChatMessages = ({
  chatHistory,
  isThinking,
  isTyping,
  currentTypingMessage,
  messagesEndRef,
  user,
  className,
}) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatHistory, isThinking, isTyping, currentTypingMessage]);

  return (
    <div className={`flex-1 p-4 lg:p-8 overflow-y-auto ${className}`}>
      <div className="max-w-4xl mx-auto">
        {chatHistory.length === 0 && !isThinking && !isTyping ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-8 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-linear-to-r from-blue-400 to-emerald-400 rounded-full animate-pulse"></div>
            </div>

            <h2 className="text-3xl font-semibold text-white mb-4">
              Hello {user?.name}! How can I help you today?
            </h2>

            <p className="text-gray-400 text-lg mb-8">
              Ask me anything, I&apos;m here to assist you with your questions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-2xl shadow-lg hover-lift ${msg.type === "user"
                    ? "bg-linear-to-r from-blue-600 to-blue-700 text-white message-slide-right"
                    : "bg-gray-800/90 text-gray-100 border border-gray-700/30 message-slide-left"
                    }`}
                >
                  {msg.type === "ai" ? (
                    <div className="prose prose-invert prose-sm max-w-none
                                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm
                                    [&_th]:border [&_th]:border-gray-600 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-gray-700 [&_th]:text-gray-200 [&_th]:font-semibold [&_th]:text-left
                                    [&_td]:border [&_td]:border-gray-600 [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-200
                                    [&_tr:nth-child(even)_td]:bg-gray-700/30
                                    [&_tr:hover_td]:bg-gray-600/30">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-3xl px-4 py-3 rounded-2xl bg-gray-800/90 border border-gray-700/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-300">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-3xl px-4 py-3 rounded-2xl bg-gray-800/90 border border-gray-700/30 shadow-lg">
                  <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {currentTypingMessage}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs">
                    <span>AI is typing</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;