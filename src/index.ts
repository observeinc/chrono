import * as en from "./locales/en";

import { ParsedResult, ParsingOption, ParsingReference } from "./types";

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
  reference?: ParsingReference | Date,
  option?: ParsingOption
): ParsedResult[] {
  return casual.parse(text, reference, option);
}

/**
 * A shortcut for {@link en | chrono.en.casual.parseDate()}
 */
export function parseDate(
  text: string,
  reference?: ParsingReference | Date,
  option?: ParsingOption
): Date | undefined {
  return casual.parseDate(text, reference, option);
}

export { Chrono, type Parser, type Refiner } from "./chrono";
export {
  ParsingComponents,
  ParsingResult,
  ReferenceWithTimezone,
} from "./results";
export {
  type Component,
  Meridiem,
  type ParsedComponents,
  Weekday,
  type ParsedResult,
  type ParsingOption,
  type ParsingReference,
} from "./types";

export * as en from "./locales/en";
