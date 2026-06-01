import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CompanyStatus } from "@/lib/companies";

export function useCompanyStatus(
  companyId: string,
  initialStatus: CompanyStatus = "idle",
  onSettled?: () => void,
) {
  const [status, setStatus] = useState<CompanyStatus>(initialStatus);
  const [latestSignal, setLatestSignal] = useState<string | null>(null);
  const [lastResearchedAt, setLastResearchedAt] = useState<string | null>(null);
  const wasResearching = useRef(initialStatus === "researching");

  useEffect(() => {
    setStatus(initialStatus);
    wasResearching.current = initialStatus === "researching";
  }, [initialStatus]);

  useEffect(() => {
    if (!companyId) return;

    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function poll() {
      const { data } = await supabase
        .from("companies")
        .select("status, latest_signal, last_researched_at")
        .eq("id", companyId)
        .single();

      if (!mounted || !data) return;

      setStatus(data.status as CompanyStatus);
      setLatestSignal(data.latest_signal);
      setLastResearchedAt(data.last_researched_at);

      if (data.status === "ready" || data.status === "error") {
        if (intervalId) clearInterval(intervalId);
        if (wasResearching.current) {
          wasResearching.current = false;
          onSettled?.();
        }
      }

      if (data.status === "researching") {
        wasResearching.current = true;
        if (!intervalId) {
          intervalId = setInterval(poll, 3000);
        }
      }
    }

    poll();
    if (initialStatus === "researching") {
      intervalId = setInterval(poll, 3000);
    }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [companyId, initialStatus, onSettled]);

  return { status, latestSignal, lastResearchedAt };
}
