/**
 * Chrono components for English support (*parsers*, *refiners*, and *configuration*)
 *
 * @module
 */

import { Chrono, Parser, Refiner } from "../../chrono";
import {
  ParsingComponents,
  ParsingResult,
  ReferenceWithTimezone,
} from "../../results";
import {
  Component,
  Meridiem,
  ParsedResult,
  ParsingOption,
  ParsingReference,
  Weekday,
} from "../../types";

import ENDefaultConfiguration from "./configuration";

export {
  Chrono,
  Meridiem,
  ParsingComponents,
  ParsingResult,
  ReferenceWithTimezone,
  Weekday,
};
export type {
  Component,
  ParsedResult,
  Parser,
  ParsingOption,
  ParsingReference as ParsingReference,
  Refiner,
};

export const configuration = new ENDefaultConfiguration();

/**
 * Chrono object configured for parsing *casual* English
 */
export const casual = new Chrono(
  configuration.createCasualConfiguration(false)
);

/**
 * Chrono object configured for parsing *strict* English
 */
export const strict = new Chrono(
  configuration.createConfiguration(true, false)
);

/**
 * Chrono object configured for parsing *UK-style* English
 */
export const GB = new Chrono(configuration.createCasualConfiguration(true));

/**
 * A shortcut for en.casual.parse()
 */
export function parse(
  text: string,
  ref?: ParsingReference | Date,
  option?: ParsingOption
): ParsedResult[] {
  return casual.parse(text, ref, option);
}

/**
 * A shortcut for en.casual.parseDate()
 */
export function parseDate(
  text: string,
  ref?: ParsingReference | Date,
  option?: ParsingOption
): Date | undefined {
  return casual.parseDate(text, ref, option);
}
