import type { APIRoute } from "astro";
import {
  readMoods,
  writeMoods,
  validateAuthToken,
  calculateStreak,
} from "~/utils/mood";

// Simple in-memory rate limiter: max 1 POST per 3 seconds per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 3000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) return true;
  rateLimitMap.set(ip, now);
  // Cleanup old entries periodically
  if (rateLimitMap.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, ts] of rateLimitMap) {
      if (ts < cutoff) rateLimitMap.delete(key);
    }
  }
  return false;
}

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const GET: APIRoute = async () => {
  const moods = readMoods();
  const totalDays = moods.length;
  const currentStreak = calculateStreak(moods);

  return new Response(
    JSON.stringify({ moods, totalDays, currentStreak }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  // Auth check (fail-secure)
  if (!validateAuthToken(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limiting
  const clientIP = getClientIP(request);
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "3" },
    });
  }

  // Body size guard (max 256 bytes)
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 256) {
    return new Response(JSON.stringify({ error: "Request body too large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const mood = Number(body.mood);
    const date = String(body.date);

    if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
      return new Response(
        JSON.stringify({ error: "mood must be an integer between 1 and 5" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: "date must be in YYYY-MM-DD format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const entries = readMoods();
    const existingIndex = entries.findIndex((e) => e.date === date);

    if (existingIndex >= 0) {
      entries[existingIndex].mood = mood;
    } else {
      entries.push({ date, mood });
    }

    try {
      writeMoods(entries);
    } catch (writeErr) {
      console.error("Failed to write moods file:", writeErr);
      return new Response(
        JSON.stringify({ error: "Failed to persist data. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, entry: { date, mood } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};
