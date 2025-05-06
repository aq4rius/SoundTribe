// client/src/components/applications/ApplicationForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitApplication } from '../../services/application';
import { Event, ArtistProfile } from '../../types';

interface ApplicationFormProps {
  event: Event;
  artistProfile: ArtistProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  event,
  artistProfile,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: event.paymentAmount,
    availability: [] as Date[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitApplication({
        eventPostingId: event._id,
        artistProfileId: artistProfile._id,
        ...formData
      });
      onSuccess?.();
      navigate('/dashboard');
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
        <label className="block text-sm font-medium mb-1 text-base-content">Proposed Rate (${event.paymentType})</label>
        <input
          type="number"
          value={formData.proposedRate}
          onChange={(e) => setFormData({ ...formData, proposedRate: Number(e.target.value) })}
          className="w-full input input-bordered"
          min={0}
        />
      </div>

      {error && <div className="text-error">{error}</div>}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
