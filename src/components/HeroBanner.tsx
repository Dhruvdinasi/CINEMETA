import React from 'react';
import { Play, Plus, Star, Sparkles, Check, Info } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../data/mockMovies';

interface HeroBannerProps {
  movie: Movie;
  isInWatchlist: boolean;
  userRating?: number;
  onOpenDetails: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onToggleWatchlist: (movieId: number) => void;
  onRateMovie: (movieId: number, rating: number) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  isInWatchlist,
  userRating,
  onOpenDetails,
  onPlayTrailer,
  onToggleWatchlist,
  onRateMovie
}) => {
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const genresList = Array.isArray(movie.genres)
    ? movie.genres.map(g => typeof g === 'string' ? g : g.name)
    : [];

  return (
    <div className="relative w-full h-[65vh] min-h-[420px] max-h-[600px] rounded-2xl overflow-hidden mb-8 border border-zinc-800/60 shadow-2xl group">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 bg-zinc-950">
        <img
          src={backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Gradient overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-10 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Tagline or Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest bg-red-600 text-white uppercase shadow-md shadow-red-900/50">
              FEATURED FILM
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {movie.vote_average.toFixed(1)} TMDb Score
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {movie.title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <span>{movie.release_date?.substring(0, 4)}</span>
            <span>•</span>
            <span>{movie.runtime ? `${movie.runtime} min` : '148 min'}</span>
            <span>•</span>
            <div className="flex flex-wrap gap-1.5">
              {genresList.slice(0, 3).map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Overview */}
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl">
            {movie.overview}
          </p>

          {/* User Quick Rating Controls */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Rate this movie:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onRateMovie(movie.id, star)}
                  className={`p-1 rounded transition-colors ${
                    (userRating || 0) >= star
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-zinc-600 hover:text-amber-400'
                  }`}
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star className={`w-4 h-4 ${ (userRating || 0) >= star ? 'fill-amber-400' : '' }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlayTrailer(movie)}
              id="hero-play-trailer-btn"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              Watch Trailer
            </button>

            <button
              onClick={() => onToggleWatchlist(movie.id)}
              id="hero-watchlist-btn"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border ${
                isInWatchlist
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              {isInWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              {isInWatchlist ? 'In Library' : 'Add to Library'}
            </button>

            <button
              onClick={() => onOpenDetails(movie)}
              id="hero-more-info-btn"
              className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Info className="w-4 h-4" />
              Details & AI Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
