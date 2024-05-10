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
  Chrono, Meridiem, ParsingComponents, ParsingResult, ReferenceWithTimezone, Weekday, en
};
export type {
  Component, ParsedComponents,
  ParsedResult, Parser, ParsingOption,
  ParsingReference, Refiner
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
