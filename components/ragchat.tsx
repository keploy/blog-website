'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, MessageCircle, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'author';
  timestamp: Date;
}

const CHAT_STORAGE_KEY = 'keploy_blog_chat_history';

const INITIAL_BOT_MESSAGE: Message = {
  id: 'bot-welcome',
  text: `Hi! 👋 I'm Keploy's AI Assistant. I can help you find information about testing, API testing, and more about Keploy. Ask me anything!`,
  sender: 'bot',
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "What is API testing?",
  "How to get started with Keploy?",
  "Tell me about unit testing best practices",
  "What are test stubs?"
];

export default function RagChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [botStatus, setBotStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showGreetingMessage, setShowGreetingMessage] = useState(true);

  const toggleChat = () => setIsOpen(!isOpen);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check if user has scrolled up to show scroll button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    };

    messagesContainer.addEventListener('scroll', handleScroll);

    setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([INITIAL_BOT_MESSAGE]);
    }
  }, [isOpen, messages.length]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Hide greeting message after 7 seconds
  useEffect(() => {
    if (!isOpen && showGreetingMessage) {
      const timer = setTimeout(() => {
        setShowGreetingMessage(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showGreetingMessage]);

  const TypingIndicator = () => (
    <div className="flex space-x-1 py-2">
      <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    if (isLoading) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Please wait for the current response to complete.',
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const statuses = [
      'Searching docs...',
      'Analyzing content...',
      'Preparing answer...'
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      setBotStatus(statuses[statusIndex]);
      statusIndex = (statusIndex + 1) % statuses.length;
    }, 2000);

    try {
      const response = await fetch('https://docbot.keploy.io/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.answer || "I couldn't find information about that in our knowledge base. Feel free to ask another question!",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      clearInterval(statusInterval);
      setBotStatus('');
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            {showGreetingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
              >
                <p className="font-semibold mb-1">Need help with Keploy?</p>
                <p>Ask me anything about testing!</p>
                <div className="absolute top-full right-4 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-gray-800" />
              </motion.div>
            )}

            <button
              onClick={toggleChat}
              className="rounded-full w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-300 flex items-center justify-center"
              aria-label="Open chat"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 md:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[60vh] md:h-[75vh]"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Keploy Assistant</h3>
                </div>
                <button
                  onClick={toggleChat}
                  className="hover:bg-orange-500 p-1 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-hidden relative">
              <div
                ref={messagesContainerRef}
                className="h-full overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-orange-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {message.sender === 'bot' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-orange-600 dark:text-orange-400 underline hover:opacity-80"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                />
                              ),
                              code: ({ node, inline, children, ...props }: any) =>
                                inline ? (
                                  <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto my-2">
                                    <code className="font-mono" {...props}>{children}</code>
                                  </pre>
                                ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                      <span className={`text-xs mt-1 block opacity-70 ${
                        message.sender === 'user' ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-bl-none px-4 py-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{botStatus}</span>
                      </div>
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}

                {/* Suggested questions */}
                {isOpen && messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mt-4"
                  >
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Try asking:
                    </p>
                    <div className="space-y-2">
                      {SUGGESTED_QUESTIONS.map((question, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ y: -2 }}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left text-xs p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg z-10"
                    title="Scroll to bottom"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about our Keploy..."
                  rows={1}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 dark:focus:ring-orange-400 resize-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg p-2 transition-colors"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}