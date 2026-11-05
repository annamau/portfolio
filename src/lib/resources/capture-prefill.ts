import type { ResourceCategory, ResourceKind } from "../../data/resources.ts";

export interface CaptureFields { url: string; name: string; description: string; category: ResourceCategory; kind: ResourceKind; tags: string; image: string }
export interface LinkDetails { name: string; description: string; category?: ResourceCategory; kind?: ResourceKind; tags: string[]; image?: string }
interface CaptureState { fields: CaptureFields; defaults: CaptureFields; edited: Partial<Record<keyof CaptureFields, boolean>> }
type Action = { type: "edit"; field: keyof CaptureFields; value: string } | { type: "prefill"; url: string; details: LinkDetails };
const imported = ["name", "description", "category", "kind", "tags", "image"] as const;

export function captureState(fields: CaptureFields, editing = false): CaptureState {
  return { fields, defaults: fields, edited: { name: !!fields.name, description: !!fields.description, tags: !!fields.tags, category: editing || fields.category !== "ideas", kind: editing, image: !!fields.image } };
}
export function captureReducer(state: CaptureState, action: Action): CaptureState {
  if (action.type === "edit") {
    const fields = { ...state.fields, [action.field]: action.value };
    if (action.field === "url" && action.value.trim() !== state.fields.url.trim()) {
      for (const key of imported) if (!state.edited[key]) Object.assign(fields, { [key]: state.defaults[key] });
    }
    return { ...state, fields, edited: { ...state.edited, [action.field]: true } };
  }
  const urls = state.fields.url.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  if (urls.length !== 1 || urls[0] !== action.url) return state;
  const values = { ...action.details, tags: action.details.tags.join(", ") };
  const fields = { ...state.fields };
  for (const key of imported) if (!state.edited[key] && values[key] !== undefined) Object.assign(fields, { [key]: values[key] });
  return { ...state, fields };
}
