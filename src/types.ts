export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime?: number;
  genres: Array<{ id: number; name: string }> | string[];
  cast?: CastMember[];
  crew?: CrewMember[];
  director?: string;
  actors?: string[];
  language?: string;
  country?: string;
  budget?: number;
  revenue?: number;
  trailer_key?: string;
  keywords?: string[];
  tagline?: string;
  moods?: string[];
}

export interface RecommendationExplanation {
  content_match: number;
  genre_match: number;
  collaborative_score: number;
  user_preference_score: number;
  embedding_similarity: number;
  diversity_penalty?: number;
  reason: string;
  breakdown: string[];
}

export interface RecommendationResult {
  movie: Movie;
  similarity_score: number; // 0 to 1
  confidence_score: number; // 0 to 100%
  algorithm_used: 'unified_hybrid' | 'content_based' | 'collaborative_filtering' | 'meta_learning_hybrid';
  explanation: string;
  matched_reasons: string[];
  explanation_details?: RecommendationExplanation;
  explanation_breakdown?: {
    genre_match: number;
    content_match: number;
    collaborative_score: number;
    embedding_similarity: number;
    diversity_penalty?: number;
    penalty_reasons?: string[];
  };
  diversity_penalty?: number;
}

export interface UserRating {
  movieId: number;
  rating: number; // 1 to 5
  updatedAt: string;
}

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  movieId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OTTProvider {
  name: string;
  logo: string;
  type: 'subscription' | 'free' | 'rent' | 'buy';
  url: string;
  isDeepLink: boolean;
}

export interface WatchProvidersResponse {
  movieId: number;
  movieTitle: string;
  region: string;
  providers: OTTProvider[];
  tmdbWatchLink?: string;
  hasDirectDeepLinks: boolean;
}

export interface MovieTrailerResult {
  movieId: number;
  trailerKey: string | null;
  videoUrl: string | null;
  source: 'tmdb' | 'search_fallback' | 'cached';
}

export interface OnboardingPreferences {
  preferredDecade?: string;
  minRating?: number;
  maxRuntime?: number;
  movieType?: string;
  moods?: string[];
}

export interface UserStructuredVector {
  genres: Record<string, number>;
  languages: Record<string, number>;
  moods: Record<string, number>;
  rating_preference: number;
  runtime_preference: number;
  decade_preference?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string;
  interactionCount: number;
  onboardingCompleted?: boolean;
  onboardingPreferences?: OnboardingPreferences;
  structuredPreferenceVector?: UserStructuredVector;
  preferenceVector?: {
    genreWeights?: Record<string, number>;
    languageWeights?: Record<string, number>;
  };
  favoriteGenres: string[];
  preferredLanguages: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  likedMovieIds: number[];
  dislikedMovieIds: number[];
  watchlistMovieIds: number[];
  watchedMovieIds: number[];
  ratings: Record<number, number>; // movieId -> rating 1-5
  createdAt: string;
}

export interface EvaluationMetrics {
  precisionAt5: number;
  precisionAt10: number;
  recallAt10: number;
  f1At10: number;
  mapScore: number;
  ndcgScore: number;
  hitRateAt10: number;
  diversityScore: number;
  coverageScore: number;
  totalRecommendationsEvaluated: number;
}

export interface ModelBenchmarkComparison {
  modelName: string;
  algorithmType: string;
  precisionAt10: number;
  recallAt10: number;
  f1At10: number;
  ndcgAt10: number;
  hitRateAt10: number;
  diversityScore: number;
  coverageScore: number;
  avgLatencyMs: number;
  description: string;
}

export interface ColdStartStageBenchmark {
  stage: 'New User (0 Interactions)' | 'Few-Shot User (1-3 Interactions)' | 'Warm User (10+ Interactions)';
  interactionsCount: number;
  precisionAt10: number;
  recallAt10: number;
  f1At10: number;
  ndcgAt10: number;
  hitRateAt10: number;
  diversityScore: number;
  dominantAlgorithm: string;
}

export interface SystemAnalytics {
  totalUsers: number;
  totalInteractions: number;
  totalMoviesCached: number;
  avgLatencyMs: number;
  topGenres: Array<{ name: string; count: number }>;
  mostLikedMovies: Array<{ title: string; count: number; vote_average: number }>;
  mostDislikedMovies: Array<{ title: string; count: number }>;
  evaluationMetrics: EvaluationMetrics;
  modelBenchmarks: ModelBenchmarkComparison[];
  coldStartBenchmarks: ColdStartStageBenchmark[];
  recommendationDiversityScore: number;
}

export interface RecommendationHistoryEntry {
  id: string;
  timestamp: string;
  selectedMovieIds: number[];
  algorithmUsed: string;
  interactionCountAtTime: number;
  recommendationsCount: number;
  topRecommendedMovieTitles: string[];
  diversityScore?: number;
}

export interface NlpSearchFilter {
  query: string;
  extractedGenres: string[];
  extractedMoods: string[];
  maxRuntime?: number;
  minRating?: number;
  decade?: string;
  keywords: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedMovies?: Movie[];
  timestamp: string;
}
