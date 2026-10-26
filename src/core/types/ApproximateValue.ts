/**
 * Represents a value with an associated uncertainty.
 * Exact value would have an uncertainty of zero.
 */
export interface ApproximateValue {
  value: number;        // central estimate
  uncertainty: number;  // radius of uncertainty
}
