"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import hero from "../../assets/hero-banner.png";
import { IonIcon } from "@ionic/react";
import { play } from "ionicons/icons";
import animationData from "../../assets/animation.json";
import Lottie from "lottie-react";
import axios from "axios";

const solutions = [
  "Recycling Solution",
  "Disposible Solution",
  "Facility Locator",
];

const solutionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Error Boundary Component
class ChatErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-600 p-3">Error in chatbox. Please refresh.</div>;
    }
    return this.props.children;
  }
}

const HeroSection: React.FC = () => {
  const [currentSolution, setCurrentSolution] = useState(solutions[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Cycle through solutions
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = solutions.indexOf(currentSolution);
      const nextIndex = (currentIndex + 1) % solutions.length;
      setCurrentSolution(solutions[nextIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSolution]);

  // Close chatbox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    console.log("handleSendMessage called with input:", userInput);
    if (!userInput.trim()) {
      console.log("Empty input, returning");
      return;
    }

    const newMessage: ChatMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userInput,
      });
      console.log("API response:", response.data);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error.response?.status === 404
          ? "Chat service unavailable. Please check if the backend server is running."
          : "Sorry, something went wrong. Try again later.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      console.log("Enter key pressed, calling handleSendMessage");
      handleSendMessage();
    }
  };

  return (
    <section className="section hero" id="home" aria-label="hero">
      <div className="container mx-auto px-4">
        <div className="hero-content text-center">
          <h1 className="h1 hero-title text-center md:text-start font-bold mb-6">
            Your technology partner for Innovative and Impactful
            <br />
            <motion.span
              className="text-go-green pt-2"
              variants={solutionVariants}
              initial="initial"
              animate="animate"
              key={currentSolution}
            >
              E-Waste {""}
              {currentSolution}
            </motion.span>
          </h1>

          <p className="text-white mb-8 robber text-center md:text-start">
            Scraply: Transforming E-Waste Management. Find E-waste facilities effortlessly
            with our platform. Your key to responsible recycling and sustainability.
          </p>

          <div className="flex flex-row md:flex-row items-center justify-center md:justify-start sm:space-y-0 md:space-x-4 mb-10">
            <Link href="/recycle" className="btn btn-primary mr-4">
              Start Recycling
            </Link>
            <Link href="/e-facilities" className="btn btn-primary mr-4">
              Locate Facility
            </Link>
            <Link href="#" className="flex items-center text-primary">
              <div className="btn-icon mr-2">
                <IonIcon
                  icon={play}
                  aria-hidden="true"
                  role="img"
                  className="md hydrated"
                />
              </div>
              <span className="font-semibold ml-4">How it works</span>
            </Link>
          </div>
        </div>

        <div className="hero-banner has-before img-holder mx-auto mb-16">
          <Lottie animationData={animationData} />
        </div>

        {/* Chat with Gemini Button */}
        <button
          className="aiChat fixed bottom-10 right-5 bg-go-green text-white rounded-md px-5 py-3 text-sm font-semibold shadow-md cursor-pointer z-50"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          Chat with Gemini
        </button>

        {/* Chatbox Dropdown */}
        {isChatOpen && (
          <ChatErrorBoundary>
            <div
              ref={chatBoxRef}
              className="fixed bottom-24 right-5 w-90 bg-white rounded-md shadow-md z-50 flex flex-col"
              style={{ border: "2px solid var(--go-green)", maxHeight: "400px" }}
            >
              {/* Chat Header */}
              <div
                className="bg-go-green text-white p-3 rounded-t-md flex justify-between items-center"
              >
                <h3 className="text-sm font-semibold">Chat with Gemini</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-100">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm">Start chatting...</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-md text-sm ${
                        msg.role === "user"
                          ? "bg-go-green text-white ml-auto max-w-[80%]"
                          : "bg-white text-gray-800 border border-gray-200 max-w-[80%]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="text-gray-500 text-sm">Typing...</div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask something..."
                    className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-go-green"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="ml-2 bg-go-green text-white p-2 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </ChatErrorBoundary>
        )}
      </div>
    </section>
  );
};

export default HeroSection;