// ApplicationForm — submit an application to an event
'use client';

import { useState } from 'react';
import ErrorAlert from '../common/error-alert';
import { createApplicationAction } from '@/actions/applications';

interface ApplicationFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  eventId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: 0,
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

    try {
      const fd = new FormData();
      fd.set('eventPostingId', eventId);
      fd.set('coverLetter', formData.coverLetter);
      if (formData.proposedRate > 0) {
        fd.set('proposedRate', String(formData.proposedRate));
      }

      const result = await createApplicationAction(fd);
      if (!result.success) {
        setError(result.error);
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
        <label className="block text-sm font-medium mb-1 text-base-content">Proposed Rate ($)</label>
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
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
