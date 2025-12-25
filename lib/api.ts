const API_BASE = "http://localhost:8000";

export async function fetchAnalysis(page = 1, size = 10) {
  const res = await fetch(`${API_BASE}/api/analysis?page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}

export async function fetchKnowledgeStats(knowledge: string, page = 1, size = 10) {
  const res = await fetch(`${API_BASE}/api/knowledge/stats?knowledge=${encodeURIComponent(knowledge)}&page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
