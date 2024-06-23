import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents } from "../../../results";
import { reverseTimeUnits } from "../../../utils/timeunits";
import {
  parseTimeUnits,
  TIME_UNITS_NO_ABBR_PATTERN,
  TIME_UNITS_PATTERN,
} from "../constants";

const PATTERN = new RegExp(
  `(${TIME_UNITS_PATTERN})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`,
  "i"
);
const STRICT_PATTERN = new RegExp(
  `(${TIME_UNITS_NO_ABBR_PATTERN})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`,
  "i"
);

export default class ENTimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
  constructor(private strictMode: boolean) {
    super();
  }

  innerPattern(): RegExp {
    return this.strictMode ? STRICT_PATTERN : PATTERN;
  }

  innerExtract(context: ParsingContext, match: RegExpMatchArray) {
    const timeUnits = parseTimeUnits(match[1]!);
    const outputTimeUnits = reverseTimeUnits(timeUnits);

    return ParsingComponents.createRelativeFromReference(
      context.reference,
      outputTimeUnits
    );
  }
}
