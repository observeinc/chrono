import { findYearClosestToReference } from "../../../calculation/years";
import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { matchAnyPattern } from "../../../utils/pattern";
import {
  MONTH_DICTIONARY,
  ORDINAL_NUMBER_PATTERN,
  YEAR_PATTERN,
  parseOrdinalNumberPattern,
  parseYear,
} from "../constants";

// prettier-ignore
const PATTERN = new RegExp(
    `(${matchAnyPattern(MONTH_DICTIONARY)})` +
        String.raw`(?:-|/|\s*,?\s*)` +
        `(${ORDINAL_NUMBER_PATTERN})(?!\\s*(?:am|pm))\\s*` +
        "(?:" +
            String.raw`(?:to|\-)\s*` +
            `(${ORDINAL_NUMBER_PATTERN})\\s*` +
        ")?" +
        "(?:" +
            `(?:-|/|\\s*,\\s*|\\s+)` +
            `(${YEAR_PATTERN})` +
        ")?" +
        String.raw`(?=\W|$)(?!\:\d)`,
    "i"
);

const MONTH_NAME_GROUP = 1;
const DATE_GROUP = 2;
const DATE_TO_GROUP = 3;
const YEAR_GROUP = 4;

/**
 * The parser for parsing US's date format that begin with month's name.
 *  - January 13
 *  - January 13, 2012
 *  - January 13 - 15, 2012
 * Note: Watch out for:
 *  - January 12:00
 *  - January 12.44
 *  - January 1222344
 *  - January 21 (when shouldSkipYearLikeDate=true)
 */
export default class ENMonthNameMiddleEndianParser extends AbstractParserWithWordBoundaryChecking {
  shouldSkipYearLikeDate: boolean;

  constructor(shouldSkipYearLikeDate: boolean) {
    super();
    this.shouldSkipYearLikeDate = shouldSkipYearLikeDate;
  }

  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(context: ParsingContext, match: RegExpMatchArray) {
    const month = MONTH_DICTIONARY[match[MONTH_NAME_GROUP]!.toLowerCase()]!;
    const day = parseOrdinalNumberPattern(match[DATE_GROUP]!);
    if (day > 31) {
      return;
    }

    // Skip the case where the day looks like a year (ex: January 21)
    if (this.shouldSkipYearLikeDate && 
        !match[DATE_TO_GROUP] &&
        !match[YEAR_GROUP] &&
        /^2[0-5]$/.test(match[DATE_GROUP]!)
      ) {
        return;
      }
    const components = context
      .createParsingComponents({
        day: day,
        month: month,
      })
      .addTag("parser/ENMonthNameMiddleEndianParser");

    if (match[YEAR_GROUP]) {
      const year = parseYear(match[YEAR_GROUP]);
      components.assign("year", year);
    } else {
      const year = findYearClosestToReference(context.reference, day, month);
      components.imply("year", year);
    }
    if (!match[DATE_TO_GROUP]) {
      return components;
    }

    // Text can be 'range' value. Such as 'January 12 - 13, 2012'
    const endDate = parseOrdinalNumberPattern(match[DATE_TO_GROUP]);
    const result = context.createParsingResult(match.index!, match[0]);
    result.start = components;
    result.end = components.clone();
    result.end.assign("day", endDate);

    return result;
  }
}
