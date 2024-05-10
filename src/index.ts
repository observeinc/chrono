import { Chrono, Parser, Refiner } from "./chrono";
import * as en from "./locales/en";
import {
    ParsingComponents,
    ParsingResult,
    ReferenceWithTimezone,
} from "./results";
import {
    Component,
    Meridiem,
    ParsedComponents,
    ParsedResult,
    ParsingOption,
    ParsingReference,
    Weekday,
} from "./types";

export {
    Chrono, Component, Meridiem, ParsedComponents,
    ParsedResult, Parser, ParsingComponents, ParsingOption,
    ParsingReference, ParsingResult, ReferenceWithTimezone, Refiner, Weekday, en
};

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
export function parse(
  text: string,
  ref?: ParsingReference | Date,
  option?: ParsingOption
): ParsedResult[] {
  return casual.parse(text, ref, option);
}

/**
 * A shortcut for {@link en | chrono.en.casual.parseDate()}
 */
export function parseDate(
  text: string,
  ref?: ParsingReference | Date,
  option?: ParsingOption
): Date | null {
  return casual.parseDate(text, ref, option);
}
