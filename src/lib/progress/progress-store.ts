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
  userId?: string;
  completedLessons: string[]; // lessonIds
  completedModules: string[]; // moduleIds
  scenarioAttempts: AttemptRecord[];
  lastActiveLessonId?: string;
  lastActiveModuleId?: string;
  certificationCompletedAt?: string;
  certificateId?: string;
}

const LEGACY_STORAGE_KEY = "nbs_pos_training_progress_v1";
const STORAGE_KEY_PREFIX = "nbs_pos_training_progress_v2_";

function getActiveUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  try {
    const raw = localStorage.getItem("nbs_user_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return String(parsed.id);
    }
    const demoFlag = localStorage.getItem("nbs_demo_active");
    if (demoFlag === "admin") return "demo-admin-001";
    if (demoFlag === "trainee" || demoFlag === "true") return "demo-cashier-001";
  } catch {}
  return "anonymous";
}

function getStorageKey(userId?: string): string {
  const uid = userId || getActiveUserId();
  return `${STORAGE_KEY_PREFIX}${uid}`;
}

export function clearLegacySharedProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {}
}

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
    const userId = progress.userId || getActiveUserId();
    if (!userId || userId === "anonymous" || userId.startsWith("demo-")) return;
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
    clearLegacySharedProgress();
    const userId = getActiveUserId();
    if (!userId || userId === "anonymous" || userId.startsWith("demo-")) {
      return getLocalProgress();
    }
    const url = `/api/progress?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.completedLessons)) {
      const serverLessons: string[] = data.completedLessons || [];
      const serverModules = computeCompletedModules(serverLessons);
      const serverAttempts: AttemptRecord[] = Array.isArray(data.scenarioAttempts)
        ? data.scenarioAttempts
        : [];
      const serverProgress: UserProgress = addCertificationCompletionDate({
        userId,
        completedLessons: serverLessons,
        completedModules: serverModules,
        scenarioAttempts: serverAttempts,
        lastActiveLessonId: data.lastActiveLessonId || undefined,
        lastActiveModuleId: data.lastActiveModuleId || undefined,
        certificationCompletedAt: data.certificationCompletedAt || undefined,
        certificateId: data.certificateId || undefined,
      });
      localStorage.setItem(getStorageKey(userId), JSON.stringify(serverProgress));
      window.dispatchEvent(new Event("nbs_progress_updated"));
      return serverProgress;
    }
  } catch {
    // Local Storage Fallback
  }
  return null;
}

export function getLocalProgress(forUserId?: string): UserProgress {
  if (typeof window === "undefined") {
    return { completedLessons: [], completedModules: [], scenarioAttempts: [] };
  }
  try {
    clearLegacySharedProgress();
    const uid = forUserId || getActiveUserId();
    const raw = localStorage.getItem(getStorageKey(uid));
    if (!raw) return { userId: uid, completedLessons: [], completedModules: [], scenarioAttempts: [] };
    const stored = JSON.parse(raw) as UserProgress;
    if (stored.userId && stored.userId !== uid) {
      return { userId: uid, completedLessons: [], completedModules: [], scenarioAttempts: [] };
    }
    stored.userId = uid;
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
    clearLegacySharedProgress();
    const uid = progress.userId || getActiveUserId();
    const scopedProgress: UserProgress = { ...progress, userId: uid };
    localStorage.setItem(getStorageKey(uid), JSON.stringify(scopedProgress));
    window.dispatchEvent(new Event("nbs_progress_updated"));
    // MariaDB Background Sync
    syncToMariaDb(scopedProgress, newAttempt);
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
