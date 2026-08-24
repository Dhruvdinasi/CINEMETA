import mongoose from 'mongoose';

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not set. Running with high-performance memory store.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️ Could not connect to MongoDB, falling back to local database store:', (error as Error).message);
    return false;
  }
}

// User Mongoose Schema with cybersecurity-hardened schema definitions and indexes
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  interactionCount: { type: Number, default: 0, index: true },
  favoriteGenres: [{ type: String, trim: true }],
  preferredLanguages: [{ type: String, trim: true }],
  favoriteActors: [{ type: String, trim: true }],
  favoriteDirectors: [{ type: String, trim: true }],
  likedMovieIds: [{ type: Number }],
  dislikedMovieIds: [{ type: Number }],
  watchlistMovieIds: [{ type: Number }],
  watchedMovieIds: [{ type: Number }],
  ratings: { type: Map, of: Number },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Movie Cache Schema
const MovieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  overview: String,
  poster_path: String,
  backdrop_path: String,
  vote_average: Number,
  vote_count: Number,
  release_date: String,
  popularity: Number,
  director: String,
  actors: [String],
  keywords: [String],
  genres: [mongoose.Schema.Types.Mixed]
});

export const MovieModel = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
