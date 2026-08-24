import React, { useState, useEffect } from 'react';
import { Movie, RecommendationResult, UserProfile } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { api } from '../services/api';

interface HomePageProps {
  user: UserProfile | null;
  allMovies: Movie[];
  onOpenDetails: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onToggleWatchlist: (movieId: number) => void;
  onRateMovie: (movieId: number, rating: number) => void;
  onNavigateToRecommendations: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  allMovies,
  onOpenDetails,
  onPlayTrailer,
  onToggleWatchlist,
  onRateMovie,
  onNavigateToRecommendations
}) => {
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationResult[]>([]);
  const [recommendationMap, setRecommendationMap] = useState<Map<number, RecommendationResult>>(new Map());
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // Fetch categorized movie sets
    api.getPopularMovies().then(m => setPopularMovies(m)).catch(err => console.error(err));
    api.getTopRatedMovies().then(m => setTopRatedMovies(m)).catch(err => console.error(err));
    api.getTrendingMovies().then(m => setTrendingMovies(m)).catch(err => console.error(err));

    // Fetch AI recommendations for Home row
    api.generateRecommendations()
      .then(res => {
        setAiRecommendations(res.recommendations);
        const map = new Map<number, RecommendationResult>();
        res.recommendations.forEach(r => map.set(r.movie.id, r));
        setRecommendationMap(map);
      })
      .catch(err => console.error('AI rec error:', err));
  }, [user]);

  const heroMovie = allMovies[0] || popularMovies[0];

  const watchlistIds = user ? user.watchlistMovieIds : [];
  const userRatings = user ? user.ratings : {};

  // Categorize movies by genre for specific rows
  const sciFiMovies = allMovies.filter(m =>
    Array.isArray(m.genres) && m.genres.some(g => (typeof g === 'string' ? g : g.name) === 'Science Fiction')
  );

  const crimeDramaMovies = allMovies.filter(m =>
    Array.isArray(m.genres) && m.genres.some(g => ['Crime', 'Drama'].includes(typeof g === 'string' ? g : g.name))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-8">
      {/* Featured Hero Banner */}
      {heroMovie && (
        <HeroBanner
          movie={heroMovie}
          isInWatchlist={watchlistIds.includes(heroMovie.id)}
          userRating={userRatings[heroMovie.id]}
          onOpenDetails={onOpenDetails}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          onRateMovie={onRateMovie}
        />
      )}

      {/* Recommended For You AI Row */}
      {aiRecommendations.length > 0 && (
        <MovieRow
          title="Recommended For You"
          subtitle="Personalized selections automatically tailored to your taste"
          isAiRecommended={true}
          movies={aiRecommendations.map(r => r.movie)}
          recommendationMap={recommendationMap}
          watchlistIds={watchlistIds}
          userRatings={userRatings}
          onOpenDetails={onOpenDetails}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          onRateMovie={onRateMovie}
        />
      )}

      {/* Trending Movies */}
      <MovieRow
        title="Trending This Week"
        subtitle="Popular films buzzing across global audiences"
        movies={trendingMovies.length > 0 ? trendingMovies : allMovies}
        watchlistIds={watchlistIds}
        userRatings={userRatings}
        onOpenDetails={onOpenDetails}
        onPlayTrailer={onPlayTrailer}
        onToggleWatchlist={onToggleWatchlist}
        onRateMovie={onRateMovie}
      />

      {/* Top Rated Masterpieces */}
      <MovieRow
        title="Top Rated Masterpieces"
        subtitle="Highest voted cinema in TMDb database"
        movies={topRatedMovies.length > 0 ? topRatedMovies : allMovies}
        watchlistIds={watchlistIds}
        userRatings={userRatings}
        onOpenDetails={onOpenDetails}
        onPlayTrailer={onPlayTrailer}
        onToggleWatchlist={onToggleWatchlist}
        onRateMovie={onRateMovie}
      />

      {/* Sci-Fi & Action Essentials */}
      <MovieRow
        title="Sci-Fi & Action Essentials"
        subtitle="Mind-bending adventures and futuristic landscapes"
        movies={sciFiMovies.length > 0 ? sciFiMovies : allMovies}
        watchlistIds={watchlistIds}
        userRatings={userRatings}
        onOpenDetails={onOpenDetails}
        onPlayTrailer={onPlayTrailer}
        onToggleWatchlist={onToggleWatchlist}
        onRateMovie={onRateMovie}
      />

      {/* Crime & Drama Classics */}
      <MovieRow
        title="Crime & Drama Classics"
        subtitle="Intense character studies and cinematic storytelling"
        movies={crimeDramaMovies.length > 0 ? crimeDramaMovies : allMovies}
        watchlistIds={watchlistIds}
        userRatings={userRatings}
        onOpenDetails={onOpenDetails}
        onPlayTrailer={onPlayTrailer}
        onToggleWatchlist={onToggleWatchlist}
        onRateMovie={onRateMovie}
      />
    </div>
  );
};
