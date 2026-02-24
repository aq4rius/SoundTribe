// ApplicationForm migrated from client/src/components/applications/ApplicationForm.tsx
'use client';

import { useState } from 'react';
import ErrorAlert from '../common/error-alert';
import { env } from '@/lib/env';
import type { IEventPosting, IArtistProfile } from '@/types';

interface ApplicationFormProps {
  event: IEventPosting;
  artistProfile: IArtistProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  event,
  artistProfile,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: event.paymentAmount,
    availability: [] as Date[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required.');
      setIsSubmitting(false);
      return;
    }
    if (formData.proposedRate < 0) {
      setError('Proposed rate must be non-negative.');
      setIsSubmitting(false);
      return;
    }
    try {
      // Submit application to backend
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/applications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : '' : ''}`,
          },
          body: JSON.stringify({
            eventPostingId: event._id,
            artistProfileId: artistProfile._id,
            coverLetter: formData.coverLetter,
            proposedRate: formData.proposedRate,
            availability: formData.availability,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to submit application');
        setIsSubmitting(false);
        return;
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1 text-base-content">Cover Letter</label>
        <textarea
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          className="w-full textarea textarea-bordered min-h-[150px]"
          required
          placeholder="Explain why you're interested in this event and why you'd be a good fit..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-base-content">
          Proposed Rate (${event.paymentType})
        </label>
        <input
          type="number"
          value={formData.proposedRate}
          onChange={(e) => setFormData({ ...formData, proposedRate: Number(e.target.value) })}
          className="w-full input input-bordered"
          min={0}
        />
      </div>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
