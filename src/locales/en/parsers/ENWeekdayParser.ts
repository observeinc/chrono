import { ParsingContext } from "../../../chrono";
import { createParsingComponentsAtWeekday } from "../../../common/calculation/weekdays";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents } from "../../../results";
import { matchAnyPattern } from "../../../utils/pattern";
import { WEEKDAY_DICTIONARY } from "../constants";

const PATTERN = new RegExp(
  String.raw`(?:(?:\,|\(|\（)\s*)?` +
    String.raw`(?:on\s*?)?` +
    String.raw`(?:(this|last|past|next)\s*)?` +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY)})` +
    String.raw`(?:\s*(?:\,|\)|\）))?` +
    String.raw`(?:\s*(this|last|past|next)\s*week)?` +
    String.raw`(?=\W|$)`,
  "i"
);

const PREFIX_GROUP = 1;
const WEEKDAY_GROUP = 2;
const POSTFIX_GROUP = 3;

export default class ENWeekdayParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(
    context: ParsingContext,
    match: RegExpMatchArray
  ): ParsingComponents {
    const dayOfWeek = match[WEEKDAY_GROUP]!.toLowerCase();
    const weekday = WEEKDAY_DICTIONARY[dayOfWeek]!;
    const prefix = match[PREFIX_GROUP];
    const postfix = match[POSTFIX_GROUP];
    let modifierWord = prefix || postfix;
    modifierWord = modifierWord ?? "";
    modifierWord = modifierWord.toLowerCase();

    let modifier: "last" | "next" | "this" | undefined;
    switch (modifierWord) {
      case "last":
      case "past": {
        modifier = "last";

        break;
      }
      case "next": {
        modifier = "next";

        break;
      }
      case "this": {
        modifier = "this";

        break;
      }
      // No default
    }

    return createParsingComponentsAtWeekday(
      context.reference,
      weekday,
      modifier
    );
  }
}
