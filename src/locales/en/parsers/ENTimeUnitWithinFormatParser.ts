import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents } from "../../../results";
import {
  TIME_UNITS_NO_ABBR_PATTERN,
  TIME_UNITS_PATTERN,
  parseTimeUnits,
} from "../constants";

const PATTERN_WITH_OPTIONAL_PREFIX = new RegExp(
  `(?:(?:within|in|for)\\s*)?` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN})(?=\\W|$)`,
  "i"
);

const PATTERN_WITH_PREFIX = new RegExp(
  `(?:within|in|for)\\s*` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN})(?=\\W|$)`,
  "i"
);

const PATTERN_WITH_PREFIX_STRICT = new RegExp(
  `(?:within|in|for)\\s*` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_NO_ABBR_PATTERN})(?=\\W|$)`,
  "i"
);

export default class ENTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
  constructor(private strictMode: boolean) {
    super();
  }

  innerPattern(context: ParsingContext): RegExp {
    if (this.strictMode) {
      return PATTERN_WITH_PREFIX_STRICT;
    }
    return context.option.forwardDate
      ? PATTERN_WITH_OPTIONAL_PREFIX
      : PATTERN_WITH_PREFIX;
  }

  innerExtract(context: ParsingContext, match: RegExpMatchArray) {
    // Exclude "for the unit" phases, e.g. "for the year"
    if (/^for\s*the\s*\w+/.test(match[0])) {
      return undefined;
    }

    const timeUnits = parseTimeUnits(match[1]!);
    return ParsingComponents.createRelativeFromReference(
      context.reference,
      timeUnits
    );
  }
}
