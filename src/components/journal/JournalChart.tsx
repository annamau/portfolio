import styles from "./Journal.module.css";
export default function JournalChart({ postId, name }: { postId?: string; name: string }) {
  if (!postId) return <p>{name.replaceAll("-", " ")}</p>;
  const src = `/api/resources/journal/charts/${encodeURIComponent(postId)}/${encodeURIComponent(name)}`;
  return <><iframe className={styles.chartFrame} src={src} title={`Interactive figure: ${name.replaceAll("-", " ")}`} sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer"/><a className={styles.figureLink} href={src} target="_blank" rel="noopener noreferrer">Open interactive figure ↗</a></>;
}
