import { Label, SessionLog, TimerSettings } from '../types/timer';

export const DEFAULT_LABELS: Label[] = [
  { id: 'focus', name: 'Focus', color: '#38BDF8' },
  { id: 'coding', name: 'Coding', color: '#10B981', customFocusMinutes: 45 },
  { id: 'reading', name: 'Reading', color: '#F59E0B', customFocusMinutes: 30 },
  { id: 'deep-work', name: 'Deep Work', color: '#8B5CF6', customFocusMinutes: 50 },
  { id: 'writing', name: 'Writing', color: '#EC4899', customFocusMinutes: 25 },
];

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundVolume: 0.8,
  soundStyle: 'bell',
  visualFlash: true,
  vibration: true,
  flowBreakRatio: 5,
  accentColor: '#38BDF8',
  progressStyle: 'ring',
};

const STORAGE_KEYS = {
  LABELS: 'puretime_labels_v1',
  SESSIONS: 'puretime_sessions_v1',
  SETTINGS: 'puretime_settings_v1',
  ACTIVE_LABEL: 'puretime_active_label_v1',
};

export function loadLabels(): Label[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LABELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading labels from storage:', e);
  }
  return DEFAULT_LABELS;
}

export function saveLabels(labels: Label[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
  } catch (e) {
    console.error('Error saving labels:', e);
  }
}

export function loadSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function loadSessions(): SessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading sessions:', e);
  }
  
  // Provide sample seed data for first run so stats look engaging
  const seedSessions: SessionLog[] = [
    {
      id: 'seed-1',
      timestamp: Date.now() - 3600 * 1000 * 2,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'coding',
      labelName: 'Coding',
      labelColor: '#10B981',
      note: 'Built project architecture and state management',
    },
    {
      id: 'seed-2',
      timestamp: Date.now() - 3600 * 1000 * 24,
      durationSeconds: 2700,
      type: 'flow',
      labelId: 'deep-work',
      labelName: 'Deep Work',
      labelColor: '#8B5CF6',
      note: 'Deep focus on core algorithms',
    },
    {
      id: 'seed-3',
      timestamp: Date.now() - 3600 * 1000 * 48,
      durationSeconds: 1500,
      type: 'focus',
      labelId: 'reading',
      labelName: 'Reading',
      labelColor: '#F59E0B',
      note: 'Chapter 4 & 5',
    },
  ];
  return seedSessions;
}

export function saveSessions(sessions: SessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions:', e);
  }
}

export function loadActiveLabelId(labels: Label[]): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_LABEL);
    if (raw && labels.some(l => l.id === raw)) return raw;
  } catch (e) {
    console.error('Error loading active label:', e);
  }
  return labels[0]?.id || 'focus';
}

export function saveActiveLabelId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LABEL, id);
  } catch (e) {
    console.error('Error saving active label:', e);
  }
}

/**
 * Exports sessions to a downloadable CSV string and triggers browser download
 */
export function exportToCSV(sessions: SessionLog[]): void {
  const headers = ['ID', 'Date', 'Time', 'Duration (Minutes)', 'Duration (Seconds)', 'Type', 'Label', 'Note', 'Is Manual'];
  
  const rows = sessions.map(s => {
    const d = new Date(s.timestamp);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const durationMin = (s.durationSeconds / 60).toFixed(1);
    
    // Escape quote marks for CSV safety
    const safeNote = (s.note || '').replace(/"/g, '""');
    const safeLabel = (s.labelName || '').replace(/"/g, '""');

    return [
      `"${s.id}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${durationMin}"`,
      `"${s.durationSeconds}"`,
      `"${s.type}"`,
      `"${safeLabel}"`,
      `"${safeNote}"`,
      `"${s.isManual ? 'Yes' : 'No'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `puretime-sessions-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports full backup (sessions, labels, settings) to JSON
 */
export function exportToJSON(sessions: SessionLog[], labels: Label[], settings: TimerSettings): void {
  const backupData = {
    version: 1,
    exportDate: new Date().toISOString(),
    sessions,
    labels,
    settings,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `puretime-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports JSON backup
 */
export function validateAndParseBackupJSON(jsonStr: string): {
  success: boolean;
  data?: { sessions: SessionLog[]; labels: Label[]; settings: TimerSettings };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    if (!Array.isArray(parsed.sessions) && !Array.isArray(parsed.labels)) {
      return { success: false, error: 'Backup does not contain valid sessions or labels array' };
    }

    return {
      success: true,
      data: {
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        labels: Array.isArray(parsed.labels) ? parsed.labels : DEFAULT_LABELS,
        settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
      },
    };
  } catch {
    return { success: false, error: 'Failed to parse JSON file' };
  }
}
