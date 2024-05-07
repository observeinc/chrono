import { DateTimeUnit } from "luxon";
import { ParsingComponents } from "../results";

export type TimeUnits = { [c in DateTimeUnit]?: number };

export function reverseTimeUnits(timeUnits: TimeUnits): TimeUnits {
    const reversed = {};
    for (const key in timeUnits) {
        // noinspection JSUnfilteredForInLoop
        reversed[key] = -timeUnits[key];
    }

    return reversed as TimeUnits;
}

export function addImpliedTimeUnits(components: ParsingComponents, timeUnits: TimeUnits): ParsingComponents {
    const output = components.clone();

    let date = components.luxon();
    for (const key in timeUnits) {
        // noinspection JSUnfilteredForInLoop,TypeScriptValidateTypes
        date = date.plus({ [key]: timeUnits[key] });
    }

    if ("day" in timeUnits || "d" in timeUnits || "week" in timeUnits || "month" in timeUnits || "year" in timeUnits) {
        output.imply("day", date.day);
        output.imply("month", date.month);
        output.imply("year", date.year);
    }

    if ("second" in timeUnits || "minute" in timeUnits || "hour" in timeUnits) {
        output.imply("second", date.second);
        output.imply("minute", date.minute);
        output.imply("hour", date.hour);
    }

    return output;
}
