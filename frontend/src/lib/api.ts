import type { BackendModelInfo, Episode, ModelId } from "../types";

/** Backend address. Override with VITE_API_BASE_URL in frontend/.env.local (see .env.example). */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, init);
  } catch {
    throw new Error(`Cannot reach the backend at ${API_BASE_URL}. Is it running?`);
  }
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg: string }) => d.msg).join("; ");
    } catch {
      /* keep the status text */
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export function fetchModels(): Promise<{ env_id: string; models: BackendModelInfo[] }> {
  return request("/api/models");
}

export function runEpisode(modelId: ModelId, seed: number | null, deterministic: boolean): Promise<Episode> {
  return request("/api/episodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId, seed, deterministic }),
  });
}
