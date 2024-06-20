import { DateTime } from "luxon";
import { ParsingComponents } from "../results";
import { Meridiem } from "../types";

export function assignTheNextDay(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  targetDayJs = targetDayJs.plus({ day: 1 });
  assignSimilarDate(component, targetDayJs);
  implySimilarTime(component, targetDayJs);
}

export function implyTheNextDay(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  targetDayJs = targetDayJs.plus({ day: 1 });
  implySimilarDate(component, targetDayJs);
  implySimilarTime(component, targetDayJs);
}

export function assignSimilarDate(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  component.assign("day", targetDayJs.day);
  component.assign("month", targetDayJs.month);
  component.assign("year", targetDayJs.year);
}

export function assignSimilarTime(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  component.assign("hour", targetDayJs.hour);
  component.assign("minute", targetDayJs.minute);
  component.assign("second", targetDayJs.second);
  component.assign("millisecond", targetDayJs.millisecond);
  if (component.get("hour") < 12) {
    component.assign("meridiem", Meridiem.AM);
  } else {
    component.assign("meridiem", Meridiem.PM);
  }
}

export function implySimilarDate(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  component.imply("day", targetDayJs.day);
  component.imply("month", targetDayJs.month);
  component.imply("year", targetDayJs.year);
}

export function implySimilarTime(
  component: ParsingComponents,
  targetDayJs: DateTime
) {
  component.imply("hour", targetDayJs.hour);
  component.imply("minute", targetDayJs.minute);
  component.imply("second", targetDayJs.second);
  component.imply("millisecond", targetDayJs.millisecond);
}
