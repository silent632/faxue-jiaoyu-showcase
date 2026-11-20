"use client";

import { useEffect, useState } from "react";

export function useExperiencePreview() {
  const [preview, setPreview] = useState({ articles: [], loading: false });
  useEffect(() => {
    if (!["127.0.0.1", "localhost"].includes(window.location.hostname)) return;
    const controller = new AbortController();
    setPreview({ articles: [], loading: true });
    fetch("/_local-experience/index.json", { signal: controller.signal, cache: "no-store" })
      .then(response => response.ok ? response.json() : [])
      .then(articles => {
        if (!controller.signal.aborted) setPreview({ articles, loading: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setPreview({ articles: [], loading: false });
      });
    return () => controller.abort();
  }, []);
  return preview;
}
