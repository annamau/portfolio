"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Journal.module.css";
export default function JournalChart({ postId, name }: { postId?: string; name: string }) {
  const frame = useRef<HTMLIFrameElement>(null); const [height, setHeight] = useState(600);
  useEffect(() => {
    function resize(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || !event.data || event.data.type !== "journal-chart-size" || !Number.isFinite(event.data.height)) return;
      setHeight(Math.max(200, Math.min(1600, Math.ceil(event.data.height))));
    }
    window.addEventListener("message", resize); return () => window.removeEventListener("message", resize);
  }, []);
  if (!postId) return null;
  const src = `/api/resources/journal/charts/${encodeURIComponent(postId)}/${encodeURIComponent(name)}`;
  return <iframe ref={frame} className={styles.chartFrame} style={{ height }} src={src} title={`Diagram: ${name.replaceAll("-", " ")}`} sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer" onLoad={() => frame.current?.contentWindow?.postMessage({ type: "journal-chart-measure" }, "*")}/>;
}
