import { DateTime } from "luxon";
import { ParsingComponents } from "../results";
import { Meridiem } from "../types";

export function assignTheNextDay(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  targetDateTime = targetDateTime.plus({ day: 1 });
  assignSimilarDate(component, targetDateTime);
  implySimilarTime(component, targetDateTime);
}

export function implyTheNextDay(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  targetDateTime = targetDateTime.plus({ day: 1 });
  implySimilarDate(component, targetDateTime);
  implySimilarTime(component, targetDateTime);
}

export function assignSimilarDate(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  component.assign("day", targetDateTime.day);
  component.assign("month", targetDateTime.month);
  component.assign("year", targetDateTime.year);
}

export function assignSimilarTime(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  component.assign("hour", targetDateTime.hour);
  component.assign("minute", targetDateTime.minute);
  component.assign("second", targetDateTime.second);
  component.assign("millisecond", targetDateTime.millisecond);
  if (component.get("hour") < 12) {
    component.assign("meridiem", Meridiem.AM);
  } else {
    component.assign("meridiem", Meridiem.PM);
  }
}

export function implySimilarDate(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  component.imply("day", targetDateTime.day);
  component.imply("month", targetDateTime.month);
  component.imply("year", targetDateTime.year);
}

export function implySimilarTime(
  component: ParsingComponents,
  targetDateTime: DateTime
) {
  component.imply("hour", targetDateTime.hour);
  component.imply("minute", targetDateTime.minute);
  component.imply("second", targetDateTime.second);
  component.imply("millisecond", targetDateTime.millisecond);
}
