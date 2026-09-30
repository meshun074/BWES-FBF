import { apiFetch } from "@/lib/api/client";

interface ApiStatus {
  service: string;
  status: string;
}

export default async function Home() {
  let apiStatus: ApiStatus | null = null;

  try {
    const response = await apiFetch("/status");

    if (response.ok) {
      apiStatus = (await response.json()) as ApiStatus;
    }
  } catch {
    // Phase 1 connectivity page intentionally tolerates API unavailability.
  }

  return (
    <main>
      <h1>BWES AI-Enabled Knowledge Hub</h1>
      <p>Frontend application shell is running.</p>

      <p>
        API status:{" "}
        {apiStatus
          ? `${apiStatus.service} — ${apiStatus.status}`
          : "unavailable"}
      </p>
    </main>
  );
}
