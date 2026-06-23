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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      {seconds > 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Resend code in <span className="font-semibold text-amber-600">{formatTime(seconds)}</span></span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-amber-600" />
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      )}
      <div className="text-xs text-gray-400">
        OTP valid for 10 minutes
      </div>
    </div>
  );
};