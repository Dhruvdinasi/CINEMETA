import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Movie, RecommendationResult } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  isAiRecommended?: boolean;
  movies: Movie[];
  recommendationMap?: Map<number, RecommendationResult>;
  watchlistIds?: number[];
  userRatings?: Record<number, number>;
  onOpenDetails: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onToggleWatchlist: (movieId: number) => void;
  onRateMovie: (movieId: number, rating: number) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  isAiRecommended = false,
  movies,
  recommendationMap,
  watchlistIds = [],
  userRatings = {},
  onOpenDetails,
  onPlayTrailer,
  onToggleWatchlist,
  onRateMovie
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {/* Row Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            {isAiRecommended && (
              <div className="p-1 rounded bg-red-950/80 border border-red-800/60 text-red-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Scroll Control Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map(movie => {
          const recResult = recommendationMap ? recommendationMap.get(movie.id) : undefined;
          const inWatchlist = watchlistIds.includes(movie.id);
          const rating = userRatings[movie.id];

          return (
            <div
              key={movie.id}
              className="flex-none w-36 sm:w-44 md:w-52 snap-start"
            >
              <MovieCard
                movie={movie}
                recommendationDetails={recResult}
                isInWatchlist={inWatchlist}
                userRating={rating}
                onOpenDetails={onOpenDetails}
                onPlayTrailer={onPlayTrailer}
                onToggleWatchlist={onToggleWatchlist}
                onRateMovie={onRateMovie}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
