export { UmiTime } from "./UmiTime";

export { toDeg } from "./solar/utils/solarMath";
export { toRad } from "./solar/utils/solarMath";
export { utUmiFromDate, solarAltitude } from "./solar/core/solarPosition";
export { getHourAngle } from "./solar/core/hourAngle";

export type { ApproximateValue } from "./core/types/ApproximateValue";
export { UmiTimeError, ParseError } from "./core/utils/errors";

export {
  UMI_COMPACT,
  UMI_COMPACT_BARE,
  UMI_EXTENDED,
  UMI_EXTENDED_BARE,
  UMI_DATE_TIME,
  UMI_DATE_TIME_EXT,
  UMI_CANONICAL_FULL,
  UMI_CANONICAL_FULL_EXT,
} from "./core/format/constants";
