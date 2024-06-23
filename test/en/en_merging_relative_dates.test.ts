import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

test("Test - Single Expression", function () {
  testSingleCase(
    chrono.casual,
    "2 months before 02/02",
    new Date(2022, 2 - 1, 2),
    (result) => {
      expect(result.text).toBe("2 months before 02/02");

      expect(result.start).not.toBeUndefined();
      expect(result.start.get("year")).toBe(2021);
      expect(result.start.get("month")).toBe(12);
      expect(result.start.get("day")).toBe(2);

      expect(result.start.isCertain("day")).toBe(false);
      expect(result.start.isCertain("month")).toBe(true);
      expect(result.start.isCertain("year")).toBe(true);

      expect(result.start).toBeDate(new Date(2021, 12 - 1, 2, 12));
    }
  );
});
