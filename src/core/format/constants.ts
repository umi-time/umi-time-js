/**
 * Compact serialized Umi‑time: umi + seconds with a leading "U".
 * - No date, no segment, no refinement, no longitude.
 */
export const UMI_COMPACT = "Uuuusss";

/**
 * Compact serialized Umi‑time without the leading "U".
 * - Useful when the surrounding system already implies Umi‑time context.
 */
export const UMI_COMPACT_BARE = "uuusss";

/**
 * Extended compact Umi‑time with a colon separator.
 * - More human‑readable variant of UMI_COMPACT.
 */
export const UMI_EXTENDED = "Uuuu:sss";

/**
 * Extended compact Umi‑time without the leading "U".
 * - More human‑readable variant of UMI_COMPACT_BARE.
 */
export const UMI_EXTENDED_BARE = "uuu:sss";

/**
 * Date + compact Umi‑time.
 * - Closest to ISO‑8601 in structure.
 * - Ideal for logs, storage, and system‑to‑system communication.
 */
export const UMI_DATE_TIME = "yyyy-MM-ddUuuusss";

/**
 * Date + extended Umi‑time.
 * - More human‑readable variant of UMI_DATE_TIME.
 */
export const UMI_DATE_TIME_EXT = "yyyy-MM-ddUuuu:sss";

/**
 * Full canonical Umi‑time including segment and refinement suffixes.
 * - Encodes observer‑specific solar context (segment + refinement).
 */
export const UMI_CANONICAL_FULL = "yyyy-MM-ddUuuusssG24+";

/**
 * Full canonical Umi‑time (extended form) including segment and refinement.
 * - More human‑readable variant of UMI_CANONICAL_FULL.
 */
export const UMI_CANONICAL_FULL_EXT = "yyyy-MM-ddUuuu:sssG24+";
