/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Movie, UserProfile } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ColdStartWizard } from './components/ColdStartWizard';
import { WatchlistPage } from './pages/WatchlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MovieDetailModal } from './components/MovieDetailModal';
import { TrailerModal } from './components/TrailerModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Bot, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'recommendations' | 'watchlist' | 'profile' | 'admin'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  // Modals state
  const [selectedMovieModal, setSelectedMovieModal] = useState<Movie | null>(null);
  const [trailerModalMovie, setTrailerModalMovie] = useState<Movie | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Initialize User session & Movies Library
  useEffect(() => {
    api.getMe()
      .then(res => {
        setUser(res.user);
        // Show onboarding if brand new user without ratings or seed preferences
        if (res.user && res.user.interactionCount === 0 && (!res.user.favoriteGenres || res.user.favoriteGenres.length === 0)) {
          const onboardingDone = localStorage.getItem(`cinemeta_onboarded_${res.user.id}`);
          if (!onboardingDone) {
            setIsOnboardingModalOpen(true);
          }
        }
      })
      .catch(err => console.error('Guest session initialized:', err));

    api.getPopularMovies()
      .then(movies => setAllMovies(movies))
      .catch(err => console.error('Movies fetch error:', err));
  }, []);

  // Handlers for User Interactions
  const handleRateMovie = async (movieId: number, rating: number) => {
    try {
      const updatedUser = await api.rateMovie(movieId, rating);
      setUser(updatedUser);
    } catch (err) {
      console.error('Rate error:', err);
    }
  };

  const handleToggleWatchlist = async (movieId: number) => {
    try {
      const res = await api.toggleWatchlist(movieId);
      setUser(res.user);
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const handleToggleLike = async (movieId: number) => {
    try {
      const res = await api.toggleLike(movieId);
      setUser(res.user);
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleToggleDislike = async (movieId: number) => {
    try {
      const res = await api.toggleDislike(movieId);
      setUser(res.user);
    } catch (err) {
      console.error('Dislike toggle error:', err);
    }
  };

  const handleToggleWatched = async (movieId: number) => {
    try {
      const res = await api.toggleWatched(movieId);
      setUser(res.user);
    } catch (err) {
      console.error('Watched toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-red-600 selection:text-white flex flex-col">
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(v) => setCurrentView(v as any)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenMovieModal={(movie) => setSelectedMovieModal(movie)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main Page Views */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <HomePage
            user={user}
            allMovies={allMovies}
            onOpenDetails={(movie) => setSelectedMovieModal(movie)}
            onPlayTrailer={(movie) => setTrailerModalMovie(movie)}
            onToggleWatchlist={handleToggleWatchlist}
            onRateMovie={handleRateMovie}
            onNavigateToRecommendations={() => setCurrentView('recommendations')}
          />
        )}

        {currentView === 'recommendations' && (
          <ColdStartWizard
            user={user}
            allMovies={allMovies}
            onOpenDetails={(movie) => setSelectedMovieModal(movie)}
            onPlayTrailer={(movie) => setTrailerModalMovie(movie)}
            onToggleWatchlist={handleToggleWatchlist}
            onRateMovie={handleRateMovie}
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
          />
        )}

        {currentView === 'watchlist' && (
          <WatchlistPage
            user={user}
            allMovies={allMovies}
            onOpenDetails={(movie) => setSelectedMovieModal(movie)}
            onPlayTrailer={(movie) => setTrailerModalMovie(movie)}
            onToggleWatchlist={handleToggleWatchlist}
            onRateMovie={handleRateMovie}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
            onLogout={async () => {
              await api.logout();
              setUser(null);
              setCurrentView('home');
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage allMovies={allMovies} />
        )}
      </main>

      {/* Floating AI Assistant Trigger */}
      <button
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-full shadow-2xl shadow-red-600/50 flex items-center gap-2 transition-all hover:scale-110 active:scale-95 group border border-white/20"
        title="Open AI Movie Concierge"
        id="floating-ai-assistant-btn"
      >
        <Bot className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline text-xs font-bold pr-1">Ask AI</span>
      </button>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">CINEMETA</span>
            <span>— Personalized Hybrid Movie Recommendation Platform</span>
          </div>
          <p>© 2026 CINEMETA. Built with Meta-Learning ML, Bcrypt, JWT, and Explainable AI.</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedMovieModal && (
        <MovieDetailModal
          movie={selectedMovieModal}
          isInWatchlist={user ? user.watchlistMovieIds?.includes(selectedMovieModal.id) || false : false}
          isLiked={user ? user.likedMovieIds?.includes(selectedMovieModal.id) || false : false}
          isDisliked={user ? user.dislikedMovieIds?.includes(selectedMovieModal.id) || false : false}
          isWatched={user ? user.watchedMovieIds?.includes(selectedMovieModal.id) || false : false}
          userRating={user ? user.ratings[selectedMovieModal.id] : undefined}
          onClose={() => setSelectedMovieModal(null)}
          onSelectMovie={(m) => setSelectedMovieModal(m)}
          onPlayTrailer={(m) => {
            setSelectedMovieModal(null);
            setTrailerModalMovie(m);
          }}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleLike={handleToggleLike}
          onToggleDislike={handleToggleDislike}
          onToggleWatched={handleToggleWatched}
          onRateMovie={handleRateMovie}
        />
      )}

      {trailerModalMovie && (
        <TrailerModal
          movie={trailerModalMovie}
          onClose={() => setTrailerModalMovie(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            if (u.interactionCount === 0) {
              setIsOnboardingModalOpen(true);
            }
          }}
        />
      )}

      {isOnboardingModalOpen && (
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onComplete={(updatedUser) => {
            setUser(updatedUser);
            setIsOnboardingModalOpen(false);
            if (updatedUser) {
              localStorage.setItem(`cinemeta_onboarded_${updatedUser.id}`, 'true');
            }
            setCurrentView('recommendations');
          }}
        />
      )}

      {isAiAssistantOpen && (
        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          onSelectMovie={(movie) => setSelectedMovieModal(movie)}
        />
      )}
    </div>
  );
}
