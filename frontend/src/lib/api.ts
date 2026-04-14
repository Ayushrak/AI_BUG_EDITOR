import type {
  AnalyticsOverview,
  CreateScanPayload,
  Developer,
  DeveloperAnalytics,
  DeveloperRole,
  ScanRecord,
} from "./types";

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) {
    return "http://127.0.0.1:3001/api/v1";
  }
  return base.replace(/\/$/, "");
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let message = text || res.statusText;
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      if (typeof j.message === "string") message = j.message;
      if (Array.isArray(j.message)) message = j.message.join(", ");
    } catch {
      /* use raw */
    }
    throw new Error(message || `Request failed (${res.status})`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// Authentication APIs
export async function signup(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<{
  user: { id: string; email: string; name?: string };
  token: string;
}> {
  const res = await fetch(`${apiBase()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<{
  user: { id: string; email: string; name?: string };
  token: string;
}> {
  const res = await fetch(`${apiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function verifyToken(
  token: string,
): Promise<{ user: { id: string; email: string; name?: string } }> {
  const res = await fetch(`${apiBase()}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return parseJson(res);
}

export async function getMe(
  token: string,
): Promise<{ user: { id: string; email: string; name?: string } }> {
  const res = await fetch(`${apiBase()}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJson(res);
}

// Scan APIs
export async function createScan(
  payload: CreateScanPayload,
): Promise<{ id: string; status: string; createdAt: string }> {
  const res = await fetch(`${apiBase()}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function getScan(id: string): Promise<ScanRecord> {
  const res = await fetch(`${apiBase()}/scans/${id}`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${apiBase()}/analytics/overview`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function listDevelopers(): Promise<Developer[]> {
  const res = await fetch(`${apiBase()}/developers`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function createDeveloper(payload: {
  name: string;
  email: string;
  role: DeveloperRole;
  avatarUrl?: string;
}): Promise<Developer> {
  const res = await fetch(`${apiBase()}/developers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function getDeveloper(id: string): Promise<Developer> {
  const res = await fetch(`${apiBase()}/developers/${id}`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function getDeveloperAnalytics(
  id: string,
): Promise<DeveloperAnalytics> {
  const res = await fetch(`${apiBase()}/developers/${id}/analytics`, {
    cache: "no-store",
  });
  return parseJson(res);
}
