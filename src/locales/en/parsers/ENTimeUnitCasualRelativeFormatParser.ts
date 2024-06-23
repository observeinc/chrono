import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents } from "../../../results";
import { reverseTimeUnits } from "../../../utils/timeunits";
import {
  TIME_UNITS_NO_ABBR_PATTERN,
  TIME_UNITS_PATTERN,
  parseTimeUnits,
} from "../constants";

const PATTERN = new RegExp(
  `(this|last|past|next|after|\\+|-)\\s*(${TIME_UNITS_PATTERN})(?=\\W|$)`,
  "i"
);
const PATTERN_NO_ABBR = new RegExp(
  `(this|last|past|next|after|\\+|-)\\s*(${TIME_UNITS_NO_ABBR_PATTERN})(?=\\W|$)`,
  "i"
);

export default class ENTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
  constructor(private allowAbbreviations = true) {
    super();
  }

  innerPattern(): RegExp {
    return this.allowAbbreviations ? PATTERN : PATTERN_NO_ABBR;
  }

  innerExtract(
    context: ParsingContext,
    match: RegExpMatchArray
  ): ParsingComponents {
    const prefix = match[1]!.toLowerCase();
    let timeUnits = parseTimeUnits(match[2]!);
    switch (prefix) {
      case "last":
      case "past":
      case "-": {
        timeUnits = reverseTimeUnits(timeUnits);
        break;
      }
    }

    return ParsingComponents.createRelativeFromReference(
      context.reference,
      timeUnits
    );
  }
}
