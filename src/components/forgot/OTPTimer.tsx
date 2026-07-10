import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface OTPTimerProps {
  seconds: number;
  onResend: () => void;
  isLoading: boolean;
}

export const OTPTimer: React.FC<OTPTimerProps> = ({ seconds, onResend, isLoading }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg themed-transition" style={{ background: 'var(--hover-bg)' }}>
      {seconds > 0 ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Clock className="h-4 w-4" />
          <span>Resend code in <span className="font-semibold" style={{ color: 'var(--primary)' }}>{formatTime(seconds)}</span></span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            className="text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--primary)' }}
          >
            {isLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      )}
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>OTP valid for 10 minutes</div>
    </div>
  );
};