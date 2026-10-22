import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  calculateCountdownProgress,
  calculateFlowBreakBudget,
  getNextPomodoroStep,
  calculateStreak,
  getTodayPomodorosCount,
} from './timerLogic';
import { SessionLog } from '../types/timer';

test('getTodayPomodorosCount accurately counts focus sessions completed today', () => {
  const now = Date.now();
  const yesterday = now - 24 * 60 * 60 * 1000;

  const mockSessions: SessionLog[] = [
    {
      id: '1',
      timestamp: now - 1000 * 60 * 10,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
    {
      id: '2',
      timestamp: now - 1000 * 60 * 60,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
    {
      id: '3',
      timestamp: now - 1000 * 60 * 30,
      durationSeconds: 300,
      type: 'shortBreak',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
    {
      id: '4',
      timestamp: yesterday,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
  ];

  assert.equal(getTodayPomodorosCount(mockSessions), 2);
  assert.equal(getTodayPomodorosCount([]), 0);
});

test('formatTime formats standard minutes and seconds', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(1500), '25:00');
});

test('formatTime formats hours correctly when >= 3600 seconds', () => {
  assert.equal(formatTime(3600), '01:00:00');
  assert.equal(formatTime(3665), '01:01:05');
  assert.equal(formatTime(7200), '02:00:00');
});

test('calculateCountdownProgress accurately calculates normalized progress ratio', () => {
  assert.equal(calculateCountdownProgress(1500, 1500), 0);
  assert.equal(calculateCountdownProgress(750, 1500), 0.5);
  assert.equal(calculateCountdownProgress(0, 1500), 1);
  // Edge cases
  assert.equal(calculateCountdownProgress(-10, 1500), 1);
  assert.equal(calculateCountdownProgress(2000, 1500), 0);
});

test('calculateFlowBreakBudget calculates earned break correctly based on ratio', () => {
  // 5 seconds worked gives 1 second break (5:1 ratio)
  assert.equal(calculateFlowBreakBudget(1500, 5), 300); // 25 min work = 5 min break
  assert.equal(calculateFlowBreakBudget(3000, 5), 600); // 50 min work = 10 min break
  assert.equal(calculateFlowBreakBudget(0, 5), 0);
  assert.equal(calculateFlowBreakBudget(12, 5), 2);
});

test('getNextPomodoroStep switches between focus, shortBreak, and longBreak on target cycle count', () => {
  // 4 sessions per long break
  // After session 1 (completed = 0): next is shortBreak
  const step1 = getNextPomodoroStep('focus', 0, 4);
  assert.equal(step1.nextStep, 'shortBreak');
  assert.equal(step1.isLongBreak, false);

  // After shortBreak: next is focus
  const stepBreak = getNextPomodoroStep('shortBreak', 1, 4);
  assert.equal(stepBreak.nextStep, 'focus');

  // After session 4 (completed = 3): next is longBreak
  const step4 = getNextPomodoroStep('focus', 3, 4);
  assert.equal(step4.nextStep, 'longBreak');
  assert.equal(step4.isLongBreak, true);

  // After longBreak: next is focus
  const stepAfterLong = getNextPomodoroStep('longBreak', 4, 4);
  assert.equal(stepAfterLong.nextStep, 'focus');
});

test('calculateStreak counts consecutive active days properly', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const mockSessions: SessionLog[] = [
    {
      id: '1',
      timestamp: now,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
    {
      id: '2',
      timestamp: now - dayMs,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
    {
      id: '3',
      timestamp: now - dayMs * 2,
      durationSeconds: 1200,
      type: 'flow',
      labelId: 'work',
      labelName: 'Coding',
      labelColor: '#38BDF8',
    },
  ];

  assert.equal(calculateStreak(mockSessions), 3);

  // Empty sessions -> streak 0
  assert.equal(calculateStreak([]), 0);
});
