import React, { useState, useEffect } from 'react';
import { Sun, Moon, Send, Trash2, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API anahtarını buraya gömüyoruz
const API_KEY = 'YOUR_API_KEY_HERE';

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

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: model });
      const result = await geminiModel.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Yanıt oluşturulurken hata:', error);
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
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
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
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
              {message.content}
            </div>
            <div className="mt-1 flex justify-end space-x-2">
              <button onClick={() => copyToClipboard(message.content, index)} className="text-sm text-gray-500">
                {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button onClick={() => speakMessage(message.content)} className="text-sm text-gray-500">
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı yazın..."
            className="flex-1 p-2 border rounded"
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
