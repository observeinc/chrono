import { ParsingContext } from "../../chrono";
import { ParsingResult } from "../../results";
import { Filter } from "../abstractRefiners";

export default class UnlikelyFormatFilter extends Filter {
  constructor(private strictMode: boolean) {
    super();
  }

  isValid(context: ParsingContext, result: ParsingResult): boolean {
    if (/^\d*$/.test(result.text.replace(" ", ""))) {
      context.debug(() => {
        console.log(`Removing unlikely result '${result.text}'`);
      });

      return false;
    }

    if (!result.start.isValidDate()) {
      context.debug(() => {
        console.log(`Removing invalid result: ${result} (${result.start})`);
      });

      return false;
    }

    if (result.end && !result.end.isValidDate()) {
      context.debug(() => {
        console.log(`Removing invalid result: ${result} (${result.end})`);
      });

      return false;
    }

    if (this.strictMode) {
      return this.isStrictModeValid(context, result);
    }

    return true;
  }

  private isStrictModeValid(context: ParsingContext, result: ParsingResult) {
    if (result.start.isOnlyWeekdayComponent()) {
      context.debug(() => {
        console.log(
          `(Strict) Removing weekday only component: ${result} (${result.end})`
        );
      });

      return false;
    }

    if (
      result.start.isOnlyTime() &&
      (!result.start.isCertain("hour") || !result.start.isCertain("minute"))
    ) {
      context.debug(() => {
        console.log(
          `(Strict) Removing uncertain time component: ${result} (${result.end})`
        );
      });

      return false;
    }

    return true;
  }
}
