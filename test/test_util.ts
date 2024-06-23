import {
  ParsedComponents,
  ParsedResult,
  ParsingOption,
  ParsingReference,
} from "../src";
import { BufferedDebugHandler } from "../src/debugging";

interface ChronoLike {
  parse(
    text: string,
    reference?: ParsingReference | Date,
    option?: ParsingOption
  ): ParsedResult[];
}

type CheckResult = (p: ParsedResult, text: string) => void;

export function testSingleCase(
  chrono: ChronoLike,
  text: string,
  checkResult?: CheckResult
): void;
export function testSingleCase(
  chrono: ChronoLike,
  text: string,
  referenceDateOrCheckResult?: ParsingReference | Date | CheckResult,
  checkResult?: CheckResult
): void;
export function testSingleCase(
  chrono: ChronoLike,
  text: string,
  referenceDateOrCheckResult?: ParsingReference | Date | CheckResult,
  optionOrCheckResult?: ParsingOption | CheckResult,
  checkResult?: CheckResult
): void;
export function testSingleCase(
  chrono: ChronoLike,
  text: string,
  referenceDateOrCheckResult?: ParsingReference | Date | CheckResult,
  optionOrCheckResult?: ParsingOption | CheckResult,
  checkResult?: CheckResult
): void {
  if (checkResult === undefined && typeof optionOrCheckResult === "function") {
    checkResult = optionOrCheckResult;
    optionOrCheckResult = undefined;
  }

  if (
    optionOrCheckResult === undefined &&
    typeof referenceDateOrCheckResult === "function"
  ) {
    checkResult = referenceDateOrCheckResult;
    referenceDateOrCheckResult = undefined;
  }

  const debugHandler = new BufferedDebugHandler();
  optionOrCheckResult =
    (optionOrCheckResult as ParsingOption | undefined) ?? {};
  optionOrCheckResult.debug = debugHandler;

  try {
    const results = chrono.parse(
      text,
      referenceDateOrCheckResult as Date,
      optionOrCheckResult
    );
    expect(results).toBeSingleOnText(text);
    if (checkResult) {
      checkResult(results[0]!, text);
    }
  } catch (error) {
    if (error instanceof Error) {
      debugHandler.executeBufferedBlocks();
      error.stack = error.stack?.replace(/[^\n]*at .*test_util.*\n/g, "");
      throw error;
    }
  }
}

export function testWithExpectedDate(
  chrono: ChronoLike,
  text: string,
  expectedDate: Date
) {
  testSingleCase(chrono, text, (result) => {
    expect(result.start).toBeDate(expectedDate);
  });
}

export function testUnexpectedResult(
  chrono: ChronoLike,
  text: string,
  referenceDate?: Date,
  options?: ParsingOption
) {
  const debugHandler = new BufferedDebugHandler();
  options = options ?? {};
  options.debug = debugHandler;

  try {
    const results = chrono.parse(text, referenceDate, options);
    expect(results).toHaveLength(0);
  } catch (error) {
    if (error instanceof Error) {
      debugHandler.executeBufferedBlocks();
      error.stack = error.stack?.replace(/[^\n]*at .*test_util.*\n/g, "");
      throw error;
    }
  }
}

export function measureMilliSec(block: () => void): number {
  const startTime = new Date().getMilliseconds();
  block();
  const endTime = new Date().getMilliseconds();
  return endTime - startTime;
}

// --------------------------------------------------

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // noinspection JSUnusedGlobalSymbols
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeDate(date: Date): CustomMatcherResult;
      toBeSingleOnText(text: string): CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeDate(resultOrComponent: ParsedResult | ParsedComponents, date: Date) {
    if (typeof resultOrComponent.date !== "function") {
      return {
        message: () =>
          `${resultOrComponent} is not a ParsedResult or ParsedComponent`,
        pass: false,
      };
    }

    const actualDate = resultOrComponent.date();
    const actualTime = actualDate.getTime();
    const expectedTime = date.getTime();
    return {
      message: () =>
        `Expected date to be: ${date} Received: ${actualDate} (${resultOrComponent})`,
      pass: actualTime === expectedTime,
    };
  },

  toBeSingleOnText(results: ParsedResult[], text) {
    if (results.length === 1) {
      return {
        message: () => `Got single result from '${text}'`,
        pass: true,
      };
    }

    return {
      message: () =>
        `Got ${results.length} results from '${text}'\n${results
          .map((result) => JSON.stringify(result))
          .join("\n")}`,
      pass: false,
    };
  },
});
