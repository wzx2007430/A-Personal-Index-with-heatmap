// src/utils/mood.ts — Shared mood data utilities
import fs from "node:fs";
import path from "node:path";

export interface MoodEntry {
  date: string;
  mood: number;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "moods.json");

/** Safely format a Date as YYYY-MM-DD (timezone-safe). */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Read mood entries from disk. Returns empty array if file missing/invalid. */
export function readMoods(): MoodEntry[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as MoodEntry[];
  } catch {
    return [];
  }
}

/** Write mood entries to disk. Throws on failure so callers can handle it. */
export function writeMoods(entries: MoodEntry[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

/** Validate Authorization Bearer token. Returns false (deny) when secret is not configured. */
export function validateAuthToken(request: Request): boolean {
  const secret = import.meta.env.MOOD_SECRET;
  if (!secret) return false; // fail-secure: deny when unconfigured
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  return token === secret;
}

/** Calculate consecutive-day streak from latest recorded date backwards. */
export function calculateStreak(moods: MoodEntry[]): number {
  if (moods.length === 0) return 0;
  const sorted = [...moods].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
