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
        <label className="block text-sm font-medium mb-1">Cover Letter</label>
        <textarea
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          className="w-full px-3 py-2 border rounded min-h-[150px]"
          required
          placeholder="Explain why you're interested in this event and why you'd be a good fit..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Proposed Rate (${event.paymentType})</label>
        <input
          type="number"
          value={formData.proposedRate}
          onChange={(e) => setFormData({ ...formData, proposedRate: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          min={0}
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
