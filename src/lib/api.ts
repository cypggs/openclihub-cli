import type { ApiListResponse, ApiSingleResponse, CliTool } from "../types.js";

const DEFAULT_API_URL = "https://openclihub.com";

let apiUrl = DEFAULT_API_URL;

export function setApiUrl(url: string) {
  apiUrl = url.replace(/\/$/, "");
}

export function getApiUrl() {
  return apiUrl;
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${apiUrl}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "openclihub-cli" },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listTools(opts?: {
  type?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiListResponse> {
  const params = new URLSearchParams();
  if (opts?.type) params.set("type", opts.type);
  if (opts?.category) params.set("category", opts.category);
  if (opts?.q) params.set("q", opts.q);
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.offset) params.set("offset", String(opts.offset));
  const qs = params.toString();
  return fetchJson<ApiListResponse>(`/api/tools${qs ? `?${qs}` : ""}`);
}

export async function getTool(slug: string): Promise<CliTool> {
  const res = await fetchJson<ApiSingleResponse>(`/api/tools/${slug}`);
  return res.data;
}
