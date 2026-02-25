import React from 'react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => (
  <div className="alert alert-error shadow-lg my-2">
    <div className="flex-1">
      <span>{message}</span>
    </div>
    {onClose && (
      <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close">
        ✕
      </button>
    )}
  </div>
);

export default ErrorAlert;
