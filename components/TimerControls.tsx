import React, { useState, useEffect } from 'react';

interface TimerControlsProps {
  onTimerSet: (minutes: number) => void;
  onTimerClear: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ onTimerSet, onTimerClear }) => {
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // in seconds

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (remainingTime !== null && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(interval as NodeJS.Timeout);
            onTimerClear(); // Clear timer when it reaches 0
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else if (remainingTime === 0) {
      onTimerClear(); // Ensure timer is cleared when reaching 0
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [remainingTime, onTimerClear]);

  const handleSetTimer = () => {
    setRemainingTime(selectedMinutes * 60); // Convert minutes to seconds
    onTimerSet(selectedMinutes);
  };

  const handleCancelTimer = () => {
    setRemainingTime(null);
    onTimerClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsTimerVisible(!isTimerVisible)}
        className="text-zinc-400 hover:text-white transition-colors relative"
        title="Sleep timer"
      >
        {remainingTime !== null ? (
          <div className="relative">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
              {formatTime(remainingTime)}
            </span>
          </div>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        )}
      </button>
      
      {isTimerVisible && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-xl z-50">
          <div className="text-sm font-bold text-white mb-2">Sleep Timer</div>
          
          <div className="mb-3">
            <label className="block text-xs text-zinc-400 mb-1">Set timer (minutes)</label>
            <select 
              value={selectedMinutes}
              onChange={(e) => setSelectedMinutes(Number(e.target.value))}
              className="w-full bg-zinc-900 text-white text-sm rounded p-2 border border-zinc-700"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={120}>120 minutes</option>
              <option value={180}>180 minutes</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            {remainingTime !== null ? (
              <>
                <button 
                  onClick={handleCancelTimer}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSetTimer}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                  disabled
                >
                  Set
                </button>
              </>
            ) : (
              <button 
                onClick={handleSetTimer}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
              >
                Start Timer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerControls;