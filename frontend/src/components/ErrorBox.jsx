import { AlertCircle } from 'lucide-react';

export default function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p className="error-box" role="alert">
      <AlertCircle size={16} /> {message}
    </p>
  );
}
