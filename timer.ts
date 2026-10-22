export type TimerMode = 'pomodoro' | 'flow';

export type PomodoroStep = 'focus' | 'shortBreak' | 'longBreak';

export interface Label {
  id: string;
  name: string;
  color: string;
  customFocusMinutes?: number;
  customShortBreakMinutes?: number;
  customLongBreakMinutes?: number;
}

export interface SessionLog {
  id: string;
  timestamp: number; // Date.now()
  durationSeconds: number;
  type: 'focus' | 'shortBreak' | 'longBreak' | 'flow';
  labelId: string;
  labelName: string;
  labelColor: string;
  note?: string;
  isManual?: boolean;
}

export type SoundStyle = 'tibetan' | 'bell' | 'marimba' | 'digital' | 'none';

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundVolume: number; // 0 to 1
  soundStyle: SoundStyle;
  visualFlash: boolean;
  vibration: boolean;
  flowBreakRatio: number; // e.g. 5: 1 min break per 5 min flow
  accentColor: string;
  progressStyle: 'ring' | 'line';
}
