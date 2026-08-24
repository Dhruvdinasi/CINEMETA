import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Play,
  Tv,
  Film,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Movie } from '../types';
import { api } from '../services/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  recommendedMovies?: Movie[];
  timestamp: string;
}

const EXAMPLE_PROMPTS = [
  'Fast-paced psychological thrillers with high ratings',
  'Kannada and Indian blockbusters like Kantara or KGF',
  'Mind-bending sci-fi movies similar to Interstellar',
  'Relaxing, uplifting movies for family movie night'
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your CINEMETA Concierge. Ask me for personalized recommendations by mood, plot themes, directors, or constraints (e.g. "Mind-bending thrillers under 2 hours"). All recommendations are verified against our real catalog and streaming database.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.sendAssistantMessage(query);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: response.reply,
        recommendedMovies: response.recommendedMovies,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errorMsg: Message = {
        sender: 'assistant',
        text: 'I apologize, but I encountered an issue matching candidates from our database. Please try another query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">CINEMETA AI Assistant</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Grounded Catalog
                </span>
              </div>
              <p className="text-xs text-zinc-400">Natural-language movie discovery powered by hybrid ML priors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white rounded-br-none shadow-lg shadow-red-600/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Candidate Movie Cards if attached */}
                {msg.recommendedMovies && msg.recommendedMovies.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800/80">
                    {msg.recommendedMovies.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => {
                          onSelectMovie(movie);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-red-500/50 flex gap-2.5 items-center cursor-pointer transition-all group"
                      >
                        <img
                          src={movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : '/placeholder-poster.jpg'}
                          alt={movie.title}
                          className="w-12 aspect-[2/3] object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {movie.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                            <span>{movie.release_date?.substring(0, 4)}</span>
                            <span className="text-amber-400 font-bold">★ {movie.vote_average?.toFixed(1)}</span>
                          </div>
                          <span className="text-[9px] text-red-400 font-semibold flex items-center gap-0.5 mt-1">
                            View details & streaming <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className={`text-[9px] block ${msg.sender === 'user' ? 'text-red-200 text-right' : 'text-zinc-500'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs p-3 bg-zinc-900/60 rounded-xl max-w-xs border border-zinc-800 animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing catalog & semantic preferences...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-zinc-500 font-semibold shrink-0 uppercase tracking-wider">Try:</span>
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[11px] whitespace-nowrap shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g., 'Recommend sci-fi thrillers with mind-bending plots')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
