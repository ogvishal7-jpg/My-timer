import { PomodoroStep, SessionLog } from '../types/timer';

/**
 * Formats seconds into MM:SS or HH:MM:SS format
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates countdown progress from 0 (just started) to 1 (finished)
 */
export function calculateCountdownProgress(secondsLeft: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const progress = (totalSeconds - secondsLeft) / totalSeconds;
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Calculates accrued break seconds in Flow mode based on ratio.
 * e.g. ratio = 5 means 1 second break earned for every 5 seconds worked.
 */
export function calculateFlowBreakBudget(flowSeconds: number, ratio: number = 5): number {
  if (flowSeconds <= 0 || ratio <= 0) return 0;
  return Math.floor(flowSeconds / ratio);
}

/**
 * Determines the next Pomodoro step given current step and completed session count
 */
export function getNextPomodoroStep(
  currentStep: PomodoroStep,
  completedFocusSessions: number,
  sessionsUntilLongBreak: number
): { nextStep: PomodoroStep; isLongBreak: boolean } {
  if (currentStep === 'focus') {
    const nextCompleted = completedFocusSessions + 1;
    const isLongBreak = nextCompleted % sessionsUntilLongBreak === 0;
    return {
      nextStep: isLongBreak ? 'longBreak' : 'shortBreak',
      isLongBreak,
    };
  } else {
    // If we just finished shortBreak or longBreak, next is focus
    return {
      nextStep: 'focus',
      isLongBreak: false,
    };
  }
}

/**
 * Calculates daily streak: consecutive days with at least 1 focus/flow session completed
 */
export function calculateStreak(sessions: SessionLog[]): number {
  const focusSessions = sessions.filter(s => s.type === 'focus' || s.type === 'flow');
  if (focusSessions.length === 0) return 0;

  // Set of dates string in YYYY-MM-DD local format
  const activeDays = new Set<string>();
  for (const session of focusSessions) {
    const d = new Date(session.timestamp);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activeDays.add(dateStr);
  }

  const today = new Date();
  const formatDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  let checkDate = new Date(today);
  const todayStr = formatDay(checkDate);

  // If didn't focus today, check if focused yesterday (streak might still be alive)
  let streak = 0;
  if (!activeDays.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!activeDays.has(formatDay(checkDate))) {
      return 0;
    }
  }

  // Count backwards
  while (activeDays.has(formatDay(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculates total number of completed focus pomodoros today
 */
export function getTodayPomodorosCount(sessions: SessionLog[]): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return sessions.filter(s => s.type === 'focus' && s.timestamp >= startOfToday).length;
}
