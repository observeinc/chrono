import * as chrono from "../../src";
import { measureMilliSec } from "../test_util";

test("Test - Benchmarking against whitespace backtracking", () => {
  const time = measureMilliSec(() => {
    const string_ =
      "BGR3                                                                                         " +
      "                                                                                        186          " +
      "                                      days                                                           " +
      "                                                                                                     " +
      "                                                                                                     " +
      "           18                                                hours                                   " +
      "                                                                                                     " +
      "                                                                                                     " +
      "                                   37                                                minutes         " +
      "                                                                                                     " +
      "                                                                                                     " +
      "                                                             01                                      " +
      "          seconds";

    const results = chrono.parse(string_);
    expect(results.length).toBe(0);
  });

  expect(time).toBeLessThan(1000);
});
