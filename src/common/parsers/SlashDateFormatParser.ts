import {
  findMostLikelyADYear,
  findYearClosestToReference,
} from "../../calculation/years";
import { Parser, ParsingContext } from "../../chrono";
import { ParsingResult } from "../../results";

/**
 * Date format with slash "/" (or dot ".") between numbers.
 * For examples:
 * - 7/10
 * - 7/12/2020
 * - 7.12.2020
 */
const PATTERN = new RegExp(
  String.raw`([^\d]|^)` +
    String.raw`([0-3]{0,1}[0-9]{1})[\/\.\-]([0-3]{0,1}[0-9]{1})` +
    String.raw`(?:[\/\.\-]([0-9]{4}|[0-9]{2}))?` +
    String.raw`(\W|$)`,
  "i"
);

const OPENING_GROUP = 1;
const ENDING_GROUP = 5;

const FIRST_NUMBERS_GROUP = 2;
const SECOND_NUMBERS_GROUP = 3;

const YEAR_GROUP = 4;

export default class SlashDateFormatParser implements Parser {
  groupNumberMonth: number;
  groupNumberDay: number;

  constructor(littleEndian: boolean) {
    this.groupNumberMonth = littleEndian
      ? SECOND_NUMBERS_GROUP
      : FIRST_NUMBERS_GROUP;
    this.groupNumberDay = littleEndian
      ? FIRST_NUMBERS_GROUP
      : SECOND_NUMBERS_GROUP;
  }

  pattern(): RegExp {
    return PATTERN;
  }

  extract(
    context: ParsingContext,
    match: RegExpMatchArray
  ): ParsingResult | undefined {
    // Because of how pattern is executed on remaining text in `chrono.ts`, the character before the match could
    // still be a number (e.g. X[X/YY/ZZ] or XX[/YY/ZZ] or [XX/YY/]ZZ). We want to check and skip them.
    if (
      match[OPENING_GROUP]!.length === 0 &&
      match.index! > 0 &&
      match.index! < context.text.length
    ) {
      const previousChar = context.text[match.index! - 1]!;
      if (previousChar >= "0" && previousChar <= "9") {
        return undefined;
      }
    }

    const index = match.index! + match[OPENING_GROUP]!.length;
    const text = match[0].slice(
      match[OPENING_GROUP]!.length,
      match[OPENING_GROUP]!.length +
        match[0].length -
        match[OPENING_GROUP]!.length -
        match[ENDING_GROUP]!.length
    );

    // wengj9: Actually, we do want dot notation dates
    // '1.12', '1.12.12' is more like a version numbers
    // if (/^\d\.\d$/.test(text) || /^\d(?:\.\d{1,2}){2}\s*$/.test(text)) {
    //   return undefined;
    // }

    // wengj9: MM.dd is ok
    // MM/dd -> OK
    // MM.dd -> NG
    // if (!match[YEAR_GROUP] && !match[0].includes("/")) {
    //   return undefined;
    // }

    const result = context.createParsingResult(index, text);
    let month = Number.parseInt(match[this.groupNumberMonth]!);
    let day = Number.parseInt(match[this.groupNumberDay]!);

    if ((month < 1 || month > 12) && month > 12) {
      if (day >= 1 && day <= 12 && month <= 31) {
        [day, month] = [month, day];
      } else {
        return undefined;
      }
    }

    if (day < 1 || day > 31) {
      return undefined;
    }

    result.start.assign("day", day);
    result.start.assign("month", month);

    if (match[YEAR_GROUP]) {
      const rawYearNumber = Number.parseInt(match[YEAR_GROUP]);
      const year = findMostLikelyADYear(rawYearNumber);
      result.start.assign("year", year);
    } else {
      const year = findYearClosestToReference(context.reference, day, month);
      result.start.imply("year", year);
    }

    return result;
  }
}
