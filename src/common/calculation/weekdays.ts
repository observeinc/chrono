import { ParsingContext } from "../../chrono";
import { ParsingComponents } from "../../results";
import { Weekday } from "../../types";
import { addImpliedTimeUnits } from "../../utils/timeunits";

/**
 * Returns the parsing components at the weekday (considering the modifier). The time and timezone is assume to be
 * similar to the reference.
 * @param reference
 * @param weekday
 * @param modifier "this", "next", "last" modifier word. If empty, returns the weekday closest to the `refDate`.
 */
export function createParsingComponentsAtWeekday(
  context: ParsingContext,
  weekday: Weekday,
  modifier?: "this" | "next" | "last"
): ParsingComponents {
  const referenceDate = context.reference.getDateWithAdjustedTimezone();
  const daysToWeekday = getDaysToWeekday(context, referenceDate, weekday, modifier);

  let components = new ParsingComponents(context.reference);
  components = addImpliedTimeUnits(components, { day: daysToWeekday });
  components.assign("weekday", weekday);

  return components;
}

/**
 * Returns number of days from refDate to the weekday. The refDate date and timezone information is used.
 * @param refDate
 * @param weekday
 * @param modifier "this", "next", "last" modifier word. If empty, returns the weekday closest to the `refDate`.
 */
export function getDaysToWeekday(
  context: ParsingContext,
  referenceDate: Date,
  weekday: Weekday,
  modifier?: "this" | "next" | "last"
): number {
  const referenceWeekday = referenceDate.getDay() as Weekday;
  switch (modifier) {
    case "this": {
      return getDaysForwardToWeekday(referenceDate, weekday);
    }
    case "last": {
      return getBackwardDaysToWeekday(referenceDate, weekday);
    }
    case "next": {
      // From Sunday, the next Sunday is 7 days later.
      // Otherwise, next Mon is 1 days later, next Tues is 2 days later, and so on..., (return enum value)
      if (referenceWeekday === Weekday.SUNDAY) {
        return weekday === Weekday.SUNDAY ? 7 : weekday;
      }
      // From Saturday, the next Saturday is 7 days later, the next Sunday is 8-days later.
      // Otherwise, next Mon is (1 + 1) days later, next Tues is (1 + 2) days later, and so on...,
      // (return, 2 + [enum value] days)
      if (referenceWeekday === Weekday.SATURDAY) {
        if (weekday === Weekday.SATURDAY) return 7;
        if (weekday === Weekday.SUNDAY) return 8;
        return 1 + weekday;
      }
      // From weekdays, next Mon is the following week's Mon, next Tues the following week's Tues, and so on...
      // If the week's weekday already passed (weekday < refWeekday), we simply count forward to next week
      // (similar to 'this'). Otherwise, count forward to this week, then add another 7 days.
      return weekday < referenceWeekday && weekday !== Weekday.SUNDAY
        ? getDaysForwardToWeekday(referenceDate, weekday)
        : getDaysForwardToWeekday(referenceDate, weekday) + 7;
    }
  }
  return getDaysToWeekdayClosest(context, referenceDate, weekday);
}

export function getDaysToWeekdayClosest(
  context: ParsingContext,
  referenceDate: Date,
  weekday: Weekday
): number {

  const backward = getBackwardDaysToWeekday(referenceDate, weekday);
  const forward = getDaysForwardToWeekday(referenceDate, weekday);

  // If forwardDate, always return a date in the future 
  if (context.option.forwardDate) {
    return forward;
  }
  return forward === 0 ? forward : backward;
}

export function getDaysForwardToWeekday(
  referenceDate: Date,
  weekday: Weekday
): number {
  const referenceWeekday = referenceDate.getDay();
  let forwardCount = weekday - referenceWeekday;
  if (forwardCount < 0) {
    forwardCount += 7;
  }
  return forwardCount;
}

export function getBackwardDaysToWeekday(
  referenceDate: Date,
  weekday: Weekday
): number {
  const referenceWeekday = referenceDate.getDay();
  let backwardCount = weekday - referenceWeekday;
  if (backwardCount >= 0) {
    backwardCount -= 7;
  }
  return backwardCount;
}
