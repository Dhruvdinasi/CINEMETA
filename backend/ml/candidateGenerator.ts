import { Movie, UserProfile } from '../../src/types';
import { UserTasteRepresentation, FeatureExtractor, cosineSimilarity, normalizeLanguage } from './featureExtractor';
import { computeBayesianScore } from './normalizer';

export interface RetrievedCandidate {
  movie: Movie;
  retrievalChannels: string[];
  initialScore: number;
}

export class CandidateGenerator {
  /**
   * Stage 1: Multi-Channel Candidate Retrieval Pipeline
   * Generates a high-recall candidate pool of 100-200 items from the entire catalog
   */
  public generateCandidatePool(
    allMovies: Movie[],
    taste: UserTasteRepresentation,
    excludedSet: Set<number>,
    featureExtractor: FeatureExtractor,
    user?: UserProfile,
    poolSize: number = 150
  ): RetrievedCandidate[] {
    const candidateMap = new Map<number, { movie: Movie; channels: Set<string>; initialScore: number }>();

    const validCatalog = allMovies.filter(m => !excludedSet.has(m.id));
    if (validCatalog.length === 0) return [];

    const userPreferredLangs = new Set(
      (user?.preferredLanguages || []).map(l => normalizeLanguage(l))
    );
    const hasExplicitLangs = userPreferredLangs.size > 0;

    // --- Channel 1: Thematic & Semantic Content Matcher ---
    const scoredContent = validCatalog.map(movie => {
      const mVec = featureExtractor.buildMovieFeatureVector(movie);
      const sim = cosineSimilarity(mVec, taste.positive.denseVector);
      return { movie, sim };
    });
    scoredContent.sort((a, b) => b.sim - a.sim);
    scoredContent.slice(0, 80).forEach(({ movie, sim }) => {
      if (!candidateMap.has(movie.id)) {
        candidateMap.set(movie.id, { movie, channels: new Set(['thematic_content']), initialScore: sim });
      } else {
        const item = candidateMap.get(movie.id)!;
        item.channels.add('thematic_content');
        item.initialScore = Math.max(item.initialScore, sim);
      }
    });

    // --- Channel 2: Explicit Attribute & Preference Matcher ---
    const userGenres = new Set(user?.favoriteGenres || []);
    const userMoods = new Set(user?.onboardingPreferences?.moods || []);

    const scoredAttributes = validCatalog.map(movie => {
      let score = 0;
      const mGenres = Array.isArray(movie.genres)
        ? movie.genres.map(g => (typeof g === 'string' ? g : g.name))
        : [];
      const lang = normalizeLanguage(movie.language);

      // Genre overlap
      mGenres.forEach(g => {
        if (userGenres.has(g) || taste.positive.genreWeights[g]) {
          score += 1.5;
        }
        if (taste.negative.dislikedGenres.has(g)) {
          score -= 3.0;
        }
      });

      // Language alignment
      if (hasExplicitLangs && userPreferredLangs.has(lang)) {
        score += 2.0;
      }
      if (taste.negative.dislikedLanguages.has(lang)) {
        score -= 4.0;
      }

      // Mood match
      if (movie.moods && Array.isArray(movie.moods)) {
        movie.moods.forEach(m => {
          if (userMoods.has(m) || taste.positive.moodWeights[m]) {
            score += 1.0;
          }
        });
      }

      // Runtime preference constraint check
      if (user?.onboardingPreferences?.maxRuntime && movie.runtime) {
        if (movie.runtime <= user.onboardingPreferences.maxRuntime) {
          score += 0.5;
        } else {
          score -= 1.0;
        }
      }

      return { movie, score };
    });

    scoredAttributes.sort((a, b) => b.score - a.score);
    scoredAttributes.slice(0, 60).forEach(({ movie, score }) => {
      if (score > 0) {
        if (!candidateMap.has(movie.id)) {
          candidateMap.set(movie.id, { movie, channels: new Set(['explicit_preference']), initialScore: Math.min(1.0, score / 5.0) });
        } else {
          candidateMap.get(movie.id)!.channels.add('explicit_preference');
        }
      }
    });

    // --- Channel 3: Meta-Learning Seed Prototype Matcher ---
    // Extract top praised seeds
    if (taste.totalHistoryCount > 0) {
      const scoredMeta = validCatalog.map(movie => {
        const mVec = featureExtractor.buildMovieFeatureVector(movie);
        const sim = cosineSimilarity(mVec, taste.positive.denseVector);
        // Penalize if close to negative vector
        const negSim = cosineSimilarity(mVec, taste.negative.negativeDenseVector);
        const netSim = sim - 0.7 * negSim;
        return { movie, netSim };
      });

      scoredMeta.sort((a, b) => b.netSim - a.netSim);
      scoredMeta.slice(0, 50).forEach(({ movie, netSim }) => {
        if (netSim > 0.1) {
          if (!candidateMap.has(movie.id)) {
            candidateMap.set(movie.id, { movie, channels: new Set(['meta_learning_prototype']), initialScore: Math.max(0, netSim) });
          } else {
            candidateMap.get(movie.id)!.channels.add('meta_learning_prototype');
          }
        }
      });
    }

    // --- Channel 4: Bayesian Quality & Catalog Prior Matcher ---
    const scoredBayesian = validCatalog.map(movie => {
      const bayes = computeBayesianScore(movie.vote_average, movie.vote_count);
      return { movie, bayes };
    });
    scoredBayesian.sort((a, b) => b.bayes - a.bayes);
    scoredBayesian.slice(0, 40).forEach(({ movie, bayes }) => {
      if (!candidateMap.has(movie.id)) {
        candidateMap.set(movie.id, { movie, channels: new Set(['bayesian_quality']), initialScore: bayes });
      } else {
        candidateMap.get(movie.id)!.channels.add('bayesian_quality');
      }
    });

    // Convert map to array and return top `poolSize` candidates
    const candidates: RetrievedCandidate[] = Array.from(candidateMap.values()).map(item => ({
      movie: item.movie,
      retrievalChannels: Array.from(item.channels),
      initialScore: item.initialScore
    }));

    candidates.sort((a, b) => b.initialScore - a.initialScore);
    return candidates.slice(0, poolSize);
  }
}
