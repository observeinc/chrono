/*

*/

import { mergeDateTimeResult } from "../../calculation/mergingCalculation";
import { ParsingResult } from "../../results";
import { MergingRefiner } from "../abstractRefiners";

export default abstract class AbstractMergeDateTimeRefiner extends MergingRefiner {
  abstract patternBetween(): RegExp;

  shouldMergeResults(
    textBetween: string,
    currentResult: ParsingResult,
    nextResult: ParsingResult
  ): boolean {
    return (
      ((currentResult.start.isOnlyDate() && nextResult.start.isOnlyTime()) ||
        (nextResult.start.isOnlyDate() && currentResult.start.isOnlyTime())) &&
      textBetween.match(this.patternBetween()) !== null
    );
  }

  mergeResults(
    textBetween: string,
    currentResult: ParsingResult,
    nextResult: ParsingResult
  ): ParsingResult {
    const result = currentResult.start.isOnlyDate()
      ? mergeDateTimeResult(currentResult, nextResult)
      : mergeDateTimeResult(nextResult, currentResult);

    result.index = currentResult.index;
    result.text = currentResult.text + textBetween + nextResult.text;
    return result;
  }
}
