/*
  
*/

import { ParsingResult } from "../../results";
import { MergingRefiner } from "../abstractRefiners";

export default abstract class AbstractMergeDateRangeRefiner extends MergingRefiner {
    abstract patternBetween(): RegExp;

    shouldMergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): boolean {
        return !currentResult.end && !nextResult.end && textBetween.match(this.patternBetween()) != null;
    }

    mergeResults(textBetween: string, fromResult: ParsingResult, toResult: ParsingResult): ParsingResult {
        if (!fromResult.start.isOnlyWeekdayComponent() && !toResult.start.isOnlyWeekdayComponent()) {
            toResult.start.getCertainComponents().forEach((key) => {
                if (!fromResult.start.isCertain(key)) {
                    fromResult.start.imply(key, toResult.start.get(key));
                }
            });

            fromResult.start.getCertainComponents().forEach((key) => {
                if (!toResult.start.isCertain(key)) {
                    toResult.start.imply(key, fromResult.start.get(key));
                }
            });
        }

        if (fromResult.start.date().getTime() > toResult.start.date().getTime()) {
            let fromMoment = fromResult.start.luxon();
            let toMoment = toResult.start.luxon();
            if (toResult.start.isOnlyWeekdayComponent() && toMoment.plus({ days: 7 }) > fromMoment) {
                toMoment = toMoment.plus({ days: 7 });
                toResult.start.imply("day", toMoment.day);
                toResult.start.imply("month", toMoment.month);
                toResult.start.imply("year", toMoment.year);
            } else if (fromResult.start.isOnlyWeekdayComponent() && fromMoment.plus({ days: -7 }) < toMoment) {
                fromMoment = fromMoment.plus({ days: -7 });
                fromResult.start.imply("day", fromMoment.day);
                fromResult.start.imply("month", fromMoment.month);
                fromResult.start.imply("year", fromMoment.year);
            } else if (toResult.start.isDateWithUnknownYear() && toMoment.plus({ year: 1 }) > fromMoment) {
                toMoment = toMoment.plus({ year: 1 });
                toResult.start.imply("year", toMoment.year);
            } else if (fromResult.start.isDateWithUnknownYear() && fromMoment.plus({ year: -1 }) < toMoment) {
                fromMoment = fromMoment.plus({ year: -1 });
                fromResult.start.imply("year", fromMoment.year);
            } else {
                [toResult, fromResult] = [fromResult, toResult];
            }
        }

        const result = fromResult.clone();
        result.start = fromResult.start;
        result.end = toResult.start;
        result.index = Math.min(fromResult.index, toResult.index);
        if (fromResult.index < toResult.index) {
            result.text = fromResult.text + textBetween + toResult.text;
        } else {
            result.text = toResult.text + textBetween + fromResult.text;
        }

        return result;
    }
}
