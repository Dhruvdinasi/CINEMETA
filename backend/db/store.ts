import { Movie, UserProfile, UserReview, RecommendationHistoryEntry, UserStructuredVector, OnboardingPreferences } from '../../src/types';
import { INITIAL_MOVIES } from '../../src/data/mockMovies';

/**
 * Normalization helper for genres & languages
 */
function normalizeString(s?: string): string {
  return (s || '').trim();
}

class DatabaseStore {
  private movies: Map<number, Movie> = new Map();
  private users: Map<string, UserProfile & { passwordHash: string }> = new Map();
  private reviews: UserReview[] = [];
  private history: RecommendationHistoryEntry[] = [];

  constructor() {
    // Populate default movie dataset
    INITIAL_MOVIES.forEach(m => {
      // Enrich with sample moods for NLP & mood-based discovery if not present
      const genresList = Array.isArray(m.genres)
        ? m.genres.map(g => (typeof g === 'string' ? g : g.name).toLowerCase())
        : [];
      
      const moods: string[] = [];
      if (genresList.includes('sci-fi') || genresList.includes('mystery')) moods.push('Thought-provoking', 'Suspenseful');
      if (genresList.includes('thriller') || genresList.includes('horror') || genresList.includes('crime')) moods.push('Suspenseful', 'Dark');
      if (genresList.includes('comedy') || genresList.includes('animation') || genresList.includes('family')) moods.push('Fun', 'Relaxing');
      if (genresList.includes('drama') || genresList.includes('romance')) moods.push('Emotional', 'Inspirational');
      if (genresList.includes('action') || genresList.includes('adventure')) moods.push('Inspirational', 'Fun');
      
      this.movies.set(m.id, {
        ...m,
        moods: Array.from(new Set(moods))
      });
    });

    // Create a demo user for testing cold-start & warm-start modes
    const demoId = "demo-user-123";
    const demoVector: UserStructuredVector = {
      genres: { "Sci-Fi": 0.92, "Thriller": 0.81, "Action": 0.70, "Drama": 0.51, "Comedy": 0.32 },
      languages: { "en": 0.90, "kn": 0.75, "hi": 0.60 },
      moods: { "Thought-provoking": 0.88, "Suspenseful": 0.80, "Inspirational": 0.65 },
      rating_preference: 4.3,
      runtime_preference: 125,
      decade_preference: "2010s"
    };

    this.users.set("demo@cinemeta.ai", {
      id: demoId,
      name: "Demo User",
      email: "demo@cinemeta.ai",
      passwordHash: "$2a$10$7EqJtq98hPqEX7fNZaFWoOZhB7m9uKq9hK/Jm1B3C/6O6u4x4j4yq", // Valid sample bcrypt hash
      interactionCount: 4,
      onboardingCompleted: true,
      onboardingPreferences: {
        preferredDecade: "2010s",
        minRating: 7.0,
        maxRuntime: 150,
        movieType: "feature",
        moods: ["Thought-provoking", "Suspenseful"]
      },
      structuredPreferenceVector: demoVector,
      favoriteGenres: ["Sci-Fi", "Action", "Thriller"],
      preferredLanguages: ["en", "kn"],
      favoriteActors: ["Leonardo DiCaprio", "Matthew McConaughey"],
      favoriteDirectors: ["Christopher Nolan", "Denis Villeneuve"],
      likedMovieIds: [157336, 27205], // Interstellar, Inception
      dislikedMovieIds: [],
      watchlistMovieIds: [693134], // Dune 2
      watchedMovieIds: [157336, 27205, 118340],
      ratings: { 157336: 5, 27205: 5, 118340: 4 },
      createdAt: new Date().toISOString()
    });
  }

  // --- Movie Operations ---
  public getAllMovies(): Movie[] {
    return Array.from(this.movies.values());
  }

  public getMovieById(id: number): Movie | undefined {
    return this.movies.get(id);
  }

  public addOrUpdateMovie(movie: Movie): void {
    const existing = this.movies.get(movie.id);
    if (existing) {
      const existingKeyIsPlaceholder = existing.id !== 27205 && existing.trailer_key === 'YoHD9XEInc0';
      const newKeyIsPlaceholder = movie.id !== 27205 && movie.trailer_key === 'YoHD9XEInc0';

      let resolvedTrailerKey = movie.trailer_key;
      if (newKeyIsPlaceholder || !resolvedTrailerKey) {
        resolvedTrailerKey = (!existingKeyIsPlaceholder && existing.trailer_key) ? existing.trailer_key : (movie.id === 27205 ? 'YoHD9XEInc0' : undefined);
      }

      const merged: Movie = {
        ...existing,
        ...movie,
        trailer_key: resolvedTrailerKey,
        director: (movie.director && movie.director !== "Renowned Director") ? movie.director : existing.director,
        actors: (movie.actors && movie.actors.length > 0 && movie.actors[0] !== "Featured Cast") ? movie.actors : existing.actors
      };
      this.movies.set(movie.id, merged);
    } else {
      if (movie.id !== 27205 && movie.trailer_key === 'YoHD9XEInc0') {
        movie.trailer_key = undefined;
      }
      this.movies.set(movie.id, movie);
    }
  }

  public addMovies(moviesList: Movie[]): void {
    moviesList.forEach(m => this.addOrUpdateMovie(m));
  }

  // --- User Operations ---
  public getUserByEmail(email: string) {
    return this.users.get(email.toLowerCase());
  }

  public getUserById(id: string) {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public createUser(userData: { id: string; name: string; email: string; passwordHash: string; avatar?: string }): UserProfile {
    const newUser: UserProfile & { passwordHash: string } = {
      ...userData,
      email: userData.email.toLowerCase(),
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
      interactionCount: 0,
      onboardingCompleted: false,
      favoriteGenres: [],
      preferredLanguages: ['en'],
      favoriteActors: [],
      favoriteDirectors: [],
      likedMovieIds: [],
      dislikedMovieIds: [],
      watchlistMovieIds: [],
      watchedMovieIds: [],
      ratings: {},
      structuredPreferenceVector: {
        genres: {},
        languages: { "en": 1.0 },
        moods: {},
        rating_preference: 4.0,
        runtime_preference: 120
      },
      createdAt: new Date().toISOString()
    };
    this.users.set(newUser.email, newUser);
    return this.sanitizeUser(newUser);
  }

  public sanitizeUser(user: UserProfile & { passwordHash?: string }): UserProfile {
    const { passwordHash, ...cleanUser } = user;
    return {
      ...cleanUser,
      avatar: cleanUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUser.name)}`,
      preferredLanguages: cleanUser.preferredLanguages || ['en'],
      watchedMovieIds: cleanUser.watchedMovieIds || [],
      dislikedMovieIds: cleanUser.dislikedMovieIds || [],
      likedMovieIds: cleanUser.likedMovieIds || [],
      watchlistMovieIds: cleanUser.watchlistMovieIds || [],
      ratings: cleanUser.ratings || {},
      onboardingCompleted: !!cleanUser.onboardingCompleted,
      structuredPreferenceVector: cleanUser.structuredPreferenceVector || this.calculateStructuredPreferenceVector(cleanUser)
    };
  }

  /**
   * Mathematically compute the User Structured Preference Vector
   * from onboarding choices, ratings, likes, dislikes, watchlist, and watched items.
   */
  public calculateStructuredPreferenceVector(user: UserProfile): UserStructuredVector {
    const genreScores: Record<string, number> = {};
    const langScores: Record<string, number> = {};
    const moodScores: Record<string, number> = {};
    const runtimes: number[] = [];
    const ratingValues: number[] = Object.values(user.ratings || {});

    // Seed with Onboarding explicit preferences
    (user.favoriteGenres || []).forEach(g => {
      genreScores[g] = (genreScores[g] || 0) + 1.5;
    });

    (user.preferredLanguages || []).forEach(l => {
      langScores[l] = (langScores[l] || 0) + 1.8;
    });

    (user.onboardingPreferences?.moods || []).forEach(m => {
      moodScores[m] = (moodScores[m] || 0) + 1.5;
    });

    // Interaction Weights:
    // 5-star: +1.8
    // 4-star: +1.2
    // 3-star: +0.3
    // 2-star: -0.8
    // 1-star: -1.5
    // Like: +1.5
    // Dislike: -1.8
    // Watchlist: +0.8
    // Watched: +0.6
    const processMovieSignal = (movieId: number, weight: number) => {
      const movie = this.getMovieById(movieId);
      if (!movie) return;

      if (movie.runtime && movie.runtime > 0) {
        runtimes.push(movie.runtime);
      }

      const genres = Array.isArray(movie.genres)
        ? movie.genres.map(g => typeof g === 'string' ? g : g.name)
        : [];

      genres.forEach(g => {
        genreScores[g] = (genreScores[g] || 0) + weight;
      });

      if (movie.language) {
        langScores[movie.language] = (langScores[movie.language] || 0) + weight * 0.8;
      }

      if (movie.moods && Array.isArray(movie.moods)) {
        movie.moods.forEach(m => {
          moodScores[m] = (moodScores[m] || 0) + weight * 0.7;
        });
      }
    };

    // Ratings
    Object.entries(user.ratings || {}).forEach(([mId, score]) => {
      let w = 0.5;
      if (score === 5) w = 2.0;
      else if (score === 4) w = 1.2;
      else if (score === 3) w = 0.3;
      else if (score === 2) w = -0.8;
      else if (score === 1) w = -1.6;
      processMovieSignal(Number(mId), w);
    });

    // Likes
    (user.likedMovieIds || []).forEach(mId => {
      processMovieSignal(mId, 1.5);
    });

    // Dislikes
    (user.dislikedMovieIds || []).forEach(mId => {
      processMovieSignal(mId, -1.8);
    });

    // Watchlist
    (user.watchlistMovieIds || []).forEach(mId => {
      processMovieSignal(mId, 0.8);
    });

    // Watched
    (user.watchedMovieIds || []).forEach(mId => {
      processMovieSignal(mId, 0.5);
    });

    // Normalize to 0.0 - 1.0 scale
    const normalizeRecord = (rec: Record<string, number>): Record<string, number> => {
      const maxVal = Math.max(1, ...Object.values(rec));
      const res: Record<string, number> = {};
      for (const [k, v] of Object.entries(rec)) {
        if (v > 0) {
          res[k] = Math.round((v / maxVal) * 100) / 100;
        }
      }
      return res;
    };

    const avgRating = ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : 4.2;

    const avgRuntime = runtimes.length > 0
      ? Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length)
      : (user.onboardingPreferences?.maxRuntime || 120);

    return {
      genres: normalizeRecord(genreScores),
      languages: normalizeRecord(langScores),
      moods: normalizeRecord(moodScores),
      rating_preference: Math.round(avgRating * 10) / 10,
      runtime_preference: avgRuntime,
      decade_preference: user.onboardingPreferences?.preferredDecade || "2020s"
    };
  }

  public updateUserPreferences(
    userId: string,
    updates: Partial<UserProfile>
  ): UserProfile | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.onboardingCompleted !== undefined) user.onboardingCompleted = updates.onboardingCompleted;
    if (updates.onboardingPreferences !== undefined) user.onboardingPreferences = updates.onboardingPreferences;
    if (updates.favoriteGenres !== undefined) user.favoriteGenres = updates.favoriteGenres;
    if (updates.preferredLanguages !== undefined) user.preferredLanguages = updates.preferredLanguages;
    if (updates.favoriteActors !== undefined) user.favoriteActors = updates.favoriteActors;
    if (updates.favoriteDirectors !== undefined) user.favoriteDirectors = updates.favoriteDirectors;
    if (updates.likedMovieIds !== undefined) user.likedMovieIds = updates.likedMovieIds;
    if (updates.dislikedMovieIds !== undefined) user.dislikedMovieIds = updates.dislikedMovieIds;
    if (updates.watchlistMovieIds !== undefined) user.watchlistMovieIds = updates.watchlistMovieIds;
    if (updates.watchedMovieIds !== undefined) user.watchedMovieIds = updates.watchedMovieIds;
    if (updates.ratings !== undefined) user.ratings = updates.ratings;

    // Recalculate interaction count
    user.interactionCount = Object.keys(user.ratings || {}).length + 
      (user.likedMovieIds?.length || 0) + 
      (user.dislikedMovieIds?.length || 0) + 
      (user.watchedMovieIds?.length || 0);

    // Refresh structured preference vector
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);

    this.users.set(user.email, user);
    return this.sanitizeUser(user);
  }

  /**
   * Save complete Onboarding Flow payload
   */
  public saveOnboardingData(
    userId: string,
    data: {
      favoriteMovieIds: number[];
      favoriteGenres: string[];
      preferredLanguages: string[];
      preferences: OnboardingPreferences;
    }
  ): UserProfile | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    user.onboardingCompleted = true;
    user.favoriteGenres = data.favoriteGenres;
    user.preferredLanguages = data.preferredLanguages;
    user.onboardingPreferences = data.preferences;

    // Mark favorite movies as liked and watched
    if (data.favoriteMovieIds && data.favoriteMovieIds.length > 0) {
      if (!user.likedMovieIds) user.likedMovieIds = [];
      if (!user.watchedMovieIds) user.watchedMovieIds = [];
      if (!user.ratings) user.ratings = {};

      data.favoriteMovieIds.forEach(id => {
        if (!user.likedMovieIds.includes(id)) user.likedMovieIds.push(id);
        if (!user.watchedMovieIds.includes(id)) user.watchedMovieIds.push(id);
        user.ratings[id] = 5; // 5-star seed
      });
    }

    user.interactionCount = Object.keys(user.ratings).length + user.likedMovieIds.length + (user.dislikedMovieIds?.length || 0) + user.watchedMovieIds.length;
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);

    this.users.set(user.email, user);
    return this.sanitizeUser(user);
  }

  public rateMovie(userId: string, movieId: number, rating: number): UserProfile | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    user.ratings[movieId] = rating;
    if (rating >= 4 && !user.likedMovieIds.includes(movieId)) {
      user.likedMovieIds.push(movieId);
      // remove from disliked
      const disIdx = user.dislikedMovieIds.indexOf(movieId);
      if (disIdx > -1) user.dislikedMovieIds.splice(disIdx, 1);
    } else if (rating <= 2 && !user.dislikedMovieIds.includes(movieId)) {
      user.dislikedMovieIds.push(movieId);
      // remove from liked
      const lkIdx = user.likedMovieIds.indexOf(movieId);
      if (lkIdx > -1) user.likedMovieIds.splice(lkIdx, 1);
    }

    // Automatically mark as watched when rated
    if (!user.watchedMovieIds) user.watchedMovieIds = [];
    if (!user.watchedMovieIds.includes(movieId)) {
      user.watchedMovieIds.push(movieId);
    }

    user.interactionCount = Object.keys(user.ratings).length + user.likedMovieIds.length + user.dislikedMovieIds.length + user.watchedMovieIds.length;
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);

    this.users.set(user.email, user);
    return this.sanitizeUser(user);
  }

  public toggleWatchlist(userId: string, movieId: number): { inWatchlist: boolean; user: UserProfile } | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const index = user.watchlistMovieIds.indexOf(movieId);
    let inWatchlist = false;
    if (index > -1) {
      user.watchlistMovieIds.splice(index, 1);
    } else {
      user.watchlistMovieIds.push(movieId);
      inWatchlist = true;
    }

    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);
    this.users.set(user.email, user);
    return { inWatchlist, user: this.sanitizeUser(user) };
  }

  public toggleLike(userId: string, movieId: number): { isLiked: boolean; user: UserProfile } | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const idx = user.likedMovieIds.indexOf(movieId);
    let isLiked = false;
    if (idx > -1) {
      user.likedMovieIds.splice(idx, 1);
    } else {
      user.likedMovieIds.push(movieId);
      isLiked = true;
      // Remove from disliked if present
      const disIdx = user.dislikedMovieIds.indexOf(movieId);
      if (disIdx > -1) user.dislikedMovieIds.splice(disIdx, 1);
    }

    user.interactionCount = Object.keys(user.ratings).length + user.likedMovieIds.length + user.dislikedMovieIds.length + (user.watchedMovieIds?.length || 0);
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);
    this.users.set(user.email, user);
    return { isLiked, user: this.sanitizeUser(user) };
  }

  public toggleDislike(userId: string, movieId: number): { isDisliked: boolean; user: UserProfile } | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    if (!user.dislikedMovieIds) user.dislikedMovieIds = [];
    const idx = user.dislikedMovieIds.indexOf(movieId);
    let isDisliked = false;
    if (idx > -1) {
      user.dislikedMovieIds.splice(idx, 1);
    } else {
      user.dislikedMovieIds.push(movieId);
      isDisliked = true;
      // Remove from liked if present
      const lkIdx = user.likedMovieIds.indexOf(movieId);
      if (lkIdx > -1) user.likedMovieIds.splice(lkIdx, 1);
    }

    user.interactionCount = Object.keys(user.ratings).length + user.likedMovieIds.length + user.dislikedMovieIds.length + (user.watchedMovieIds?.length || 0);
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);
    this.users.set(user.email, user);
    return { isDisliked, user: this.sanitizeUser(user) };
  }

  public toggleWatched(userId: string, movieId: number): { isWatched: boolean; user: UserProfile } | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    if (!user.watchedMovieIds) user.watchedMovieIds = [];
    const idx = user.watchedMovieIds.indexOf(movieId);
    let isWatched = false;
    if (idx > -1) {
      user.watchedMovieIds.splice(idx, 1);
    } else {
      user.watchedMovieIds.push(movieId);
      isWatched = true;
    }

    user.interactionCount = Object.keys(user.ratings).length + user.likedMovieIds.length + user.dislikedMovieIds.length + user.watchedMovieIds.length;
    user.structuredPreferenceVector = this.calculateStructuredPreferenceVector(user);
    this.users.set(user.email, user);
    return { isWatched, user: this.sanitizeUser(user) };
  }

  // --- Review Operations ---
  public addReview(review: Omit<UserReview, 'id' | 'createdAt'>): UserReview {
    const newReview: UserReview = {
      ...review,
      id: "rev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);
    return newReview;
  }

  public getMovieReviews(movieId: number): UserReview[] {
    return this.reviews.filter(r => r.movieId === movieId);
  }

  // --- Recommendation History Operations ---
  public addHistoryEntry(entry: Omit<RecommendationHistoryEntry, 'id' | 'timestamp'>): RecommendationHistoryEntry {
    const newEntry: RecommendationHistoryEntry = {
      ...entry,
      id: "hist_" + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.history.unshift(newEntry);
    return newEntry;
  }

  public getUserHistory(userId: string): RecommendationHistoryEntry[] {
    return this.history;
  }

  public getHistory(): RecommendationHistoryEntry[] {
    return this.history;
  }
}

export const db = new DatabaseStore();
