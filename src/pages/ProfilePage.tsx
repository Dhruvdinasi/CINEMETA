import React, { useState, useEffect } from 'react';
import {
  User,
  Cpu,
  Sparkles,
  History,
  Download,
  LogOut,
  CheckCircle,
  ShieldCheck,
  Film,
  Heart,
  ThumbsDown,
  Eye,
  Bookmark,
  Languages,
  Tags,
  Save,
  Check,
  Sliders,
  BarChart3
} from 'lucide-react';
import { UserProfile, RecommendationHistoryEntry } from '../types';
import { api } from '../services/api';
import { TasteProfile } from '../components/TasteProfile';

interface ProfilePageProps {
  user: UserProfile | null;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenOnboarding?: () => void;
}

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western'
];

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
  onUpdateUser,
  onOpenOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'preferences' | 'history'>('analytics');
  const [history, setHistory] = useState<RecommendationHistoryEntry[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user?.favoriteGenres || []);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(user?.preferredLanguages || ['en']);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setFavoriteGenres(user.favoriteGenres || []);
      setPreferredLanguages(user.preferredLanguages || ['en']);
    }
  }, [user]);

  useEffect(() => {
    api.getHistory()
      .then(res => setHistory(res))
      .catch(err => console.error(err));
  }, []);

  if (!user) return null;

  const toggleGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const toggleLanguage = (langCode: string) => {
    if (preferredLanguages.includes(langCode)) {
      if (preferredLanguages.length > 1) {
        setPreferredLanguages(preferredLanguages.filter(l => l !== langCode));
      }
    } else {
      setPreferredLanguages([...preferredLanguages, langCode]);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const updated = await api.updatePreferences({
        favoriteGenres,
        preferredLanguages
      });
      onUpdateUser(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const exportHistoryCsv = () => {
    if (history.length === 0) return;
    const headers = "Timestamp,Algorithm,InteractionsAtTime,TopRecommendedTitles\n";
    const rows = history.map(h =>
      `"${h.timestamp}","${h.algorithmUsed}",${h.interactionCountAtTime},"${h.topRecommendedMovieTitles.join(' | ')}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinemeta_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-red-950/30 p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-900/40">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                User ID: {user.id.substring(0, 12)}...
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Authenticated Session
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all shadow"
            >
              <Sliders className="w-4 h-4 text-red-400" />
              Recalibrate Cold Start
            </button>
          )}

          <button
            onClick={onLogout}
            id="logout-btn"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-colors shadow"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'analytics'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Taste Profile & Vector Analytics
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'preferences'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Genres & Languages
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          Recommendation History ({history.length})
        </button>
      </div>

      {/* Tab 1: Detailed TasteProfile Component */}
      {activeTab === 'analytics' && (
        <TasteProfile
          user={user}
          onRecalibrate={onOpenOnboarding}
          onRefresh={async () => {
            const profile = await api.getProfile();
            onUpdateUser(profile);
          }}
        />
      )}

      {/* Tab 2: Genres & Languages Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/90 p-6 md:p-8 rounded-2xl border border-zinc-800 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Personalized Recommendation Preferences
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select your favorite genres and preferred languages to steer the recommendation engine
                </p>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/30"
              >
                {savedNotice ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                {savedNotice ? 'Preferences Saved!' : savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {/* Favorite Genres Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Tags className="w-4 h-4 text-red-400" />
                Favorite Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(genre => {
                  const isSelected = favoriteGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md shadow-red-900/40 border border-red-500 scale-105'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Languages Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Languages className="w-4 h-4 text-red-400" />
                Preferred Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map(lang => {
                  const isSelected = preferredLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 border border-rose-500 scale-105'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Recommendation History Log */}
      {activeTab === 'history' && (
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-rose-500" />
                Recommendation Execution History Log
              </h2>
              <p className="text-xs text-zinc-400">Track dynamic algorithm executions over time</p>
            </div>

            <button
              onClick={exportHistoryCsv}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No recommendation history logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="text-[11px] font-bold text-zinc-500 uppercase bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Algorithm Used</th>
                    <th className="px-4 py-3">Interactions</th>
                    <th className="px-4 py-3">Top Recommended Titles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {history.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800/40">
                          {entry.algorithmUsed}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">
                        {entry.interactionCountAtTime}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">
                        {entry.topRecommendedMovieTitles.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
