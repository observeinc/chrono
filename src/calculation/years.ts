import { DateTime } from "luxon";
import { ReferenceWithTimezone } from "../results";

/**
 * Find the most likely year, from a raw number. For example:
 * 1997 => 1997
 * 97 => 1997
 * 12 => 2012
 */
export function findMostLikelyADYear(yearNumber: number): number {
  if (yearNumber < 100) {
    yearNumber = yearNumber > 50 ? yearNumber + 1900 : yearNumber + 2000;
  }

  return yearNumber;
}

export function findYearClosestToReference(
  reference: ReferenceWithTimezone,
  day: number,
  month: number
): number {
  //Find the most appropriated year
  const referenceMoment = DateTime.fromJSDate(reference.instant, {
    zone: reference.zone,
  });
  let dateMoment = referenceMoment;
  dateMoment = dateMoment.set({ month: month });
  dateMoment = dateMoment.set({ day: day });
  dateMoment = dateMoment.set({ year: referenceMoment.year });

  const nextYear = dateMoment.plus({ year: 1 });
  const lastYear = dateMoment.plus({ year: -1 });
  if (
    Math.abs(nextYear.diff(referenceMoment).milliseconds) <
    Math.abs(dateMoment.diff(referenceMoment).milliseconds)
  ) {
    dateMoment = nextYear;
  } else if (
    Math.abs(lastYear.diff(referenceMoment).milliseconds) <
    Math.abs(dateMoment.diff(referenceMoment).milliseconds)
  ) {
    dateMoment = lastYear;
  }

  return dateMoment.year;
}
