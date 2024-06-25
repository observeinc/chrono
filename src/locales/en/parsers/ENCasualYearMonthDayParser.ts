import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { matchAnyPattern } from "../../../utils/pattern";
import { MONTH_DICTIONARY } from "../constants";

/*
    Date format with slash "/" between numbers like ENSlashDateFormatParser,
    but this parser expect year before month and date.
    - YYYY/MM/DD
    - YYYY-MM-DD
    - YYYY.MM.DD
*/
const PATTERN = new RegExp(
  `([0-9]{4})[\\.\\/\\s]` +
    `(?:(${matchAnyPattern(MONTH_DICTIONARY)})|([0-9]{1,2}))[\\.\\/\\s]` +
    `([0-9]{1,2})` +
    String.raw`(?=\W|$)`,
  "i"
);

const YEAR_NUMBER_GROUP = 1;
const MONTH_NAME_GROUP = 2;
const MONTH_NUMBER_GROUP = 3;
const DATE_NUMBER_GROUP = 4;

export default class ENCasualYearMonthDayParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(_: ParsingContext, match: RegExpMatchArray) {
    const month = match[MONTH_NUMBER_GROUP]
      ? Number.parseInt(match[MONTH_NUMBER_GROUP])
      : MONTH_DICTIONARY[match[MONTH_NAME_GROUP]!.toLowerCase()]!;

    if (month < 1 || month > 12) {
      return undefined;
    }

    const year = Number.parseInt(match[YEAR_NUMBER_GROUP]!);
    const day = Number.parseInt(match[DATE_NUMBER_GROUP]!);

    return {
      day: day,
      month: month,
      year: year,
    };
  }
}
