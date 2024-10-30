import React from "react";
import { motion } from "framer-motion";

const ChatMessage = ({ message, isActive, disabled }) => {
  const isBot = message.type === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] ${
          isBot ? "bg-white border border-gray-200" : "bg-blue-500 text-white"
        } rounded-lg p-4 space-y-4`}
      >
        <div className="text-sm">{message.text}</div>
        {message.options && message.options.length > 0 && (
          <div className="space-y-2">
            {message.options.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                disabled={disabled}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors
                  ${
                    isBot
                      ? "bg-gray-100 hover:bg-gray-200 disabled:hover:bg-gray-100"
                      : "bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600"
                  }
                  ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
