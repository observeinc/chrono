/*
    Enforce 'forwardDate' option to on the results. When there are missing component,
    e.g. "March 12-13 (without year)" or "Thursday", the refiner will try to adjust the result
    into the future instead of the past.
*/

import { DateTime } from "luxon";
import { ParsingContext, Refiner } from "../../chrono";
import { ParsingResult } from "../../results";
import { implySimilarDate } from "../../utils/luxon";

export default class ForwardDateRefiner implements Refiner {
  refine(context: ParsingContext, results: ParsingResult[]): ParsingResult[] {
    if (!context.option.forwardDate) {
      return results;
    }

    for (const result of results) {
      let referenceMoment = DateTime.fromJSDate(context.reference.instant);

      if (result.start.isOnlyTime() && referenceMoment > result.start.luxon()) {
        referenceMoment = referenceMoment.plus({ days: 1 });
        implySimilarDate(result.start, referenceMoment);
        if (result.end?.isOnlyTime()) {
          implySimilarDate(result.end, referenceMoment);
          if (result.start.luxon() > result.end.luxon()) {
            referenceMoment = referenceMoment.plus({ days: 1 });
            implySimilarDate(result.end, referenceMoment);
          }
        }
      }

      if (
        result.start.isOnlyWeekdayComponent() &&
        referenceMoment > result.start.luxon()
      ) {
        referenceMoment =
          referenceMoment.day() >= result.start.get("weekday")
            ? referenceMoment.day(result.start.get("weekday") + 7)
            : referenceMoment.day(result.start.get("weekday")!);

        result.start.imply("day", referenceMoment.date());
        result.start.imply("month", referenceMoment.month() + 1);
        result.start.imply("year", referenceMoment.year());
        context.debug(() => {
          console.log(
            `Forward weekly adjusted for ${result} (${result.start})`
          );
        });

        if (result.end?.isOnlyWeekdayComponent()) {
          // Adjust date to the coming week
          referenceMoment =
            referenceMoment.day() > result.end.get("weekday")
              ? referenceMoment.day(result.end.get("weekday") + 7)
              : referenceMoment.day(result.end.get("weekday")!);

          result.end.imply("day", referenceMoment.date());
          result.end.imply("month", referenceMoment.month() + 1);
          result.end.imply("year", referenceMoment.year());
          context.debug(() => {
            console.log(
              `Forward weekly adjusted for ${result} (${result.end})`
            );
          });
        }
      }

      // In case where we know the month, but not which year (e.g. "in December", "25th December"),
      // try move to another year
      if (
        result.start.isDateWithUnknownYear() &&
        referenceMoment > result.start.luxon()
      ) {
        for (
          let index = 0;
          index < 3 && referenceMoment > result.start.luxon();
          index++
        ) {
          result.start.imply("year", result.start.get("year") + 1);
          context.debug(() => {
            console.log(
              `Forward yearly adjusted for ${result} (${result.start})`
            );
          });

          if (result.end && !result.end.isCertain("year")) {
            result.end.imply("year", result.end.get("year") + 1);
            context.debug(() => {
              console.log(
                `Forward yearly adjusted for ${result} (${result.end})`
              );
            });
          }
        }
      }
    }

    return results;
  }
}
