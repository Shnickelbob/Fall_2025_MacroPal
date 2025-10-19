/** 
 * This utility returns the current date in 'YYYY-MM-DD' format
 * based on Eastern Standard Time (EST).
 * It is used to associate user log entries with the correct day.
 * 
 * @author Joseph Allen
 * @version October 19, 2025
 */

import { DateTime } from "luxon";

export default function dateKey() {
  return DateTime.now().setZone("America/New_York").toFormat("yyyy-LL-dd");
}
