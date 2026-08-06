import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * Local re-exports so the checkout modules import their domain types from one
 * place rather than reaching across into three content files.
 */
export type { StateSlug } from "@/content/types";
export type WeaveRegionLike = WeaveRegion;
