import * as en from "./locales/en";
import { Chrono, Parser, Refiner } from "./chrono";
import { ParsingResult, ParsingComponents, ReferenceWithTimezone } from "./results";
import { Component, ParsedComponents, ParsedResult, ParsingOption, ParsingReference, Meridiem, Weekday } from "./types";

export { en, Chrono, Parser, Refiner, ParsingResult, ParsingComponents, ReferenceWithTimezone };
export { Component, ParsedComponents, ParsedResult, ParsingOption, ParsingReference, Meridiem, Weekday };

/**
 * A shortcut for {@link en | chrono.en.strict}
 */
export const strict = en.strict;

/**
 * A shortcut for {@link en | chrono.en.casual}
 */
export const casual = en.casual;

/**
 * A shortcut for {@link en | chrono.en.casual.parse()}
 */
export function parse(text: string, ref?: ParsingReference | Date, option?: ParsingOption): ParsedResult[] {
    return casual.parse(text, ref, option);
}

/**
 * A shortcut for {@link en | chrono.en.casual.parseDate()}
 */
export function parseDate(text: string, ref?: ParsingReference | Date, option?: ParsingOption): Date | null {
    return casual.parseDate(text, ref, option);
}
