import { Parser, ParsingContext } from "../../chrono";
import { ParsingComponents, ParsingResult } from "../../results";
import { Component } from "../../types";

/**
 * A parser that checks for word boundary and applying the inner pattern and extraction.
 */
export abstract class AbstractParserWithWordBoundaryChecking implements Parser {
  abstract innerPattern(context: ParsingContext): RegExp;
  abstract innerExtract(
    context: ParsingContext,
    match: RegExpMatchArray
  ):
    | ParsingComponents
    | ParsingResult
    | { [c in Component]?: number }
    | undefined;

  // Overrides this method if there is more efficient way to check for inner pattern change.
  innerPatternHasChange(
    context: ParsingContext,
    currentInnerPattern: RegExp
  ): boolean {
    return this.innerPattern(context) !== currentInnerPattern;
  }

  patternLeftBoundary(): string {
    return `(\\W|^)`;
  }

  private cachedInnerPattern?: RegExp;
  private cachedPattern?: RegExp;

  pattern(context: ParsingContext): RegExp {
    if (
      this.cachedInnerPattern &&
      !this.innerPatternHasChange(context, this.cachedInnerPattern) &&
      this.cachedPattern !== undefined
    ) {
      return this.cachedPattern;
    }
    this.cachedInnerPattern = this.innerPattern(context);
    this.cachedPattern = new RegExp(
      `${this.patternLeftBoundary()}${this.cachedInnerPattern.source}`,
      this.cachedInnerPattern.flags
    );
    return this.cachedPattern;
  }

  extract(context: ParsingContext, match: RegExpMatchArray) {
    const header = match[1] ?? "";
    match.index = match.index! + header.length;
    match[0] = match[0].slice(header.length);
    for (let index = 2; index < match.length; index++) {
      match[index - 1] = match[index]!;
    }

    return this.innerExtract(context, match);
  }
}
