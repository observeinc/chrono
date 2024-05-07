import dayjs from "dayjs";
import { ParsingContext } from "../../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingResult } from "../../../../results";
import { WEEKDAY_OFFSET } from "../constants";

const PATTERN = new RegExp(
    "(?<prefix>上|下|这)(?:个)?(?:星期|礼拜|周)(?<weekday>" + Object.keys(WEEKDAY_OFFSET).join("|") + ")"
);

export default class ZHHansRelationWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(): RegExp {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray): ParsingResult {
        const result = context.createParsingResult(match.index, match[0]);

        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined) return null;

        let modifier = null;
        const prefix = match.groups.prefix;

        if (prefix == "上") {
            modifier = "last";
        } else if (prefix == "下") {
            modifier = "next";
        } else if (prefix == "这") {
            modifier = "this";
        }

        let startMoment = dayjs(context.reference.instant);
        let startMomentFixed = false;
        const refOffset = startMoment.day();

        if (modifier == "last" || modifier == "past") {
            startMoment = startMoment.day(offset - 7);
            startMomentFixed = true;
        } else if (modifier == "next") {
            startMoment = startMoment.day(offset + 7);
            startMomentFixed = true;
        } else if (modifier == "this") {
            startMoment = startMoment.day(offset);
        } else {
            if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset - 7);
            } else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset + 7);
            } else {
                startMoment = startMoment.day(offset);
            }
        }

        result.start.assign("weekday", offset);
        if (startMomentFixed) {
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        } else {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }

        return result;
    }
}
