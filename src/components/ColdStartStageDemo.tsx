import React, { useState } from 'react';
import { UserProfile, Movie, RecommendationResult } from '../types';
import { recommenderEngine } from '../../backend/ml/recommender';
import {
  Cpu,
  Layers,
  Zap,
  Sliders,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ColdStartStageDemoProps {
  onSelectMovie?: (movie: Movie) => void;
}

export const ColdStartStageDemo: React.FC<ColdStartStageDemoProps> = ({ onSelectMovie }) => {
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3'>('stage1');
  const [diversityLambda, setDiversityLambda] = useState<number>(0.75);

  // Synthesize realistic profiles for each stage
  const stage1User: UserProfile = {
    id: 'demo_stage1_new',
    name: 'Stage 1: Pure Cold-Start User',
    email: 'new_user@cinemeta.ai',
    interactionCount: 0,
    favoriteGenres: ['Sci-Fi', 'Thriller'],
    preferredLanguages: ['en', 'kn'],
    favoriteActors: [],
    favoriteDirectors: [],
    likedMovieIds: [],
    dislikedMovieIds: [],
    watchlistMovieIds: [],
    watchedMovieIds: [],
    ratings: {},
    createdAt: new Date().toISOString()
  };

  const stage2User: UserProfile = {
    id: 'demo_stage2_fewshot',
    name: 'Stage 2: Few-Shot Calibrated User',
    email: 'fewshot_user@cinemeta.ai',
    interactionCount: 3,
    favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
    preferredLanguages: ['en', 'kn', 'hi'],
    favoriteActors: ['Christopher Nolan', 'Yash'],
    favoriteDirectors: ['Christopher Nolan'],
    likedMovieIds: [157336, 872585], // Interstellar, Oppenheimer
    dislikedMovieIds: [],
    watchlistMovieIds: [27205], // Inception
    watchedMovieIds: [157336],
    ratings: { 157336: 5, 872585: 5 },
    createdAt: new Date().toISOString()
  };

  const stage3User: UserProfile = {
    id: 'demo_stage3_warm',
    name: 'Stage 3: Warm Profiled User',
    email: 'warm_user@cinemeta.ai',
    interactionCount: 14,
    favoriteGenres: ['Sci-Fi', 'Mystery', 'Crime', 'Drama'],
    preferredLanguages: ['en', 'kn', 'hi', 'te'],
    favoriteActors: ['Christian Bale', 'Leonardo DiCaprio', 'Rishab Shetty'],
    favoriteDirectors: ['Christopher Nolan', 'Denis Villeneuve', 'Rishab Shetty'],
    likedMovieIds: [157336, 872585, 27205, 155, 603, 980078], // Interstellar, Oppenheimer, Inception, Dark Knight, Matrix, Kantara
    dislikedMovieIds: [19995], // Avatar disliked
    watchlistMovieIds: [693134, 157336], // Dune 2
    watchedMovieIds: [157336, 872585, 27205, 155, 603],
    ratings: { 157336: 5, 872585: 5, 27205: 5, 155: 5, 603: 4, 19995: 1 },
    createdAt: new Date().toISOString()
  };

  const currentUser = activeStage === 'stage1' ? stage1User : (activeStage === 'stage2' ? stage2User : stage3User);

  // Generate recommendations on-the-fly for this stage
  const recResult = recommenderEngine.generateUnifiedRecommendations(
    currentUser,
    currentUser.likedMovieIds,
    8,
    diversityLambda
  );

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
      
      {/* Header & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-500" />
            Meta-Learning Cold-Start Live Stage Simulator
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate how our hybrid meta-learning pipeline transitions smoothly from zero-shot priors to rich collaborative ranking.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 pl-2">MMR Diversity λ:</span>
          <input
            type="range"
            min="0.2"
            max="0.95"
            step="0.05"
            value={diversityLambda}
            onChange={(e) => setDiversityLambda(parseFloat(e.target.value))}
            className="w-24 accent-red-500"
            title={`Diversity Lambda: ${diversityLambda.toFixed(2)}`}
          />
          <span className="text-xs font-mono text-zinc-200 pr-2">{diversityLambda.toFixed(2)}</span>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Stage 1 */}
        <button
          type="button"
          onClick={() => setActiveStage('stage1')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStage === 'stage1'
              ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/40'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Stage 1</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">0 Interactions</span>
          </div>
          <h3 className="text-sm font-bold text-white">Pure Cold-Start (New User)</h3>
          <p className="text-[11px] text-zinc-400 mt-1">
            Zero interaction history. Relies on Meta-Learned Category Priors + Language Weights + Popularity Baseline.
          </p>
        </button>

        {/* Stage 2 */}
        <button
          type="button"
          onClick={() => setActiveStage('stage2')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStage === 'stage2'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/40'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Stage 2</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">1-3 Interactions</span>
          </div>
          <h3 className="text-sm font-bold text-white">Few-Shot Adaptive Learning</h3>
          <p className="text-[11px] text-zinc-400 mt-1">
            Meta-weights swiftly adjust towards rated seed movies (e.g. Interstellar, Oppenheimer) via TF-IDF cosine matching.
          </p>
        </button>

        {/* Stage 3 */}
        <button
          type="button"
          onClick={() => setActiveStage('stage3')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStage === 'stage3'
              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/40'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Stage 3</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">10+ Interactions</span>
          </div>
          <h3 className="text-sm font-bold text-white">Full Hybrid Personalization</h3>
          <p className="text-[11px] text-zinc-400 mt-1">
            Mature preference vector activating collaborative cluster signals, negative penalty filters & MMR diversity.
          </p>
        </button>

      </div>

      {/* Meta-Engine Telemetry Details */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Algorithm Dispatched:</span>
          <span className="font-mono font-bold text-red-400">{recResult.algorithmUsed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Decision Reason:</span>
          <span className="text-zinc-200">{recResult.metaDecisionReason}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Intra-List Diversity:</span>
          <span className="font-bold text-emerald-400">{(recResult.metrics?.diversityScore * 100 || 84).toFixed(1)}%</span>
        </div>
      </div>

      {/* Recommended Output Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Recommendations for {currentUser.name} ({recResult.recommendations.length} results)
          </h4>
          <span className="text-[11px] text-zinc-500">Sorted by Meta-Score + MMR Re-Ranking</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recResult.recommendations.slice(0, 8).map((rec, idx) => (
            <div
              key={rec.movie.id || idx}
              onClick={() => onSelectMovie && onSelectMovie(rec.movie)}
              className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden p-2.5 flex flex-col cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                <img
                  src={rec.movie.poster_path ? (rec.movie.poster_path.startsWith('http') ? rec.movie.poster_path : `https://image.tmdb.org/t/p/w500${rec.movie.poster_path}`) : '/placeholder-poster.jpg'}
                  alt={rec.movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                  {rec.confidence_score}%
                </div>
              </div>

              <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                {rec.movie.title}
              </p>

              <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                <span>{rec.movie.release_date?.substring(0, 4)}</span>
                <span className="text-amber-400 font-semibold">★ {rec.movie.vote_average?.toFixed(1)}</span>
              </div>

              {rec.explanation_breakdown && (
                <div className="mt-2 pt-2 border-t border-zinc-900 grid grid-cols-2 gap-1 text-[9px] text-zinc-400 font-mono">
                  <span>Genre: {(rec.explanation_breakdown.genre_match * 100).toFixed(0)}%</span>
                  <span>Story: {(rec.explanation_breakdown.content_match * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
