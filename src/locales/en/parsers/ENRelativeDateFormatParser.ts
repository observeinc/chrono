import { TIME_UNIT_DICTIONARY } from "../constants";
import { ParsingContext } from "../../../chrono";
import { ParsingComponents } from "../../../results";
import { DateTime } from "luxon";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { matchAnyPattern } from "../../../utils/pattern";

const PATTERN = new RegExp(
    `(this|last|past|next|after\\s*this)\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY)})(?=\\s*)` + "(?=\\W|$)",
    "i"
);

const MODIFIER_WORD_GROUP = 1;
const RELATIVE_WORD_GROUP = 2;

export default class ENRelativeDateFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(): RegExp {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray): ParsingComponents {
        const modifier = match[MODIFIER_WORD_GROUP].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY[unitWord];

        if (modifier == "next" || modifier.startsWith("after")) {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }

        if (modifier == "last" || modifier == "past") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }

        const components = context.createParsingComponents();
        let date = DateTime.fromJSDate(context.reference.instant, { zone: context.reference.timezone });

        // This week
        if (unitWord.match(/week/i)) {
            date = date.plus({ day: -(date.weekday - 1) });
            components.imply("day", date.day);
            components.imply("month", date.month);
            components.imply("year", date.year);
        }

        // This month
        else if (unitWord.match(/month/i)) {
            date = date.plus({ day: -date.day + 1 });
            components.imply("day", date.day);
            components.assign("year", date.year);
            components.assign("month", date.month);
        }

        // This year
        else if (unitWord.match(/year/i)) {
            date = date.plus({ day: -date.day + 1 });
            date = date.plus({ month: -date.month });

            components.imply("day", date.day);
            components.imply("month", date.month);
            components.assign("year", date.year);
        }

        return components;
    }
}
