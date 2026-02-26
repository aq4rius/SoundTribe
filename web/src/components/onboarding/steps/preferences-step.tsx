import React, { useEffect } from 'react';
import { getGenres } from '@/actions/genres';
import type { OnboardingState } from '@/types/onboarding';
import type { Genre } from '@prisma/client';

export default function PreferencesStep({
  goNext,
  goBack,
  onboarding,
  saveOnboarding,
}: {
  goNext: () => void;
  goBack: () => void;
  onboarding: OnboardingState | null;
  saveOnboarding: (data: Partial<OnboardingState>) => void;
  [key: string]: unknown;
}) {
  const [genres, setGenres] = React.useState<string[]>(onboarding?.preferences?.genres || []);
  const [instruments, setInstruments] = React.useState<string[]>(
    onboarding?.preferences?.instruments || [],
  );
  const [influences, setInfluences] = React.useState<string[]>(
    onboarding?.preferences?.influences || [],
  );
  const [genreOptions, setGenreOptions] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    getGenres().then((data) => {
      setGenreOptions(data.map((g: Genre) => g.name));
    });
  }, []);

  const instrumentOptions = ['Guitar', 'Drums', 'Bass', 'Vocals', 'Keys'];

  const handleContinue = async () => {
    setError(null);
    try {
      await saveOnboarding({ preferences: { genres, instruments, influences }, onboardingStep: 2 });
      goNext();
    } catch {
      setError('Failed to save preferences. Please try again.');
    }
  };

  return (
    <div className="bg-white/10 rounded-xl shadow-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Music Preferences</h2>
      <div className="mb-2 text-white/80">Genres:</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {genreOptions.map((g) => (
          <button
            key={g}
            type="button"
            className={`px-3 py-1 rounded-full border transition ${genres.includes(g) ? 'bg-fuchsia-600 text-white border-fuchsia-500' : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'}`}
            onClick={() =>
              setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
            }
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mb-2 text-white/80">Instruments:</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {instrumentOptions.map((i) => (
          <button
            key={i}
            type="button"
            className={`px-3 py-1 rounded-full border transition ${instruments.includes(i) ? 'bg-fuchsia-600 text-white border-fuchsia-500' : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'}`}
            onClick={() =>
              setInstruments((prev) =>
                prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
              )
            }
          >
            {i}
          </button>
        ))}
      </div>
      <div className="mb-2 text-white/80 flex items-center gap-2">
        Influences (optional):
        <span className="text-xs text-white/40">Artists or bands that inspire you</span>
      </div>
      <input
        type="text"
        className="w-full border border-white/20 rounded px-2 py-1 mb-4 text-white bg-white/5 placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        placeholder="e.g. Radiohead, Daft Punk, Beyoncé"
        value={influences.join(', ')}
        onChange={(e) =>
          setInfluences(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-white/10 text-white/80 hover:bg-white/20 transition">
          Back
        </button>
        <button onClick={handleContinue} className="px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition">
          Continue
        </button>
      </div>
    </div>
  );
}
