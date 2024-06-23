/**
 * Chrono components for English support (*parsers*, *refiners*, and *configuration*)
 *
 * @module
 */

import { Chrono } from "../../chrono";

import { ParsedResult, ParsingOption, ParsingReference } from "../../types";

import ENDefaultConfiguration from "./configuration";

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
  reference?: ParsingReference | Date,
  option?: ParsingOption
): ParsedResult[] {
  return casual.parse(text, reference, option);
}

/**
 * A shortcut for en.casual.parseDate()
 */
export function parseDate(
  text: string,
  reference?: ParsingReference | Date,
  option?: ParsingOption
): Date | undefined {
  return casual.parseDate(text, reference, option);
}

export { Chrono, type Parser, type Refiner } from "../../chrono";
export {
  ParsingComponents,
  ParsingResult,
  ReferenceWithTimezone,
} from "../../results";
export {
  Meridiem,
  Weekday,
  type Component,
  type ParsedResult,
  type ParsingOption,
  type ParsingReference,
} from "../../types";
