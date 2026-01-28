export type Side = "front" | "back";

export interface FieldConfig {
  /**
   * If 0 < x <= 1, treated as a percentage of image width (from left).
   * If x > 1, treated as an absolute pixel x.
   * Used for left-alignment.
   */
  x: number;
  /**
   * If 0 < y <= 1, treated as a percentage of image height (from top).
   * If y > 1, treated as an absolute pixel y.
   */
  y: number;
  fontSize: number;
  /** CSS-like numeric weight (e.g. 400, 700, 800). */
  fontWeight?: number;
  /** CSS font style (e.g., "normal", "italic"). Defaults to normal if omitted. */
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  side: Side;
}

export const EID_FIELDS: Record<string, FieldConfig> = {
  // Targets: Left aligned, below "Burn BRIGHT".
  // Weights: Bold = 700 or 800. Normal = 400.
  orNumber: {
    x: 0.035, // 3.5% from the left edge
    y: 0.56,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "Arial, sans-serif",
    side: "front",
    color: "#FFFFFF",
  },
  fullName: {
    x: 0.035,
    y: 0.61,
    fontSize: 44,
    fontWeight: 700,
    fontFamily: "Arial, sans-serif",
    side: "front",
    color: "#F2B200",
  },
  programAndYear: {
    x: 0.035,
    y: 0.66,
    fontSize: 20,
    fontWeight: 600,
    fontStyle: "italic",
    fontFamily: "Arial, sans-serif",
    side: "front",
    color: "#FFFFFF",
  },
};
