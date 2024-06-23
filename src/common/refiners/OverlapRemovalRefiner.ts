/*
  
*/

import { ParsingContext, Refiner } from "../../chrono";
import { ParsingResult } from "../../results";

export default class OverlapRemovalRefiner implements Refiner {
  refine(context: ParsingContext, results: ParsingResult[]): ParsingResult[] {
    if (results.length < 2) {
      return results;
    }

    const filteredResults = [];

    const previousResult = results.reduce((previousResult, result) => {
      if (result.index >= previousResult.index + previousResult.text.length) {
        filteredResults.push(previousResult);
        return result;
      }

      // If overlap, compare the length and discard the shorter one
      let kept;
      let removed;
      if (result.text.length > previousResult.text.length) {
        kept = result;
        removed = previousResult;
      } else {
        kept = previousResult;
        removed = result;
      }
      context.debug(() => {
        console.log(`${this.constructor.name} remove ${removed} by ${kept}`);
      });
      return kept;
    });

    // The last one
    if (previousResult !== undefined) {
      filteredResults.push(previousResult);
    }

    return filteredResults;
  }
}
