import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Send, Trash2, Volume2, VolumeX, Copy, Check, Settings, Loader } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API anahtarını çevresel değişkenlerden al ve konsola yazdır (sadece geliştirme aşamasında)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key:', API_KEY ? 'Mevcut' : 'Bulunamadı');

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Model = 'gemini-1.5-pro' | 'gemini-1.5-flash';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<Model>('gemini-1.5-pro');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Uygulama yüklendiğinde çalışacak
    console.log('App yüklendi');
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!API_KEY) {
      setError("API anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.");
      return;
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: model });
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: input }] }],
        generationConfig: {
          temperature: temperature,
        },
      });
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Yanıt oluşturulurken hata:', error);
      setError('Bir hata oluştu. Lütfen API anahtarınızı ve bağlantınızı kontrol edin.');
      setMessages([...newMessages, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
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

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <header className="bg-blue-600 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gemini Chatbot</h1>
        <div className="flex items-center space-x-4">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as Model)}
            className="bg-white text-gray-900 px-2 py-1 rounded"
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
          <label className="block mb-2">
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
      
      <div ref={chatContainerRef} className="flex-1 overflow-auto p-4 chat-container bg-gray-100 dark:bg-gray-800">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'}`}>
              {message.content}
            </div>
            <div className="mt-1 flex justify-end space-x-2">
              <button onClick={() => copyToClipboard(message.content, index)} className="text-sm text-gray-500 dark:text-gray-400">
                {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
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
      </div>
    </div>
  );
}

export default App;