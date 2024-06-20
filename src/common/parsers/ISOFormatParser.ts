import { ParsingContext } from "../../chrono";
import { Component } from "../../types";
import { AbstractParserWithWordBoundaryChecking } from "./AbstractParserWithWordBoundary";

// ISO 8601
// http://www.w3.org/TR/NOTE-datetime
// - YYYY-MM-DD
// - YYYY-MM-DDThh:mmTZD
// - YYYY-MM-DDThh:mm:ssTZD
// - YYYY-MM-DDThh:mm:ss.sTZD
// - TZD = (Z or +hh:mm or -hh:mm)

// prettier-ignore
const PATTERN = new RegExp(
    String.raw`([0-9]{4})\-([0-9]{1,2})\-([0-9]{1,2})` +
    "(?:T" + //..
        "([0-9]{1,2}):([0-9]{1,2})" + // hh:mm
        "(?:" +
            String.raw`:([0-9]{1,2})(?:\.(\d{1,4}))?` +
        ")?" + // :ss.s
        "(?:" +
            String.raw`Z|([+-]\d{2}):?(\d{2})?` +
        ")?" + // TZD (Z or ±hh:mm or ±hhmm or ±hh)
    ")?" +
    String.raw`(?=\W|$)`,
    "i"
);

const YEAR_NUMBER_GROUP = 1;
const MONTH_NUMBER_GROUP = 2;
const DATE_NUMBER_GROUP = 3;
const HOUR_NUMBER_GROUP = 4;
const MINUTE_NUMBER_GROUP = 5;
const SECOND_NUMBER_GROUP = 6;
const MILLISECOND_NUMBER_GROUP = 7;
const TZD_HOUR_OFFSET_GROUP = 8;
const TZD_MINUTE_OFFSET_GROUP = 9;

export default class ISOFormatParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(_: ParsingContext, match: RegExpMatchArray) {
    const components: { [component in Component]?: number } = {};
    components.year = Number.parseInt(match[YEAR_NUMBER_GROUP]!);
    components.month = Number.parseInt(match[MONTH_NUMBER_GROUP]!);
    components.day = Number.parseInt(match[DATE_NUMBER_GROUP]!);

    if (match[HOUR_NUMBER_GROUP] !== undefined) {
      components.hour = Number.parseInt(match[HOUR_NUMBER_GROUP]);
      components.minute = Number.parseInt(match[MINUTE_NUMBER_GROUP]!);

      if (match[SECOND_NUMBER_GROUP] !== undefined) {
        components.second = Number.parseInt(match[SECOND_NUMBER_GROUP]);
      }

      if (match[MILLISECOND_NUMBER_GROUP] !== undefined) {
        components.millisecond = Number.parseInt(
          match[MILLISECOND_NUMBER_GROUP]
        );
      }

      if (match[TZD_HOUR_OFFSET_GROUP] === undefined) {
        components.timezoneOffset = 0;
      } else {
        const hourOffset = Number.parseInt(match[TZD_HOUR_OFFSET_GROUP]);

        let minuteOffset = 0;
        if (match[TZD_MINUTE_OFFSET_GROUP] !== undefined) {
          minuteOffset = Number.parseInt(match[TZD_MINUTE_OFFSET_GROUP]);
        }

        let offset = hourOffset * 60;
        if (offset < 0) {
          offset -= minuteOffset;
        } else {
          offset += minuteOffset;
        }

        components.timezoneOffset = offset;
      }
    }

    return components;
  }
}
