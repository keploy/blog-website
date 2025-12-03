'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function BlogRagChat() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[60vh] md:h-[75vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Keploy Assistant</h3>
              </div>
              <button
                onClick={toggleChat}
                className="hover:bg-blue-500 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Chat window initialized
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about our Keploy..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 transition-colors"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}