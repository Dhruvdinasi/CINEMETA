import React, { useState } from 'react';
import { Bookmark, Heart, ThumbsDown, Star } from 'lucide-react';
import { Movie, UserProfile } from '../types';
import { MovieCard } from '../components/MovieCard';

interface WatchlistPageProps {
  user: UserProfile | null;
  allMovies: Movie[];
  onOpenDetails: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onToggleWatchlist: (movieId: number) => void;
  onRateMovie: (movieId: number, rating: number) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  user,
  allMovies,
  onOpenDetails,
  onPlayTrailer,
  onToggleWatchlist,
  onRateMovie
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'liked' | 'rated'>('watchlist');

  const watchlistMovieIds = user ? user.watchlistMovieIds : [];
  const likedMovieIds = user ? user.likedMovieIds : [];
  const ratedMovieIds = user ? Object.keys(user.ratings).map(Number) : [];

  const watchlistMovies = allMovies.filter(m => watchlistMovieIds.includes(m.id));
  const likedMovies = allMovies.filter(m => likedMovieIds.includes(m.id));
  const ratedMovies = allMovies.filter(m => ratedMovieIds.includes(m.id));

  const displayMovies = activeTab === 'watchlist'
    ? watchlistMovies
    : activeTab === 'liked'
    ? likedMovies
    : ratedMovies;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-400" />
            My Personal Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your saved watchlist, liked films, and rated catalog
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Watchlist ({watchlistMovies.length})
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'liked'
                ? 'bg-red-950/80 text-rose-300 border border-red-800/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500" />
            Liked ({likedMovies.length})
          </button>

          <button
            onClick={() => setActiveTab('rated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'rated'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Rated ({ratedMovies.length})
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {displayMovies.length === 0 ? (
        <div className="p-16 text-center text-xs text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 space-y-2">
          <p className="text-sm font-semibold text-zinc-400">No movies in this collection yet.</p>
          <p>Browse the library and add titles or rate movies to populate your preference vectors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={watchlistMovieIds.includes(movie.id)}
              userRating={user ? user.ratings[movie.id] : undefined}
              onOpenDetails={onOpenDetails}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              onRateMovie={onRateMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
};
