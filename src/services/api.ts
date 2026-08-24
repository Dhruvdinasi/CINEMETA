import {
  Movie,
  UserProfile,
  RecommendationResult,
  UserReview,
  RecommendationHistoryEntry,
  SystemAnalytics,
  WatchProvidersResponse,
  MovieTrailerResult,
  OnboardingPreferences,
  NlpSearchFilter
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('cinemeta_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string, avatar?: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) {
      localStorage.setItem('cinemeta_token', data.token);
    }
    return data;
  },

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) {
      localStorage.setItem('cinemeta_token', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeaders() }
      });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('cinemeta_token');
    }
  },

  async getMe(): Promise<{ user: UserProfile; isGuest: boolean }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data.user;
  },

  async getUserProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data.profile;
  },

  // Onboarding
  async submitOnboarding(payload: {
    favoriteMovieIds: number[];
    favoriteGenres: string[];
    preferredLanguages: string[];
    preferences: OnboardingPreferences;
    favoriteMovies?: Movie[];
  }): Promise<{ user: UserProfile; message: string }> {
    const res = await fetch(`${API_BASE}/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit onboarding');
    return data;
  },

  // User Actions
  async updatePreferences(preferences: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(preferences)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update preferences');
    return data.user;
  },

  async rateMovie(movieId: number, rating: number): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId, rating })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to rate movie');
    return data.user;
  },

  async toggleWatchlist(movieId: number): Promise<{ inWatchlist: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/watchlist/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update watchlist');
    return data;
  },

  async toggleLike(movieId: number): Promise<{ isLiked: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/like/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle like');
    return data;
  },

  async toggleDislike(movieId: number): Promise<{ isDisliked: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/dislike/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle dislike');
    return data;
  },

  async toggleWatched(movieId: number): Promise<{ isWatched: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/watched/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle watched status');
    return data;
  },

  // Movies
  async getPopularMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/popular`);
    const data = await res.json();
    return data.movies || [];
  },

  async getTopRatedMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/top-rated`);
    const data = await res.json();
    return data.movies || [];
  },

  async getTrendingMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/trending`);
    const data = await res.json();
    return data.movies || [];
  },

  async searchMovies(query: string): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.movies || [];
  },

  async getMovieDetails(id: number): Promise<Movie> {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Movie not found');
    return data.movie;
  },

  async getSimilarMovies(id: number, limit: number = 6): Promise<RecommendationResult[]> {
    const res = await fetch(`${API_BASE}/movies/${id}/similar?limit=${limit}`);
    const data = await res.json();
    return data.similar || [];
  },

  async getMovieTrailer(id: number): Promise<MovieTrailerResult> {
    const res = await fetch(`${API_BASE}/movies/${id}/trailer`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Trailer not found');
    return data;
  },

  async getWatchProviders(id: number, region: string = 'IN'): Promise<WatchProvidersResponse> {
    const res = await fetch(`${API_BASE}/movies/${id}/providers?region=${encodeURIComponent(region)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Watch providers not found');
    return data;
  },

  // Natural Language Search
  async nlpSearch(query: string, diversityLambda?: number): Promise<{
    extractedFilters: NlpSearchFilter;
    recommendations: RecommendationResult[];
  }> {
    const res = await fetch(`${API_BASE}/movies/nlp-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ query, diversityLambda })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'NLP search failed');
    return {
      extractedFilters: data.extractedFilters,
      recommendations: data.results || []
    };
  },

  async searchByNaturalLanguage(query: string): Promise<{
    extractedFilters: NlpSearchFilter;
    results: RecommendationResult[];
  }> {
    const res = await fetch(`${API_BASE}/movies/nlp-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'NLP search failed');
    return data;
  },

  // AI Movie Assistant
  async sendAssistantMessage(message: string): Promise<{
    reply: string;
    recommendedMovies?: Movie[];
    extractedFilters?: any;
  }> {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Assistant failed to respond');
    return data;
  },

  // Recommendation Engine
  async generateRecommendations(options?: {
    selectedMovieIds?: number[];
    selectedMovies?: Movie[];
    diversityLambda?: number;
  }): Promise<{
    recommendations: RecommendationResult[];
    algorithmUsed: string;
    interactionCount: number;
    metaDecisionReason: string;
    metrics: any;
  }> {
    const res = await fetch(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(options || {})
    });
    return res.json();
  },

  // Reviews & History
  async getMovieReviews(movieId: number): Promise<UserReview[]> {
    const res = await fetch(`${API_BASE}/reviews/${movieId}`);
    const data = await res.json();
    return data.reviews || [];
  },

  async addReview(movieId: number, rating: number, comment: string): Promise<UserReview> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ movieId, rating, comment })
    });
    const data = await res.json();
    return data.review;
  },

  async getHistory(): Promise<RecommendationHistoryEntry[]> {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    return data.history || [];
  },

  async getAdminAnalytics(): Promise<SystemAnalytics> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    return data.analytics;
  },

  async runSecurityTests(): Promise<{
    summary: string;
    totalTests: number;
    passedCount: number;
    tests: Array<{
      threat: string;
      attackScenario: string;
      mitigation: string;
      status: 'PASSED' | 'FAILED';
      details: string;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/admin/security-test`, {
      headers: { ...getAuthHeaders() }
    });
    const data = await res.json();
    return data;
  }
};
