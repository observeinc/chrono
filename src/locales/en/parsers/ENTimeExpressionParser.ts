import { ParsingContext } from "../../../chrono";
import { AbstractTimeExpressionParser } from "../../../common/parsers/AbstractTimeExpressionParser";
import { ParsingComponents } from "../../../results";
import { Meridiem } from "../../../types";

export default class ENTimeExpressionParser extends AbstractTimeExpressionParser {
  followingPhase(): string {
    return String.raw`\s*(?:\-|\–|\~|\〜|to|until|through|till|\?)\s*`;
  }

  primaryPrefix(): string {
    return String.raw`(?:(?:at|from)\s*)??`;
  }

  override primarySuffix(): string {
    return String.raw`(?:\s*(?:o\W*clock|at\s*night|in\s*the\s*(?:morning|afternoon)))?(?!/)(?=\W|$)`;
  }

  override extractPrimaryTimeComponents(
    context: ParsingContext,
    match: RegExpMatchArray
  ): undefined | ParsingComponents {
    const components = super.extractPrimaryTimeComponents(context, match);
    if (!components) {
      return components;
    }

    if (match[0].endsWith("night")) {
      const hour = components.get("hour");
      if (hour >= 6 && hour < 12) {
        components.assign("hour", components.get("hour") + 12);
        components.assign("meridiem", Meridiem.PM);
      } else if (hour < 6) {
        components.assign("meridiem", Meridiem.AM);
      }
    }

    if (match[0].endsWith("afternoon")) {
      components.assign("meridiem", Meridiem.PM);
      const hour = components.get("hour");
      if (hour >= 0 && hour <= 6) {
        components.assign("hour", components.get("hour") + 12);
      }
    }

    if (match[0].endsWith("morning")) {
      components.assign("meridiem", Meridiem.AM);
      const hour = components.get("hour");
      if (hour < 12) {
        components.assign("hour", components.get("hour"));
      }
    }

    return components.addTag("parser/ENTimeExpressionParser");
  }
}
