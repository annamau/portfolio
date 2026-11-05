import Image from "next/image";
import { journalBlocks, journalInline } from "@/lib/journal/format";
import type { JournalInline } from "@/lib/journal/format";
import JournalSpoiler from "./JournalSpoiler";
import JournalChart from "./JournalChart";
import styles from "./Journal.module.css";
function Inline({ tokens }: { tokens: JournalInline[] }) {
  return tokens.map((token, index) => token.type === "spoiler" ? <JournalSpoiler key={index}><Inline tokens={journalInline(token.text)}/></JournalSpoiler> : token.type === "link" ? <a key={index} href={token.href} target="_blank" rel="noopener noreferrer">{token.text}</a> : <span key={index}>{token.text}</span>);
}
export default function JournalBody({ body, postId }: { body: string; postId?: string }) {
  return <div className={styles.prose}>{journalBlocks(body).map((block, index) => {
    if (block.type === "image") return <figure key={index} className={styles.figure}><Image src={block.src} alt={block.alt} width={1200} height={900} unoptimized/><figcaption><Inline tokens={block.caption}/></figcaption></figure>;
    if (block.type === "chart") return <figure key={index} className={styles.figure}><JournalChart postId={postId} name={block.name}/><figcaption><Inline tokens={block.caption}/></figcaption></figure>;
    if (block.type === "list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><Inline tokens={item}/></li>)}</ul>;
    if (block.type === "heading") return <h2 key={index}><Inline tokens={block.content}/></h2>;
    if (block.type === "quote") return <blockquote key={index}><Inline tokens={block.content}/></blockquote>;
    return <p key={index}><Inline tokens={block.content}/></p>;
  })}</div>;
}
