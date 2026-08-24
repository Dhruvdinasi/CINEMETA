import React, { useState, useEffect } from 'react';
import { X, Film, ExternalLink, Play } from 'lucide-react';
import { Movie, MovieTrailerResult } from '../types';
import { api } from '../services/api';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  const [trailerData, setTrailerData] = useState<MovieTrailerResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      api.getMovieTrailer(movie.id)
        .then(data => setTrailerData(data))
        .catch(err => {
          console.warn('Could not load specific trailer key:', err);
          // Fallback
          setTrailerData({
            key: movie.trailer_key || 'YoHD9XEInc0',
            name: `${movie.title} Trailer`,
            site: 'YouTube',
            type: 'Trailer',
            official: true,
            videoUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(movie.title + ' official trailer')}&autoplay=1&rel=0&modestbranding=1`
          });
        })
        .finally(() => setLoading(false));
    }
  }, [movie]);

  if (!movie) return null;

  const iframeSrc = trailerData?.videoUrl ||
    (movie.trailer_key
      ? `https://www.youtube-nocookie.com/embed/${movie.trailer_key}?autoplay=1&rel=0&modestbranding=1`
      : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(movie.title + ' official trailer')}&autoplay=1&rel=0&modestbranding=1`);

  const directYouTubeUrl = trailerData?.key
    ? `https://www.youtube.com/watch?v=${trailerData.key}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-800/40 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {trailerData?.name || 'Official Movie Trailer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={directYouTubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 font-semibold"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Close Trailer"
              id="close-trailer-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading verified trailer...
            </div>
          ) : (
            <iframe
              src={iframeSrc}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};
