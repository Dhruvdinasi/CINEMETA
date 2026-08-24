import { Movie, UserProfile } from '../../src/types';

/**
 * Language normalization helper
 */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'en';
  const l = lang.toLowerCase().trim();
  if (l === 'kannada' || l === 'kn') return 'kn';
  if (l === 'telugu' || l === 'te') return 'te';
  if (l === 'tamil' || l === 'ta') return 'ta';
  if (l === 'malayalam' || l === 'ml') return 'ml';
  if (l === 'hindi' || l === 'hi') return 'hi';
  if (l === 'english' || l === 'en') return 'en';
  if (l === 'korean' || l === 'ko') return 'ko';
  if (l === 'japanese' || l === 'ja') return 'ja';
  if (l === 'french' || l === 'fr') return 'fr';
  if (l === 'spanish' || l === 'es') return 'es';
  if (l === 'german' || l === 'de') return 'de';
  return l;
}

export function getLanguageDisplayName(code: string): string {
  const norm = normalizeLanguage(code);
  switch (norm) {
    case 'kn': return 'Kannada';
    case 'te': return 'Telugu';
    case 'ta': return 'Tamil';
    case 'ml': return 'Malayalam';
    case 'hi': return 'Hindi';
    case 'en': return 'English';
    case 'ko': return 'Korean';
    case 'ja': return 'Japanese';
    case 'fr': return 'French';
    case 'es': return 'Spanish';
    case 'de': return 'German';
    default: return code.toUpperCase();
  }
}

/**
 * Tokenize text into feature words, removing common stopwords
 */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'been',
  'which', 'their', 'about', 'after', 'into', 'they', 'when', 'what', 'where',
  'who', 'will', 'more', 'some', 'than', 'them', 'then', 'thence', 'there',
  'each', 'over', 'such', 'also', 'film', 'movie', 'story'
]);

export function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Compute Cosine Similarity between two sparse vectors
 */
export function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [k, vA] of Object.entries(vecA)) {
    normA += vA * vA;
    if (vecB[k] !== undefined) {
      dotProduct += vA * vecB[k];
    }
  }

  for (const vB of Object.values(vecB)) {
    normB += vB * vB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface PositiveTasteProfile {
  langWeights: Record<string, number>;
  totalLangWeight: number;
  dominantLanguage: string;
  genreWeights: Record<string, number>;
  totalGenreWeight: number;
  directorWeights: Record<string, number>;
  actorWeights: Record<string, number>;
  keywordWeights: Record<string, number>;
  overviewWordWeights: Record<string, number>;
  moodWeights: Record<string, number>;
  meanYear: number;
  denseVector: Record<string, number>;
}

export interface NegativeTasteProfile {
  dislikedGenres: Set<string>;
  dislikedLanguages: Set<string>;
  dislikedDirectors: Set<string>;
  dislikedKeywords: Set<string>;
  negativeDenseVector: Record<string, number>;
}

export interface UserTasteRepresentation {
  positive: PositiveTasteProfile;
  negative: NegativeTasteProfile;
  userStage: 'cold_start' | 'few_shot' | 'warm';
  totalHistoryCount: number;
}

export class FeatureExtractor {
  private tfidfIDF: Map<string, number> = new Map();
  private movieVectorCache: Map<number, Record<string, number>> = new Map();

  public initialize(movies: Movie[]): void {
    if (movies.length === 0) return;

    const docFreq: Map<string, number> = new Map();
    movies.forEach(m => {
      const words = new Set<string>([
        ...tokenize(m.overview || ''),
        ...(m.keywords || []).map(k => k.toLowerCase().trim())
      ]);
      words.forEach(w => {
        if (w) docFreq.set(w, (docFreq.get(w) || 0) + 1);
      });
    });

    const N = movies.length;
    this.tfidfIDF.clear();
    docFreq.forEach((count, word) => {
      // Smooth IDF
      this.tfidfIDF.set(word, Math.log((N + 1) / (count + 1)) + 1);
    });

    this.movieVectorCache.clear();
    movies.forEach(m => {
      this.movieVectorCache.set(m.id, this.buildMovieFeatureVector(m));
    });
  }

  /**
   * Represent a Movie as a high-dimensional feature vector
   */
  public buildMovieFeatureVector(movie: Movie): Record<string, number> {
    const cached = this.movieVectorCache.get(movie.id);
    if (cached) return cached;

    const vector: Record<string, number> = {};

    // 1. Genres (weight 2.8)
    const genres = Array.isArray(movie.genres)
      ? movie.genres.map(g => (typeof g === 'string' ? g : g.name).toLowerCase())
      : [];
    genres.forEach(g => {
      vector[`genre_${g}`] = 2.8;
    });

    // 2. Language (weight 2.2)
    const lang = normalizeLanguage(movie.language);
    vector[`lang_${lang}`] = 2.2;

    // 3. Director (weight 2.0)
    if (movie.director && movie.director !== 'Renowned Director') {
      vector[`dir_${movie.director.toLowerCase()}`] = 2.0;
    }

    // 4. Key Actors (weight 1.4)
    if (movie.actors && Array.isArray(movie.actors)) {
      movie.actors.forEach(a => {
        if (a !== 'Featured Cast') {
          vector[`act_${a.toLowerCase()}`] = 1.4;
        }
      });
    }

    // 5. Moods / Tones (weight 1.6)
    if (movie.moods && Array.isArray(movie.moods)) {
      movie.moods.forEach(m => {
        vector[`mood_${m.toLowerCase()}`] = 1.6;
      });
    }

    // 6. Keywords & Thematic Tokens (TF-IDF weighted)
    if (movie.keywords && Array.isArray(movie.keywords)) {
      movie.keywords.forEach(k => {
        const normK = k.toLowerCase().trim();
        const idf = this.tfidfIDF.get(normK) || 1.8;
        vector[`kw_${normK}`] = 1.5 * idf;
      });
    }

    const words = tokenize(movie.overview || '');
    const wordCounts: Record<string, number> = {};
    words.forEach(w => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    Object.entries(wordCounts).forEach(([w, count]) => {
      const idf = this.tfidfIDF.get(w) || 1.0;
      vector[`tf_${w}`] = count * idf * 0.4;
    });

    this.movieVectorCache.set(movie.id, vector);
    return vector;
  }

  /**
   * Build Rich Dual-Profile User Taste Representation
   * Integrates Explicit Onboarding + Rating Strength + Likes/Dislikes + Recency Decay
   */
  public extractUserTaste(
    sourceMovies: Movie[],
    user?: UserProfile
  ): UserTasteRepresentation {
    const langWeights: Record<string, number> = {};
    const genreWeights: Record<string, number> = {};
    const directorWeights: Record<string, number> = {};
    const actorWeights: Record<string, number> = {};
    const keywordWeights: Record<string, number> = {};
    const overviewWordWeights: Record<string, number> = {};
    const moodWeights: Record<string, number> = {};
    const denseVector: Record<string, number> = {};
    const negativeDenseVector: Record<string, number> = {};
    const years: number[] = [];

    const dislikedGenres = new Set<string>();
    const dislikedLanguages = new Set<string>();
    const dislikedDirectors = new Set<string>();
    const dislikedKeywords = new Set<string>();

    const userRatings = user?.ratings || {};
    const likedSet = new Set(user?.likedMovieIds || []);
    const watchlistSet = new Set(user?.watchlistMovieIds || []);
    const dislikedSet = new Set(user?.dislikedMovieIds || []);

    const totalInteractions = sourceMovies.length + (user?.favoriteGenres?.length || 0);

    // Determine user stage
    let userStage: 'cold_start' | 'few_shot' | 'warm' = 'cold_start';
    if (totalInteractions >= 8) {
      userStage = 'warm';
    } else if (totalInteractions >= 2) {
      userStage = 'few_shot';
    }

    // Process movie interaction signals with calibrated asymmetric weights
    sourceMovies.forEach((m, idx) => {
      // Recency decay factor (later items in list are more recent)
      const recencyBoost = 1.0 + (idx / Math.max(1, sourceMovies.length)) * 0.3;

      let interactionWeight = 1.0;
      let isNegative = false;

      if (userRatings[m.id] !== undefined) {
        const rating = userRatings[m.id];
        // 5 stars -> +2.6, 4 stars -> +1.5, 3 stars -> +0.3, 2 stars -> -1.4, 1 star -> -2.4
        if (rating >= 4.5) {
          interactionWeight = 2.6 * recencyBoost;
        } else if (rating >= 3.5) {
          interactionWeight = 1.5 * recencyBoost;
        } else if (rating >= 2.5) {
          interactionWeight = 0.3;
        } else if (rating >= 1.5) {
          interactionWeight = -1.4;
          isNegative = true;
        } else {
          interactionWeight = -2.4;
          isNegative = true;
        }
      } else if (likedSet.has(m.id)) {
        interactionWeight = 2.0 * recencyBoost;
      } else if (dislikedSet.has(m.id)) {
        interactionWeight = -2.2;
        isNegative = true;
      } else if (watchlistSet.has(m.id)) {
        interactionWeight = 1.2;
      } else {
        // Watched or selected seed
        interactionWeight = 1.4;
      }

      const mGenres = Array.isArray(m.genres)
        ? m.genres.map(g => (typeof g === 'string' ? g : g.name))
        : [];
      const lang = normalizeLanguage(m.language);

      if (isNegative || interactionWeight < 0) {
        // Build negative taste profile to actively repel similar unwanted content
        mGenres.forEach(g => dislikedGenres.add(g));
        dislikedLanguages.add(lang);
        if (m.director && m.director !== 'Renowned Director') dislikedDirectors.add(m.director);
        (m.keywords || []).forEach(k => dislikedKeywords.add(k.toLowerCase().trim()));

        const mVec = this.buildMovieFeatureVector(m);
        const absW = Math.abs(interactionWeight);
        for (const [k, v] of Object.entries(mVec)) {
          negativeDenseVector[k] = (negativeDenseVector[k] || 0) + v * absW;
        }
        return;
      }

      // Positive Taste Profile Accumulation
      langWeights[lang] = (langWeights[lang] || 0) + interactionWeight;

      mGenres.forEach(g => {
        genreWeights[g] = (genreWeights[g] || 0) + interactionWeight;
      });

      if (m.director && m.director !== 'Renowned Director') {
        directorWeights[m.director] = (directorWeights[m.director] || 0) + interactionWeight * 1.5;
      }

      if (m.actors && Array.isArray(m.actors)) {
        m.actors.forEach(a => {
          if (a !== 'Featured Cast') {
            actorWeights[a] = (actorWeights[a] || 0) + interactionWeight;
          }
        });
      }

      if (m.moods && Array.isArray(m.moods)) {
        m.moods.forEach(mood => {
          moodWeights[mood] = (moodWeights[mood] || 0) + interactionWeight;
        });
      }

      if (m.keywords && Array.isArray(m.keywords)) {
        m.keywords.forEach(k => {
          const normK = k.toLowerCase().trim();
          if (normK) {
            keywordWeights[normK] = (keywordWeights[normK] || 0) + interactionWeight * 1.2;
          }
        });
      }

      const words = tokenize(m.overview || '');
      words.forEach(w => {
        overviewWordWeights[w] = (overviewWordWeights[w] || 0) + 0.4 * interactionWeight;
      });

      if (m.release_date) {
        const yr = parseInt(m.release_date.substring(0, 4), 10);
        if (!isNaN(yr)) years.push(yr);
      }

      const mVec = this.buildMovieFeatureVector(m);
      for (const [k, v] of Object.entries(mVec)) {
        denseVector[k] = (denseVector[k] || 0) + v * interactionWeight;
      }
    });

    // Explicit Profile / Onboarding Preferences
    if (user?.favoriteGenres && user.favoriteGenres.length > 0) {
      user.favoriteGenres.forEach(g => {
        genreWeights[g] = (genreWeights[g] || 0) + 2.5;
        denseVector[`genre_${g.toLowerCase()}`] = (denseVector[`genre_${g.toLowerCase()}`] || 0) + 3.0;
      });
    }

    if (user?.preferredLanguages && user.preferredLanguages.length > 0) {
      user.preferredLanguages.forEach(l => {
        const normL = normalizeLanguage(l);
        langWeights[normL] = (langWeights[normL] || 0) + 2.8;
        denseVector[`lang_${normL}`] = (denseVector[`lang_${normL}`] || 0) + 3.0;
      });
    }

    if (user?.onboardingPreferences?.moods && user.onboardingPreferences.moods.length > 0) {
      user.onboardingPreferences.moods.forEach(m => {
        moodWeights[m] = (moodWeights[m] || 0) + 2.0;
        denseVector[`mood_${m.toLowerCase()}`] = (denseVector[`mood_${m.toLowerCase()}`] || 0) + 2.4;
      });
    }

    if (user?.favoriteActors && user.favoriteActors.length > 0) {
      user.favoriteActors.forEach(a => {
        actorWeights[a] = (actorWeights[a] || 0) + 1.8;
        denseVector[`act_${a.toLowerCase()}`] = (denseVector[`act_${a.toLowerCase()}`] || 0) + 2.0;
      });
    }

    if (user?.favoriteDirectors && user.favoriteDirectors.length > 0) {
      user.favoriteDirectors.forEach(d => {
        directorWeights[d] = (directorWeights[d] || 0) + 2.2;
        denseVector[`dir_${d.toLowerCase()}`] = (denseVector[`dir_${d.toLowerCase()}`] || 0) + 2.5;
      });
    }

    // Determine dominant language
    let totalLangWeight = 0;
    let dominantLanguage = 'en';
    let maxLangWeight = 0;

    for (const [lang, weight] of Object.entries(langWeights)) {
      totalLangWeight += weight;
      if (weight > maxLangWeight) {
        maxLangWeight = weight;
        dominantLanguage = lang;
      }
    }

    const totalGenreWeight = Object.values(genreWeights).reduce((a, b) => a + b, 0);
    const meanYear = years.length > 0
      ? years.reduce((a, b) => a + b, 0) / years.length
      : 2020;

    return {
      positive: {
        langWeights,
        totalLangWeight,
        dominantLanguage,
        genreWeights,
        totalGenreWeight,
        directorWeights,
        actorWeights,
        keywordWeights,
        overviewWordWeights,
        moodWeights,
        meanYear,
        denseVector
      },
      negative: {
        dislikedGenres,
        dislikedLanguages,
        dislikedDirectors,
        dislikedKeywords,
        negativeDenseVector
      },
      userStage,
      totalHistoryCount: sourceMovies.length
    };
  }
}
