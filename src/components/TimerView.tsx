import { useState, useEffect, useRef, useMemo } from 'react';
import { StudySession } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Coffee, 
  ChevronsRight, 
  Plus, 
  Minus,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface TimerViewProps {
  onAddSession: (minutes: number, subject?: string) => void;
  sessions: StudySession[];
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export default function TimerView({ onAddSession, sessions }: TimerViewProps) {
  // Configured durations (in minutes)
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subjectTag, setSubjectTag] = useState('');

  // Keeps track of the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Computed initial seconds for current mode
  const initialSeconds = useMemo(() => {
    switch (mode) {
      case 'focus': return focusDuration * 60;
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
    }
  }, [mode, focusDuration, shortBreakDuration, longBreakDuration]);

  // Adjust timers instantly when config durations change (if timer is not running/dirty)
  useEffect(() => {
    if (!isActive) {
      setSecondsLeft(initialSeconds);
    }
  }, [initialSeconds, isActive]);

  // Handle countdown action
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  // Synthesize chord for completion
  const triggerAudioCompleted = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      
      // Upgrade sound to melodic chord
      setTimeout(() => {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      }, 150);
      
      setTimeout(() => {
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
      }, 320);

      setTimeout(() => {
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6
      }, 480);
      
      osc.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.warn('Web Audio API could not synthesize alert: browser security sandbox constraints.', e);
    }
  };

  // Callback when timer finishes
  const handleTimerComplete = () => {
    setIsActive(false);
    triggerAudioCompleted();

    if (mode === 'focus') {
      // Record session
      onAddSession(focusDuration, subjectTag.trim() || undefined);
      alert(`🎉 Excellent session! You completed ${focusDuration} minutes of focused study. This has been logged to your progress tracking!`);
      
      // Auto transition to short study break
      setMode('shortBreak');
    } else {
      alert(`⏰ Break's over! Ready to focus again?`);
      setMode('focus');
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setIsActive(prev => !prev);
  };

  // Reset timer
  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(initialSeconds);
  };

  // Skip current mode
  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMode('shortBreak');
    } else if (mode === 'shortBreak') {
      setMode('longBreak');
    } else {
      setMode('focus');
    }
  };

  // Adjust configured duration modifiers
  const handleAdjustDuration = (modeToAdjust: TimerMode, isIncrement: boolean) => {
    const modifier = isIncrement ? 1 : -1;
    
    if (modeToAdjust === 'focus') {
      setFocusDuration(prev => Math.max(1, prev + modifier));
    } else if (modeToAdjust === 'shortBreak') {
      setShortBreakDuration(prev => Math.max(1, prev + modifier));
    } else {
      setLongBreakDuration(prev => Math.max(1, prev + modifier));
    }
  };

  // Circular progress stroke calculation
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const completionRatio = initialSeconds > 0 ? (initialSeconds - secondsLeft) / initialSeconds : 0;
  const dashOffset = circumference - (completionRatio * circumference);

  // Digital countdown text
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Pomodoro Study Clock
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Block out distractions and study in highly efficient, science-proven intervals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main circular countdown visual */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center shadow-sm relative min-h-[420px]">
          {/* Preset Buttons Header */}
          <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl gap-1 mb-8 self-center relative z-10">
            <button
              onClick={() => { setMode('focus'); setIsActive(false); }}
              id="mode-focus"
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'focus'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Focus Session
            </button>
            <button
              onClick={() => { setMode('shortBreak'); setIsActive(false); }}
              id="mode-short-break"
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'shortBreak'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-505 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Short Break
            </button>
            <button
              onClick={() => { setMode('longBreak'); setIsActive(false); }}
              id="mode-long-break"
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === 'longBreak'
                  ? 'bg-teal-550 text-white shadow-sm font-bold'
                  : 'text-slate-505 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-teal-400" />
              Long Break
            </button>
          </div>

          {/* Absolute circle countdown element */}
          <div className="relative flex items-center justify-center mb-8 h-56 w-56">
            {/* SVG Progress Arc Overlay */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Inner track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth={strokeWidth}
              />
              {/* Activated completion ring glow */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                className={`fill-none transition-all duration-300 ${
                  mode === 'focus' 
                    ? 'stroke-indigo-600' 
                    : mode === 'shortBreak' 
                    ? 'stroke-emerald-500' 
                    : 'stroke-teal-500'
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Absolute digital dial readout */}
            <div className="absolute text-center">
              <span className="block text-4xl font-extrabold text-slate-800 dark:text-slate-150 font-mono tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 block">
                {mode === 'focus' ? 'Focusing' : 'Resting'}
              </span>
            </div>
          </div>

          {/* Dial Controls Buttons Row */}
          <div className="flex items-center gap-4 relative z-10">
            <button
              onClick={handleReset}
              id="timer-reset"
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition-all cursor-pointer border border-slate-100/50 dark:border-slate-800/80"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              id="timer-toggle-play"
              className={`p-4 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-100 cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100/40 dark:shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50 dark:shadow-none'
              }`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={handleSkip}
              id="timer-skip"
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition-all cursor-pointer border border-slate-100/50 dark:border-slate-800/80"
              title="Skip this mode"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration sliders side context */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Study Subject proxy settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-505" />
              Focus Subject Tag
            </h3>
            
            <p className="text-xs text-slate-400 mb-3.5">
              Tagging sessions organizes your progress graphs by academic course material.
            </p>

            <input
              type="text"
              placeholder="e.g. History Exam, Math Proofs"
              value={subjectTag}
              id="timer-subject-tag-input"
              onChange={(e) => setSubjectTag(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
            />
          </div>

          {/* Quick Custom adjusters settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 uppercase tracking-wider">
              Quick Timer Configuration
            </h3>

            {/* Focus duration adjuster */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-slate-705 dark:text-slate-200">Focus Duration</span>
                <span className="text-xs text-slate-400 font-mono">{focusDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="dec-focus-dur"
                  onClick={() => handleAdjustDuration('focus', false)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="inc-focus-dur"
                  onClick={() => handleAdjustDuration('focus', true)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Short break duration adjuster */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-slate-705 dark:text-slate-200">Short Break</span>
                <span className="text-xs text-slate-400 font-mono">{shortBreakDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="dec-short-dur"
                  onClick={() => handleAdjustDuration('shortBreak', false)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="inc-short-dur"
                  onClick={() => handleAdjustDuration('shortBreak', true)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Long break duration adjuster */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-slate-705 dark:text-slate-200">Long Break</span>
                <span className="text-xs text-slate-400 font-mono">{longBreakDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="dec-long-dur"
                  onClick={() => handleAdjustDuration('longBreak', false)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="inc-long-dur"
                  onClick={() => handleAdjustDuration('longBreak', true)}
                  className="p-1 px-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 bg-white dark:bg-slate-950 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Past sessions records summary widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-150 mb-3 uppercase tracking-wider">
              Study Log Today
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                Finish your first Pomodoro session to see your activity logs recorded here in real-time!
              </div>
            ) : (
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {sessions.slice(-3).reverse().map((session, idx) => (
                  <div key={session.id || idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100/50 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-600 dark:text-slate-350">
                      Completed Focus Cycle
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      +{session.durationMinutes} mins
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
