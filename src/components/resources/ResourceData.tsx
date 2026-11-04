"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { resources as seeds } from "@/data/resources";
import type { Resource } from "@/data/resources";
import type { SavedResource } from "@/lib/resources/model";

type Session = { authenticated: boolean; configured: boolean; local: boolean };
type ResourceData = { resources: Resource[]; entries: SavedResource[]; session: Session | null; error: string; refresh: () => Promise<void> };
const Context = createContext<ResourceData | null>(null);

export function ResourceDataProvider({ children }: { children: React.ReactNode }) {
  const [published, setPublished] = useState<Resource[]>([]);
  const [entries, setEntries] = useState<SavedResource[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const [publicResponse, sessionResponse] = await Promise.all([
        fetch("/api/resources", { cache: "no-store" }), fetch("/api/resources/session", { cache: "no-store" }),
      ]);
      if (!publicResponse.ok || !sessionResponse.ok) throw new Error("Saved resources could not be loaded.");
      const publicData = await publicResponse.json();
      const owner = await sessionResponse.json() as Session;
      let privateEntries: SavedResource[] = [];
      if (owner.authenticated) {
        const response = await fetch("/api/resources?scope=inbox", { cache: "no-store" });
        if (!response.ok) throw new Error("Your inbox could not be loaded.");
        privateEntries = (await response.json()).resources;
      }
      if (current !== generation.current) return;
      setPublished(publicData.resources); setSession(owner); setEntries(privateEntries); setError("");
    } catch (error) {
      if (current === generation.current) setError(error instanceof Error ? error.message : "The library could not be loaded.");
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const resources = useMemo(() => [...new Map([...published, ...seeds].map((resource) => [resource.id, resource])).values()], [published]);
  return <Context.Provider value={{ resources, entries, session, error, refresh }}>{children}</Context.Provider>;
}
export function useResourceData() {
  const value = useContext(Context);
  if (!value) throw new Error("ResourceDataProvider is missing.");
  return value;
}
