import React, { useState, useEffect } from 'react';
import {
  Search,
  Film,
  Bookmark,
  Sparkles,
  User,
  LogOut,
  History,
  Compass,
  BarChart3,
  Bot,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Movie, UserProfile } from '../types';
import { api } from '../services/api';
import { getImageUrl } from '../data/mockMovies';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenMovieModal: (movie: Movie) => void;
  onOpenOnboarding?: () => void;
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onOpenAuthModal,
  onOpenMovieModal,
  onOpenOnboarding,
  onOpenAiAssistant
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchMovies(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 group text-left focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                CINEMETA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-widest text-red-500 uppercase px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40">
                META-LEARNING AI
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('home')}
              id="nav-home-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-500" />
              Explore
            </button>
            <button
              onClick={() => setCurrentView('recommendations')}
              id="nav-recommendations-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'recommendations'
                  ? 'bg-red-950/80 text-rose-300 border border-red-800/50 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              AI Recommendations
            </button>
            <button
              onClick={() => setCurrentView('watchlist')}
              id="nav-watchlist-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'watchlist'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              My Library
              {user && user.watchlistMovieIds && user.watchlistMovieIds.length > 0 && (
                <span className="ml-1 text-xs bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-700/50">
                  {user.watchlistMovieIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              id="nav-admin-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Admin & Analytics
            </button>
          </nav>
        </div>

        {/* Search Bar & User Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* AI Assistant Button */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600/20 to-amber-600/20 hover:from-red-600/30 hover:to-amber-600/30 border border-red-500/30 text-rose-300 hover:text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Open AI Movie Concierge"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI Concierge</span>
            </button>
          )}

          {/* Onboarding Calibrate Button */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="hidden lg:flex px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-full text-xs font-semibold items-center gap-1.5 transition-colors"
              title="Calibrate Cold-Start Vector"
            >
              <Sliders className="w-3.5 h-3.5 text-red-500" />
              <span>Calibrate Taste</span>
            </button>
          )}

          {/* Instant Search Bar */}
          <div className="relative w-36 sm:w-56 md:w-64">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all placeholder:text-zinc-500"
                id="movie-search-input"
              />
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    Searching TMDb database...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No movies found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Movies Found ({searchResults.length})
                    </div>
                    {searchResults.slice(0, 6).map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => {
                          onOpenMovieModal(movie);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg text-left transition-colors group"
                      >
                        <img
                          src={getImageUrl(movie.poster_path, 'w500')}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-white">
                            {movie.title}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate">
                            {movie.release_date?.substring(0, 4)} • {movie.director || 'Popular'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-amber-400 font-bold">
                              ★ {movie.vote_average.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {Array.isArray(movie.genres) ? movie.genres.slice(0, 2).map(g => typeof g === 'string' ? g : g.name).join(', ') : ''}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile / Auth Button */}
          {user ? (
            <button
              onClick={() => setCurrentView('profile')}
              id="user-profile-btn"
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-1.5 sm:px-3 rounded-full text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-800"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline-block max-w-[100px] truncate">
                {user.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">
                {user.interactionCount}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              id="login-register-btn"
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-red-900/40 transition-all hover:scale-105"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
