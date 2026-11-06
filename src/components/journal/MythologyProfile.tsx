import type { MythologyCatalogue, MythologyEntity } from "@/lib/journal/mythology-map";
import type { MythologyComparisonMode } from "@/lib/journal/mythology-comparison";
import { mythologyRole, mythologyStory } from "@/lib/journal/mythology-stories";
import MythologyEmblem from "./MythologyEmblem";
import styles from "./MythologyMap.module.css";

export default function MythologyProfile({ catalogue, mode, entity, expanded = false }: {
  catalogue: MythologyCatalogue; mode: MythologyComparisonMode; entity: MythologyEntity; expanded?: boolean;
}) {
  return <aside className={styles.detail} data-mythology-detail={expanded ? undefined : entity.id} data-fullscreen-profile={expanded ? entity.id : undefined} aria-label="Figure story">
    <div className={styles.detailHeading}>
      <div>
        <h3 aria-live="polite">{entity.name}</h3>
        <p className={styles.domains}>{mythologyRole(entity)}</p>
      </div>
      <svg className={styles.profileEmblem} viewBox="-38 -38 76 76" aria-hidden="true"><MythologyEmblem entity={entity}/></svg>
    </div>
    <p className={styles.shortStory}>{mythologyStory(entity, catalogue, mode).story}</p>
  </aside>;
}
