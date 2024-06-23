// Map ABBR -> Offset in minute
import { ParsingContext, Refiner } from "../../chrono";
import { ParsingResult } from "../../results";
import { toTimezoneOffset } from "../../timezone";
import { TimezoneAbbrMap } from "../../types";

const TIMEZONE_NAME_PATTERN = new RegExp(
  String.raw`^\s*,?\s*\(?([A-Z]{2,4})\)?(?=\W|$)`,
  "i"
);

export default class ExtractTimezoneAbbrRefiner implements Refiner {
  constructor(private readonly timezoneOverrides?: TimezoneAbbrMap) {}

  refine(context: ParsingContext, results: ParsingResult[]): ParsingResult[] {
    const timezoneOverrides = context.option.timezones ?? {};

    for (const result of results) {
      const suffix = context.text.slice(
        Math.max(0, result.index + result.text.length)
      );
      const match = TIMEZONE_NAME_PATTERN.exec(suffix);
      if (!match) {
        continue;
      }

      const timezoneAbbr = match[1]?.toUpperCase();
      const referenceDate = result.start.date();
      const tzOverrides = { ...this.timezoneOverrides, ...timezoneOverrides };
      const extractedTimezoneOffset = toTimezoneOffset(
        timezoneAbbr,
        referenceDate,
        tzOverrides
      );
      if (extractedTimezoneOffset === undefined) {
        continue;
      }
      context.debug(() => {
        console.log(
          `Extracting timezone: '${timezoneAbbr}' into: ${extractedTimezoneOffset} for: ${result.start}`
        );
      });

      const currentTimezoneOffset = result.start.getTimezoneOffset();
      if (
        currentTimezoneOffset !== undefined &&
        extractedTimezoneOffset !== currentTimezoneOffset
      ) {
        // We may already have extracted the timezone offset e.g. "11 am GMT+0900 (JST)"
        // - if they are equal, we also want to take the abbreviation text into result
        // - if they are not equal, we trust the offset more
        if (result.start.isCertain("timezoneOffset")) {
          continue;
        }

        // This is often because it's relative time with inferred timezone (e.g. in 1 hour, tomorrow)
        // Then, we want to double-check the abbr case (e.g. "GET" not "get")
        if (timezoneAbbr !== match[1]) {
          continue;
        }
      }

      if (
        result.start.isOnlyDate() && // If the time is not explicitly mentioned,
        // Then, we also want to double-check the abbr case (e.g. "GET" not "get")
        timezoneAbbr !== match[1]
      ) {
        continue;
      }

      result.text += match[0];

      if (!result.start.isCertain("timezoneOffset")) {
        result.start.assign("timezoneOffset", extractedTimezoneOffset);
      }

      if (result.end !== undefined && !result.end.isCertain("timezoneOffset")) {
        result.end.assign("timezoneOffset", extractedTimezoneOffset);
      }
    }

    return results;
  }
}
