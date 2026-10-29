import { TRAINING_MODULES } from "@/data/modules";

export interface AttemptRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  timestamp: string;
  score: number;
  passed: boolean;
  stepsCompleted: number;
  totalSteps: number;
  mistakes: {
    step: number;
    actionAttempted: string;
    expected: string;
    feedback: string;
  }[];
  hintsUsed: number;
  timeSpentSeconds: number;
}

export interface UserProgress {
  completedLessons: string[]; // lessonIds
  completedModules: string[]; // moduleIds
  scenarioAttempts: AttemptRecord[];
  lastActiveLessonId?: string;
  lastActiveModuleId?: string;
  certificationCompletedAt?: string;
}

const STORAGE_KEY = "nbs_pos_training_progress_v1";

function addCertificationCompletionDate(progress: UserProgress): UserProgress {
  const totalLessons = TRAINING_MODULES.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const allLessonsCompleted =
    totalLessons > 0 && progress.completedLessons.length >= totalLessons;

  if (!allLessonsCompleted || progress.certificationCompletedAt) {
    return progress;
  }

  return {
    ...progress,
    certificationCompletedAt: new Date().toISOString(),
  };
}

export function getLocalProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
    const storedProgress = JSON.parse(raw) as UserProgress;
    const progress = addCertificationCompletionDate(storedProgress);
    if (progress !== storedProgress) {
      saveLocalProgress(progress);
    }
    return progress;
  } catch (err) {
    console.error("Failed to read progress from storage", err);
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
}

export function saveLocalProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save progress to storage", err);
  }
}

export function markLessonAsCompleted(lessonId: string, moduleId: string): UserProgress {
  const current = getLocalProgress();
  const completedLessons = Array.from(new Set([...current.completedLessons, lessonId]));
  const updated = addCertificationCompletionDate({
    ...current,
    completedLessons,
    lastActiveLessonId: lessonId,
    lastActiveModuleId: moduleId,
  });
  saveLocalProgress(updated);
  return updated;
}

export function recordScenarioAttempt(attempt: AttemptRecord): UserProgress {
  const current = getLocalProgress();
  const scenarioAttempts = [attempt, ...current.scenarioAttempts];
  const updated: UserProgress = {
    ...current,
    scenarioAttempts,
  };
  saveLocalProgress(updated);
  return updated;
}
