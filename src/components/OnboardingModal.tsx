import React, { useState, useEffect } from 'react';
import { Movie, UserProfile, OnboardingPreferences } from '../types';
import { api } from '../services/api';
import {
  Film,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Sliders,
  Compass,
  Star,
  Clock,
  Calendar,
  Smile,
  Zap,
  X
} from 'lucide-react';

interface OnboardingModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedUser: UserProfile) => void;
  onOpenDetails?: (movie: Movie) => void;
}

const AVAILABLE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Western'
];

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'de', name: 'German', native: 'Deutsch' }
];

const AVAILABLE_MOODS = [
  { name: 'Thought-provoking', emoji: '🧠', desc: 'Mind-bending & philosophical' },
  { name: 'Suspenseful', emoji: '⚡', desc: 'Edge-of-your-seat thrillers' },
  { name: 'Fun', emoji: '🎉', desc: 'Lighthearted & entertaining' },
  { name: 'Emotional', emoji: '🥺', desc: 'Heartfelt & touching stories' },
  { name: 'Dark', emoji: '🌑', desc: 'Gritty & atmospheric' },
  { name: 'Inspirational', emoji: '✨', desc: 'Uplifting & motivational' },
  { name: 'Relaxing', emoji: '☕', desc: 'Calm & easy-going' }
];

const DECADE_OPTIONS = [
  { label: '2020s (Recent Releases)', value: '2020s' },
  { label: '2010s (Modern Classics)', value: '2010s' },
  { label: '2000s (Millennium Era)', value: '2000s' },
  { label: '1990s & Earlier (Classics)', value: '1990s' }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1 State: Selected Movies (~5)
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);

  // Step 2 State: Favorite Genres
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.favoriteGenres || ['Sci-Fi', 'Thriller']);

  // Step 3 State: Preferred Languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(user?.preferredLanguages || ['en', 'kn']);

  // Step 4 State: Movie Preferences & Moods
  const [preferredDecade, setPreferredDecade] = useState<string>('2020s');
  const [minRating, setMinRating] = useState<number>(7.0);
  const [maxRuntime, setMaxRuntime] = useState<number>(150);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['Thought-provoking', 'Suspenseful']);

  // Step 5 State: Generated Preview
  const [generatedRecs, setGeneratedRecs] = useState<any[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState<boolean>(false);

  // Fetch initial popular movies for Step 1
  useEffect(() => {
    if (isOpen && catalogMovies.length === 0) {
      setIsLoadingMovies(true);
      api.getPopularMovies()
        .then(movies => {
          setCatalogMovies(movies);
          setIsLoadingMovies(false);
        })
        .catch(err => {
          console.error('Failed to load onboarding movies:', err);
          setIsLoadingMovies(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMovieSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      const pop = await api.getPopularMovies();
      setCatalogMovies(pop);
      return;
    }
    setIsLoadingMovies(true);
    try {
      const results = await api.searchMovies(searchQuery);
      setCatalogMovies(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const toggleSelectMovie = (movie: Movie) => {
    if (selectedMovies.some(m => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter(m => m.id !== movie.id));
    } else {
      if (selectedMovies.length >= 8) {
        alert('You have selected 8 movies, which is great for cold-start initialization!');
      }
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      if (selectedLanguages.length === 1) return; // Keep at least one
      setSelectedLanguages(selectedLanguages.filter(l => l !== langCode));
    } else {
      setSelectedLanguages([...selectedLanguages, langCode]);
    }
  };

  const toggleMood = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  // Step 5 Preview Generation
  const handleProceedToStep5 = async () => {
    setStep(5);
    setIsGeneratingRecs(true);
    try {
      const preferences: OnboardingPreferences = {
        preferredDecade,
        minRating,
        maxRuntime,
        moods: selectedMoods
      };

      const res = await api.generateRecommendations({
        selectedMovieIds: selectedMovies.map(m => m.id),
        selectedMovies
      });
      setGeneratedRecs(res.recommendations || []);
    } catch (err) {
      console.error('Error generating preview:', err);
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const preferences: OnboardingPreferences = {
        preferredDecade,
        minRating,
        maxRuntime,
        moods: selectedMoods
      };

      const res = await api.submitOnboarding({
        favoriteMovieIds: selectedMovies.map(m => m.id),
        favoriteGenres: selectedGenres,
        preferredLanguages: selectedLanguages,
        preferences,
        favoriteMovies: selectedMovies
      });

      onComplete(res.user);
      onClose();
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      alert(err.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Cold-Start Preference Calibration
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-medium">
                  Step {step} of 5
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize your meta-learning recommendation vector in 60 seconds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Skip onboarding for now"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-zinc-800 h-1">
          <div
            className="bg-gradient-to-r from-red-600 to-amber-500 h-1 transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step Content Container */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">

          {/* STEP 1: FAVORITE MOVIES */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-500" />
                    Step 1: Select 3 to 5 Movies You Love
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    These seed movies provide initial feature weights for storylines, genres, and directors.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs font-semibold text-zinc-300">
                  <span>Selected:</span>
                  <span className={`px-2 py-0.5 rounded-md ${selectedMovies.length >= 3 ? 'bg-emerald-600 text-white' : 'bg-red-600/30 text-red-300'}`}>
                    {selectedMovies.length} / 5 recommended
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleMovieSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by title (e.g., Interstellar, Kantara, RRR, Inception, Dune)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Movie Grid */}
              {isLoadingMovies ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 py-8">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-zinc-800/50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {catalogMovies.slice(0, 15).map(movie => {
                    const isSelected = selectedMovies.some(m => m.id === movie.id);
                    return (
                      <div
                        key={movie.id}
                        onClick={() => toggleSelectMovie(movie)}
                        className={`group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-red-500 ring-2 ring-red-500/30 scale-[0.98]'
                            : 'border-transparent hover:border-zinc-700 hover:scale-[1.02]'
                        }`}
                      >
                        <img
                          src={movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : '/placeholder-poster.jpg'}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-between transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="flex justify-end">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-red-600 text-white shadow-md' : 'bg-black/60 text-zinc-300'
                            }`}>
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : '+'}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{movie.title}</p>
                            <p className="text-[10px] text-zinc-300">
                              {movie.release_date?.substring(0, 4)} · ★ {movie.vote_average?.toFixed(1)}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider rounded">
                            Seed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FAVORITE GENRES */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-red-500" />
                  Step 2: Choose Your Favorite Genres
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select 2 or more genres to build initial affinity clusters in the preference vector.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AVAILABLE_GENRES.map(genre => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20 ring-1 ring-red-500/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-sm font-semibold">{genre}</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3" /> : '+'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PREFERRED LANGUAGES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  Step 3: Preferred Cinema Languages
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Multi-language support for regional cinema (Kannada, Hindi, Telugu, Tamil, Malayalam) and Global releases.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_LANGUAGES.map(lang => {
                  const isSelected = selectedLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-900/20 ring-1 ring-red-500/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{lang.name}</p>
                        <p className="text-xs text-zinc-400">{lang.native}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3" /> : '+'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: MOVIE PREFERENCES & MOOD */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-500" />
                  Step 4: Movie Experience & Mood Preferences
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Fine-tune decade horizons, minimum quality rating, runtime ceilings, and psychological moods.
                </p>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  What Moods Best Match Your Watching Style?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {AVAILABLE_MOODS.map(m => {
                    const isSelected = selectedMoods.includes(m.name);
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => toggleMood(m.name)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500 text-white ring-1 ring-amber-500/40'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-zinc-100">{m.name}</p>
                          <p className="text-[11px] text-zinc-400">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Slider & Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                {/* Decade Selection */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    Preferred Decade
                  </label>
                  <select
                    value={preferredDecade}
                    onChange={(e) => setPreferredDecade(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    {DECADE_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Min Rating Threshold */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      Min Quality Rating
                    </label>
                    <span className="text-xs font-extrabold text-amber-400">{minRating.toFixed(1)}+</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="8.5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500">Only recommend movies above this score</p>
                </div>

                {/* Max Runtime */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Max Runtime
                    </label>
                    <span className="text-xs font-extrabold text-blue-400">Under {maxRuntime}m</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="180"
                    step="15"
                    value={maxRuntime}
                    onChange={(e) => setMaxRuntime(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[10px] text-zinc-500">Filter out excessively long films</p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: GENERATE & PREVIEW RECOMMENDATIONS */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-amber-950/30 border border-red-500/30">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Your Personalized Hybrid Recommendation Vector is Ready!
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Synthesized {selectedMovies.length} seed movies, {selectedGenres.length} genres, and {selectedLanguages.length} language weights.
                </p>
              </div>

              {isGeneratingRecs ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400">Computing TF-IDF, embeddings & MMR diversity ranker...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Instant Personalized Recommendations:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {generatedRecs.slice(0, 4).map((rec, idx) => (
                      <div key={rec.movie.id || idx} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-2.5 flex flex-col">
                        <img
                          src={rec.movie.poster_path ? (rec.movie.poster_path.startsWith('http') ? rec.movie.poster_path : `https://image.tmdb.org/t/p/w500${rec.movie.poster_path}`) : '/placeholder-poster.jpg'}
                          alt={rec.movie.title}
                          className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                        />
                        <p className="text-xs font-bold text-white line-clamp-1">{rec.movie.title}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">{rec.confidence_score}% Match</span>
                          <span className="text-zinc-400">★ {rec.movie.vote_average?.toFixed(1)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 italic">
                          {rec.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline font-medium px-2"
            >
              Skip for now
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : step === 4 ? (
              <button
                type="button"
                onClick={handleProceedToStep5}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
              >
                Generate Recommendations
                <Sparkles className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOnboarding}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Profile...' : 'Save & Start Exploring'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
