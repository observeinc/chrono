import { findYearClosestToReference } from "../../../calculation/years";
import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { matchAnyPattern } from "../../../utils/pattern";
import {
  FULL_MONTH_NAME_DICTIONARY,
  MONTH_DICTIONARY,
  YEAR_PATTERN,
  parseYear,
} from "../constants";

const PATTERN = new RegExp(
  `((?:in)\\s*)?` +
    `(${matchAnyPattern(MONTH_DICTIONARY)})` +
    `\\s*` +
    `(?:` +
    `[,-]?\\s*(${YEAR_PATTERN})?` +
    ")?" +
    String.raw`(?=[^\s\w]|\s+[^0-9]|\s+$|$)`,
  "i"
);

const PREFIX_GROUP = 1;
const MONTH_NAME_GROUP = 2;
const YEAR_GROUP = 3;

/**
 * The parser for parsing month name and year.
 * - January, 2012
 * - January 2012
 * - January
 * (in) Jan
 */
export default class ENMonthNameParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(context: ParsingContext, match: RegExpMatchArray) {
    const monthName = match[MONTH_NAME_GROUP]!.toLowerCase();

    // skip some unlikely words "jan", "mar", ..
    if (match[0].length <= 3 && !FULL_MONTH_NAME_DICTIONARY[monthName]) {
      return;
    }

    const result = context.createParsingResult(
      match.index! + (match[PREFIX_GROUP] || "").length,
      match.index! + match[0].length
    );
    result.start.imply("day", 1);
    result.start.addTag("parser/ENMonthNameParser");

    const month = MONTH_DICTIONARY[monthName]!;
    result.start.assign("month", month);

    if (match[YEAR_GROUP]) {
      const year = parseYear(match[YEAR_GROUP]);
      result.start.assign("year", year);
    } else {
      const year = findYearClosestToReference(context.reference, 1, month);
      result.start.imply("year", year);
    }

    return result;
  }
}
