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
  caseResults?: {
    caseId: string;
    title: string;
    caseNumber: number;
    score: number;
    passed: boolean;
    timeSpentSeconds: number;
    feedback: string[];
  }[];
}

export interface UserProgress {
  completedLessons: string[]; // lessonIds
  completedModules: string[]; // moduleIds
  scenarioAttempts: AttemptRecord[];
  lastActiveLessonId?: string;
  lastActiveModuleId?: string;
  certificationCompletedAt?: string;
  certificateId?: string;
}

const STORAGE_KEY = "nbs_pos_training_progress_v1";

export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  let uniqueCode: string;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    uniqueCode = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
  } else {
    uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  return `NBS-${year}-${uniqueCode}`;
}

function addCertificationCompletionDate(progress: UserProgress): UserProgress {
  const totalLessons = TRAINING_MODULES.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const allLessonsCompleted =
    totalLessons > 0 && progress.completedLessons.length >= totalLessons;
  const practicalExamPassed = progress.scenarioAttempts.some(
    (attempt) => attempt.scenarioId === "exam-practical" && attempt.passed
  );

  if (!allLessonsCompleted || !practicalExamPassed) {
    if (!progress.certificationCompletedAt && !progress.certificateId) {
      return progress;
    }
    const {
      certificationCompletedAt: _completedAt,
      certificateId: _certificateId,
      ...withoutCertification
    } = progress;
    return withoutCertification;
  }

  if (progress.certificationCompletedAt && progress.certificateId) return progress;
  return {
    ...progress,
    certificationCompletedAt:
      progress.certificationCompletedAt || new Date().toISOString(),
    certificateId: progress.certificateId || generateCertificateId(),
  };
}

export function computeCompletedModules(completedLessons: string[]): string[] {
  const completed: string[] = [];
  for (const mod of TRAINING_MODULES) {
    if (mod.lessons.length > 0 && mod.lessons.every((l) => completedLessons.includes(l.id))) {
      completed.push(mod.id);
    }
  }
  return completed;
}

async function syncToMariaDb(progress: UserProgress, newAttempt?: AttemptRecord): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const userProfileRaw = localStorage.getItem("nbs_user_profile");
    const userId = userProfileRaw ? JSON.parse(userProfileRaw).id : undefined;
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
        certificateId: progress.certificateId,
        scenarioAttempts: progress.scenarioAttempts,
        newAttempt,
      }),
    });
  } catch {
    // Background Sync Fallback
  }
}

export async function fetchProgressFromMariaDb(): Promise<UserProgress | null> {
  if (typeof window === "undefined") return null;
  try {
    const userProfileRaw = localStorage.getItem("nbs_user_profile");
    const userId = userProfileRaw ? JSON.parse(userProfileRaw).id : undefined;
    const url = userId ? `/api/progress?userId=${encodeURIComponent(userId)}` : "/api/progress";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.completedLessons)) {
      const local = getLocalProgress();
      const mergedLessons = Array.from(
        new Set([...(data.completedLessons || []), ...(local.completedLessons || [])])
      );
      const mergedModules = computeCompletedModules(mergedLessons);
      const serverAttempts: AttemptRecord[] = Array.isArray(data.scenarioAttempts) ? data.scenarioAttempts : [];
      const localAttempts: AttemptRecord[] = Array.isArray(local.scenarioAttempts) ? local.scenarioAttempts : [];
      const attemptMap = new Map<string, AttemptRecord>();
      for (const att of [...serverAttempts, ...localAttempts]) {
        if (att && att.id && !attemptMap.has(att.id)) {
          attemptMap.set(att.id, att);
        }
      }
      const mergedAttempts = Array.from(attemptMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const merged: UserProgress = addCertificationCompletionDate({
        completedLessons: mergedLessons,
        completedModules: mergedModules,
        scenarioAttempts: mergedAttempts,
        lastActiveLessonId: data.lastActiveLessonId || local.lastActiveLessonId,
        lastActiveModuleId: data.lastActiveModuleId || local.lastActiveModuleId,
        certificationCompletedAt: data.certificationCompletedAt || local.certificationCompletedAt,
        certificateId: data.certificateId || local.certificateId,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event("nbs_progress_updated"));
      if (
        mergedAttempts.length > serverAttempts.length ||
        mergedLessons.length > (data.completedLessons?.length || 0)
      ) {
        syncToMariaDb(merged);
      }
      return merged;
    }
  } catch {
    // Local Storage Fallback
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
    const stored = JSON.parse(raw) as UserProgress;
    const autoModules = computeCompletedModules(stored.completedLessons || []);
    const mergedModules = Array.from(new Set([...(stored.completedModules || []), ...autoModules]));
    stored.completedModules = mergedModules;
    const updated = addCertificationCompletionDate(stored);
    if (
      updated.certificationCompletedAt !== stored.certificationCompletedAt ||
      updated.certificateId !== stored.certificateId ||
      mergedModules.length !== (stored.completedModules?.length || 0)
    ) {
      saveLocalProgress(updated);
    }
    return updated;
  } catch (err) {
    console.error("Failed to read progress from storage", err);
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
}

export function saveLocalProgress(progress: UserProgress, newAttempt?: AttemptRecord): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event("nbs_progress_updated"));
    // MariaDB Background Sync
    syncToMariaDb(progress, newAttempt);
  } catch (err) {
    console.error("Failed to save progress to storage", err);
  }
}

export function markLessonAsCompleted(lessonId: string, moduleId: string): UserProgress {
  const current = getLocalProgress();
  const completedLessons = Array.from(new Set([...current.completedLessons, lessonId]));
  const autoModules = computeCompletedModules(completedLessons);
  const completedModules = Array.from(new Set([...current.completedModules, ...autoModules]));
  const updated: UserProgress = addCertificationCompletionDate({
    ...current,
    completedLessons,
    completedModules,
    lastActiveLessonId: lessonId,
    lastActiveModuleId: moduleId,
  });
  saveLocalProgress(updated);
  return updated;
}

export function recordScenarioAttempt(attempt: AttemptRecord): UserProgress {
  const current = getLocalProgress();
  const scenarioAttempts = [attempt, ...current.scenarioAttempts];
  const updated = addCertificationCompletionDate({
    ...current,
    scenarioAttempts,
  });
  saveLocalProgress(updated, attempt);
  return updated;
}
