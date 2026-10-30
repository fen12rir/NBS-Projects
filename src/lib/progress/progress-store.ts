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

async function syncToMariaDb(progress: UserProgress, newAttempt?: AttemptRecord): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const userProfileRaw = localStorage.getItem("nbs_user_profile");
    const userId = userProfileRaw ? JSON.parse(userProfileRaw).id : "demo-cashier-001";
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        completedLessons: progress.completedLessons,
        completedModules: progress.completedModules,
        lastActiveLessonId: progress.lastActiveLessonId,
        lastActiveModuleId: progress.lastActiveModuleId,
        certificationCompletedAt: progress.certificationCompletedAt,
        newAttempt,
      }),
    });
  } catch {
    // Non-blocking background sync to allow full offline/local resilience
  }
}

export async function fetchProgressFromMariaDb(): Promise<UserProgress | null> {
  if (typeof window === "undefined") return null;
  try {
    const userProfileRaw = localStorage.getItem("nbs_user_profile");
    const userId = userProfileRaw ? JSON.parse(userProfileRaw).id : "demo-cashier-001";
    const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.completedLessons)) {
      saveLocalProgress(data);
      return data as UserProgress;
    }
  } catch {
    // Return null on failure to allow local fallback
  }
  return null;
}

export function getLocalProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read progress from storage", err);
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
}

export function saveLocalProgress(progress: UserProgress, newAttempt?: AttemptRecord): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Asynchronously push to MariaDB
    syncToMariaDb(progress, newAttempt);
  } catch (err) {
    console.error("Failed to save progress to storage", err);
  }
}

export function markLessonAsCompleted(lessonId: string, moduleId: string): UserProgress {
  const current = getLocalProgress();
  const completedLessons = Array.from(new Set([...current.completedLessons, lessonId]));
  const updated: UserProgress = {
    ...current,
    completedLessons,
    lastActiveLessonId: lessonId,
    lastActiveModuleId: moduleId,
  };
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
  saveLocalProgress(updated, attempt);
  return updated;
}
