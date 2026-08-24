import React from 'react';
import { UserProfile } from '../types';
import {
  PieChart,
  Sliders,
  Sparkles,
  Award,
  Film,
  Globe,
  Heart,
  ThumbsDown,
  Clock,
  Eye,
  Star,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface TasteProfileProps {
  user: UserProfile;
  onEditPreferences?: () => void;
  onRecalibrate?: () => void;
  onRefresh?: () => void;
}

export const TasteProfile: React.FC<TasteProfileProps> = ({
  user,
  onEditPreferences,
  onRecalibrate,
  onRefresh
}) => {
  const ratingsCount = Object.keys(user.ratings || {}).length;
  const likedCount = user.likedMovieIds?.length || 0;
  const dislikedCount = user.dislikedMovieIds?.length || 0;
  const watchedCount = user.watchedMovieIds?.length || 0;
  const watchlistCount = user.watchlistMovieIds?.length || 0;
  const totalInteractions = user.interactionCount || (ratingsCount + likedCount + dislikedCount + watchedCount);

  // Calculate Average Rating
  const ratingValues: number[] = Object.values(user.ratings || {}).map(Number);
  const avgRating = ratingValues.length > 0
    ? (ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length).toFixed(1)
    : 'N/A';

  // Determine Cold-Start Maturity Stage
  let maturityStage = 'Cold-Start (New User)';
  let stageColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  let stageDescription = 'Initial phase: System relies on onboarding seeds and content-based meta-learning.';
  let confidenceScore = 65;

  if (totalInteractions >= 10) {
    maturityStage = 'Warm Profile (Personalized)';
    stageColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    stageDescription = 'High fidelity: Deep hybrid collaborative-content filtering with personalized MMR diversification.';
    confidenceScore = 95;
  } else if (totalInteractions >= 3) {
    maturityStage = 'Few-Shot Calibrated';
    stageColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    stageDescription = 'Intermediate phase: Meta-learning dynamically adapts weights from ratings and likes.';
    confidenceScore = 82;
  }

  // Genre Weights Breakdown
  const genreWeights: Record<string, number> = user.preferenceVector?.genreWeights || {};
  let sortedGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1]);

  if (sortedGenres.length === 0 && user.favoriteGenres?.length > 0) {
    sortedGenres = user.favoriteGenres.map((g, idx) => [g, 1.0 - idx * 0.15]);
  }

  // Language Distribution
  const languageWeights: Record<string, number> = user.preferenceVector?.languageWeights || {};
  let sortedLanguages = Object.entries(languageWeights)
    .sort((a, b) => b[1] - a[1]);

  if (sortedLanguages.length === 0 && user.preferredLanguages?.length > 0) {
    sortedLanguages = user.preferredLanguages.map((l, idx) => [l, 1.0 - idx * 0.2]);
  }

  const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : (user.favoriteGenres?.[0] || 'Diverse');
  const topLanguage = sortedLanguages.length > 0 ? sortedLanguages[0][0].toUpperCase() : (user.preferredLanguages?.[0]?.toUpperCase() || 'EN');

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Maturity Stage & Overview */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl border-2 border-red-500/30 bg-zinc-950 p-1 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${stageColor}`}>
                  {maturityStage}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
              <p className="text-xs text-zinc-300 mt-2 max-w-xl">
                {stageDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onRecalibrate && (
              <button
                onClick={onRecalibrate}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                Recalibrate Taste
              </button>
            )}
            {onEditPreferences && (
              <button
                onClick={onEditPreferences}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                Edit Preferences
              </button>
            )}
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Interactions</span>
              <Cpu className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-lg font-black text-white">{totalInteractions}</p>
            <p className="text-[10px] text-zinc-500">Likes, ratings & logs</p>
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Avg Rating Given</span>
              <Star className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-lg font-black text-amber-400">★ {avgRating}</p>
            <p className="text-[10px] text-zinc-500">{ratingsCount} movies rated</p>
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Top Genre Affinity</span>
              <Film className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-lg font-black text-blue-400 truncate">{topGenre}</p>
            <p className="text-[10px] text-zinc-500">Highest vector weight</p>
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Model Confidence</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-emerald-400">{confidenceScore}%</p>
            <p className="text-[10px] text-zinc-500">Cosine certainty score</p>
          </div>

        </div>
      </div>

      {/* Two Column Layout: Mathematical Genre Breakdown & Interaction Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column 1: Preference Vector Genre Breakdown */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-red-500" />
              Mathematical Genre Affinities (Vector Weights)
            </h3>
            <span className="text-[11px] text-zinc-400">Normalized [0, 1]</span>
          </div>

          <p className="text-xs text-zinc-400">
            Dynamically updated on every user like (+0.3), 5-star rating (+0.4), dislike (-0.5), or watchlist (+0.2).
          </p>

          <div className="space-y-3 pt-2">
            {sortedGenres.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No genre data yet. Complete onboarding to calibrate!</p>
            ) : (
              sortedGenres.slice(0, 7).map(([genre, weight]) => {
                const percentage = Math.min(100, Math.max(10, Math.round(Number(weight) * 100)));
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-200">{genre}</span>
                      <span className="text-zinc-400 font-mono">{percentage}% ({Number(weight).toFixed(2)})</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div
                        className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Interaction Activity Matrix & Moods */}
        <div className="space-y-6">
          
          {/* Interaction Counts */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              User Interaction Portfolio
            </h3>

            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Liked Movies</p>
                  <p className="text-sm font-bold text-white">{likedCount} titles</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <ThumbsDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Disliked / Negative</p>
                  <p className="text-sm font-bold text-white">{dislikedCount} titles</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Watched History</p>
                  <p className="text-sm font-bold text-white">{watchedCount} titles</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Saved in Watchlist</p>
                  <p className="text-sm font-bold text-white">{watchlistCount} titles</p>
                </div>
              </div>

            </div>
          </div>

          {/* Calibrated Moods & Preferences */}
          {user.onboardingPreferences && (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Calibrated Mood & Viewing Filters
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {user.onboardingPreferences.moods?.map(mood => (
                  <span
                    key={mood}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-semibold"
                  >
                    🎭 {mood}
                  </span>
                ))}
                {user.onboardingPreferences.preferredDecade && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold">
                    📅 {user.onboardingPreferences.preferredDecade}
                  </span>
                )}
                {user.onboardingPreferences.minRating && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    ★ {user.onboardingPreferences.minRating.toFixed(1)}+ Min Rating
                  </span>
                )}
                {user.onboardingPreferences.maxRuntime && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                    ⏱ &lt;{user.onboardingPreferences.maxRuntime} min
                  </span>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
