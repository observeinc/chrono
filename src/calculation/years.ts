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
        if (yearNumber > 50) {
            yearNumber = yearNumber + 1900;
        } else {
            yearNumber = yearNumber + 2000;
        }
    }

    return yearNumber;
}

export function findYearClosestToRef(reference: ReferenceWithTimezone, day: number, month: number): number {
    //Find the most appropriated year
    const refMoment = DateTime.fromJSDate(reference.instant, { zone: reference.timezone });
    let dateMoment = refMoment;
    dateMoment = dateMoment.set({ month: month });
    dateMoment = dateMoment.set({ day: day });
    dateMoment = dateMoment.set({ year: refMoment.year });

    const nextYear = dateMoment.plus({ year: 1 });
    const lastYear = dateMoment.plus({ year: -1 });
    if (Math.abs(nextYear.diff(refMoment).milliseconds) < Math.abs(dateMoment.diff(refMoment).milliseconds)) {
        dateMoment = nextYear;
    } else if (Math.abs(lastYear.diff(refMoment).milliseconds) < Math.abs(dateMoment.diff(refMoment).milliseconds)) {
        dateMoment = lastYear;
    }

    return dateMoment.year;
}
