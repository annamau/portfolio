import styles from "./Journal.module.css";
export default function JournalBody({ body }: { body: string }) {
  return <div className={styles.prose}>{body.split(/\n\s*\n/).filter(Boolean).map((block, index) => {
    if (/^#{1,3} /.test(block)) return <h2 key={index}>{block.replace(/^#{1,3} /, "")}</h2>;
    if (block.split("\n").every((line) => /^[-*] /.test(line))) return <ul key={index}>{block.split("\n").map((line, item) => <li key={item}>{line.slice(2)}</li>)}</ul>;
    if (block.split("\n").every((line) => /^> ?/.test(line))) return <blockquote key={index}>{block.replace(/^> ?/gm, "")}</blockquote>;
    return <p key={index}>{block}</p>;
  })}</div>;
}
