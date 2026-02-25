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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Music Preferences</h2>
      <div className="mb-2 text-gray-800">Genres:</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {genreOptions.map((g) => (
          <button
            key={g}
            type="button"
            className={`px-3 py-1 rounded-full border ${genres.includes(g) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'}`}
            onClick={() =>
              setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
            }
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mb-2 text-gray-800">Instruments:</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {instrumentOptions.map((i) => (
          <button
            key={i}
            type="button"
            className={`px-3 py-1 rounded-full border ${instruments.includes(i) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'}`}
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
      <div className="mb-2 text-gray-800 flex items-center gap-2">
        Influences (optional):
        <span className="text-xs text-gray-500">Artists or bands that inspire you</span>
      </div>
      <input
        type="text"
        className="w-full border rounded px-2 py-1 mb-4 text-gray-900 bg-gray-50"
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
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-gray-200 text-gray-900">
          Back
        </button>
        <button onClick={handleContinue} className="px-4 py-2 rounded bg-indigo-500 text-white">
          Continue
        </button>
      </div>
    </div>
  );
}
