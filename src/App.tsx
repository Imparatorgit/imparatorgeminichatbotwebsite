import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Send, Trash2, Volume2, VolumeX, Copy, Check, Settings, Loader, Image as ImageIcon, X, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key:', API_KEY ? 'Mevcut' : 'Bulunamadı');

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Model = 'gemini-1.5-pro' | 'gemini-1.5-flash';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<Model>('gemini-1.5-pro');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!API_KEY) {
      setError("API anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: model });

      let result;
      if (selectedImage) {
        result = { text: () => "Image processing is not yet implemented." };
        setSelectedImage(null);
      } else {
        result = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: input }] }],
          generationConfig: {
            temperature: temperature,
          },
        });
      }

      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Yanıt oluşturulurken hata:', error);
      setError('Bir hata oluştu. Lütfen API anahtarınızı ve bağlantınızı kontrol edin.');
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <aside className={`w-64 bg-gray-100 dark:bg-gray-800 p-4 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Chat History</h2>
        <ul className="space-y-2">
          {messages.map((message) => (
            <li key={message.id} className="text-sm text-gray-600 dark:text-gray-300">
              <span className={`font-bold ${message.role === 'user' ? 'text-blue-500' : 'text-green-500'}`}>
                {message.role === 'user' ? 'You' : 'Assistant'}:
              </span>{' '}
              {message.content.substring(0, 30)}...
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 dark:bg-blue-800 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 text-white md:hidden">
              <MessageSquare size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white">Gemini Chatbot</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as Model)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded"
            >
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
            <button onClick={() => setDarkMode(!darkMode)} className="text-white">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-white">
              <Settings size={24} />
            </button>
          </div>
        </header>
        
        {showSettings && (
          <div className="bg-gray-200 dark:bg-gray-700 p-4">
            <label className="block mb-2 text-gray-800 dark:text-white">
              Temperature:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="ml-2"
              />
              {temperature}
            </label>
          </div>
        )}
        
        <div ref={chatContainerRef} className="flex-1 overflow-auto p-4 chat-container bg-white dark:bg-gray-900">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'}`}>
                {message.content}
              </div>
              <div className="mt-1 flex justify-end space-x-2">
                <button onClick={() => copyToClipboard(message.content, message.id)} className="text-sm text-gray-500 dark:text-gray-400">
                  {copiedIndex === message.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button onClick={() => speakMessage(message.content)} className="text-sm text-gray-500 dark:text-gray-400">
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin text-blue-500" size={24} />
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <label className="bg-green-600 text-white p-2 rounded cursor-pointer">
              <ImageIcon size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded" disabled={isLoading}>
              <Send size={24} />
            </button>
            <button onClick={clearHistory} className="bg-red-600 text-white p-2 rounded">
              <Trash2 size={24} />
            </button>
            {isSpeaking && (
              <button onClick={stopSpeaking} className="bg-yellow-600 text-white p-2 rounded">
                <VolumeX size={24} />
              </button>
            )}
          </div>
          {selectedImage && (
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Selected image: {selectedImage.name}
              </span>
              <button
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;