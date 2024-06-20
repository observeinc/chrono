import { ParsingContext, Refiner } from "../../chrono";
import { ParsingResult } from "../../results";

const TIMEZONE_OFFSET_PATTERN = new RegExp(
  String.raw`^\s*(?:\(?(?:GMT|UTC)\s?)?([+-])(\d{1,2})(?::?(\d{2}))?\)?`,
  "i"
);
const TIMEZONE_OFFSET_SIGN_GROUP = 1;
const TIMEZONE_OFFSET_HOUR_OFFSET_GROUP = 2;
const TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP = 3;

export default class ExtractTimezoneOffsetRefiner implements Refiner {
  refine(context: ParsingContext, results: ParsingResult[]): ParsingResult[] {
    for (const result of results) {
      if (result.start.isCertain("timezoneOffset")) {
        continue;
      }

      const suffix = context.text.slice(
        Math.max(0, result.index + result.text.length)
      );
      const match = TIMEZONE_OFFSET_PATTERN.exec(suffix);
      if (!match) {
        continue;
      }

      context.debug(() => {
        console.log(`Extracting timezone: '${match[0]}' into : ${result}`);
      });

      const hourOffset = Number.parseInt(
        match[TIMEZONE_OFFSET_HOUR_OFFSET_GROUP]!
      );
      const minuteOffset = Number.parseInt(
        match[TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP] || "0"
      );
      let timezoneOffset = hourOffset * 60 + minuteOffset;
      // No timezones have offsets greater than 14 hours, so disregard this match
      if (timezoneOffset > 14 * 60) {
        continue;
      }
      if (match[TIMEZONE_OFFSET_SIGN_GROUP] === "-") {
        timezoneOffset = -timezoneOffset;
      }

      if (result.end !== undefined) {
        result.end.assign("timezoneOffset", timezoneOffset);
      }

      result.start.assign("timezoneOffset", timezoneOffset);
      result.text += match[0];
    }

    return results;
  }
}
