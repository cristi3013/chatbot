import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./Header";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import stockData from "../data/stockData";
import { debounce } from "lodash";

const Chatbot = () => {
  // State for messages, loading indicator, and active message tracking
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  // Automatically scrolls chat to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scrolls to bottom whenever new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial setup: welcome message and stock data validation
  useEffect(() => {
    const initialMessage = {
      type: "bot",
      text: "Welcome to the LSEG Stock Information Assistant! 📈",
      options: [{ text: "Get Started", action: debouncedShowExchangeOptions }],
      id: Date.now(),
    };
    setMessages([initialMessage]);
    setActiveMessageId(initialMessage.id);

    try {
      if (!Array.isArray(stockData) || stockData.length === 0) {
        throw new Error("Failed to load stock data. Please try again later.");
      }
    } catch (error) {
      handleError("An error occurred while loading stock data.");
      console.error("Data Loading Error:", error);
    }
  }, []);

  // Adds a new message to the chat
  const addMessage = (message) => {
    const newMessage = { ...message, id: Date.now() };
    setMessages((prev) => [...prev, newMessage]);
    setActiveMessageId(newMessage.id);
    return newMessage.id;
  };

  // Simulates typing delay to create a realistic bot response effect
  const simulateTyping = async (callback) => {
    if (loading) return;
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await callback();
    } finally {
      setLoading(false);
    }
  };

  // Handles errors and shows a relevant message
  const handleError = (errorMessage) => {
    const newMessage = {
      type: "bot",
      text: errorMessage,
      options: [{ text: "🏠 Main Menu", action: debouncedShowExchangeOptions }],
    };
    addMessage(newMessage);
  };

  // Debounced function to show stock exchange options with some delay to prevent rapid changes
  const debouncedShowExchangeOptions = debounce(async () => {
    if (loading) return;

    // Cancels any other pending actions for this function
    debouncedSelectExchange.cancel();
    debouncedShowStockPrice.cancel();

    await simulateTyping(() => {
      setActiveMessageId(null);

      addMessage({
        type: "bot",
        text: "Please select a stock exchange:",
        options: stockData.map((exchange) => ({
          text: exchange.stockExchange,
          action: () => debouncedSelectExchange(exchange.code),
        })),
      });
    });
  }, 300);

  // Handles exchange selection and displays relevant stocks
  const debouncedSelectExchange = debounce(async (code) => {
    if (loading) return;

    // Cancels other pending actions
    debouncedShowExchangeOptions.cancel();
    debouncedShowStockPrice.cancel();

    try {
      const exchange = stockData.find((e) => e.code === code);
      if (!exchange) throw new Error("Invalid stock exchange selection.");

      addMessage({
        type: "user",
        text: `Selected: ${exchange.stockExchange}`,
        options: [],
      });

      await simulateTyping(() => {
        setActiveMessageId(null);

        addMessage({
          type: "bot",
          text: `Here are the top stocks from ${exchange.stockExchange}:`,
          options: [
            ...exchange.topStocks.map((stock) => ({
              text: `${stock.stockName} (${stock.code})`,
              action: () => debouncedShowStockPrice(exchange.code, stock),
            })),
            {
              text: "↩️ Back to Exchanges",
              action: debouncedShowExchangeOptions,
            },
          ],
        });
      });
    } catch (error) {
      handleError("Something went wrong. Please select a different exchange.");
      console.error("Exchange Selection Error:", error);
    }
  }, 300);

  // Shows stock price for the selected stock with error handling if data is unavailable
  const debouncedShowStockPrice = debounce(async (exchangeCode, stock) => {
    if (loading) return;

    // Cancels other pending actions
    debouncedShowExchangeOptions.cancel();
    debouncedSelectExchange.cancel();

    try {
      if (!stock || !stock.price) {
        throw new Error("Stock information is unavailable.");
      }

      addMessage({
        type: "user",
        text: `Selected: ${stock.stockName}`,
        options: [],
      });

      await simulateTyping(() => {
        setActiveMessageId(null);

        addMessage({
          type: "bot",
          text: `${stock.stockName} (${
            stock.code
          }) \nCurrent Price: $${stock.price.toLocaleString()}`,
          options: [
            {
              text: "↩️ Back to Stocks",
              action: () => debouncedSelectExchange(exchangeCode),
            },
            { text: "🏠 Main Menu", action: debouncedShowExchangeOptions },
          ],
        });
      });
    } catch (error) {
      handleError("Unable to fetch stock price. Please try again later.");
      console.error("Stock Price Retrieval Error:", error);
    }
  }, 300);

  return (
    <div className="flex flex-col h-[90vh] max-h-[90vh] chat-container bg-gray-50 shadow-lg rounded-lg overflow-hidden">
      <Header title="LSEG Stock Assistant" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isActive={message.id === activeMessageId}
              disabled={
                loading ||
                (activeMessageId !== null && message.id !== activeMessageId)
              }
            />
          ))}
        </AnimatePresence>
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-200 bg-white flex items-center">
        <input
          type="text"
          placeholder="Enter your message..."
          className="flex-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-full py-2 px-4 placeholder-gray-400 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-gray-200"
          disabled
        />
      </div>
    </div>
  );
};

export default Chatbot;
