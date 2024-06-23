import {
  Component,
  ParsedComponents,
  ParsedResult,
  ParsingReference,
} from "./types";

import {
  DateTime,
  DateTimeUnit,
  FixedOffsetZone,
  IANAZone,
  SystemZone,
  Zone,
} from "luxon";
import { toTimezoneOffset } from "./timezone";
import {
  assignSimilarDate,
  assignSimilarTime,
  implySimilarTime,
} from "./utils/luxon";

export class ReferenceWithTimezone {
  readonly instant: Date;
  private readonly timezone?: string;
  private readonly timezoneOffset?: number | undefined;

  constructor(input?: ParsingReference | Date) {
    input = input ?? new Date();
    if (input instanceof Date) {
      this.instant = input;
      this.timezone = SystemZone.instance.name;
    } else if ("ianaTimezone" in input) {
      this.instant = input.instant ?? new Date();
      this.timezone = input.ianaTimezone;
    } else if ("timezone" in input) {
      this.instant = input.instant ?? new Date();
      this.timezoneOffset = toTimezoneOffset(input.timezone, this.instant);
    } else {
      this.instant = input.instant ?? new Date();
    }
  }

  /**
   * Returns a JS date (system timezone) with the { year, month, day, hour, minute, second } equal to the reference.
   * The output's instant is NOT the reference's instant when the reference's and system's timezone are different.
   */
  getDateWithAdjustedTimezone() {
    return DateTime.fromJSDate(this.instant).toJSDate();
  }

  // Creates a given zone based on the input, returning the system zone by default
  get zone(): Zone | undefined {
    if (this.timezone !== undefined) {
      return IANAZone.create(this.timezone);
    }
    if (this.timezoneOffset !== undefined) {
      return FixedOffsetZone.instance(this.timezoneOffset);
    }

    return undefined;
  }
}

export class ParsingComponents implements ParsedComponents {
  private knownValues: { [c in Component]?: number };
  private impliedValues: { [c in Component]?: number };
  private reference: ReferenceWithTimezone;
  private _tags = new Set<string>();

  constructor(
    reference: ReferenceWithTimezone,
    knownComponents?: { [c in Component]?: number }
  ) {
    this.reference = reference;
    this.knownValues = {};
    this.impliedValues = {};
    if (knownComponents) {
      for (const key in knownComponents) {
        this.knownValues[key as Component] = knownComponents[key as Component];
      }
    }

    const referenceDateTime = DateTime.fromJSDate(reference.instant, {
      zone: reference.zone,
    });
    this.imply("day", referenceDateTime.day);
    this.imply("month", referenceDateTime.month);
    this.imply("year", referenceDateTime.year);
    this.imply("hour", 12);
    this.imply("minute", 0);
    this.imply("second", 0);
    this.imply("millisecond", 0);
  }

  get(component: Component): number {
    if (component === "timezoneOffset") {
      return (
        this.knownValues[component] ??
        this.impliedValues[component] ??
        this.reference.zone?.offset(this.reference.instant.valueOf())!
      );
    }

    return this.knownValues[component] ?? this.impliedValues[component]!;
  }

  getTimezoneOffset(): number | undefined {
    return this.knownValues.timezoneOffset ?? this.impliedValues.timezoneOffset;
  }

  isCertain(component: Component): boolean {
    return component in this.knownValues;
  }

  getCertainComponents(): Component[] {
    return Object.keys(this.knownValues) as Component[];
  }

  imply(component: Component, value: number): this {
    if (component in this.knownValues) {
      return this;
    }
    this.impliedValues[component] = value;
    return this;
  }

  assign(component: Component, value: number): this {
    this.knownValues[component] = value;
    delete this.impliedValues[component];
    return this;
  }

  delete(component: Component) {
    delete this.knownValues[component];
    delete this.impliedValues[component];
  }

  clone(): ParsingComponents {
    const component = new ParsingComponents(this.reference);
    component.knownValues = {};
    component.impliedValues = {};

    for (const key in this.knownValues) {
      component.knownValues[key as Component] =
        this.knownValues[key as Component];
    }

    for (const key in this.impliedValues) {
      component.impliedValues[key as Component] =
        this.impliedValues[key as Component];
    }

    return component;
  }

  isOnlyDate(): boolean {
    return (
      !this.isCertain("hour") &&
      !this.isCertain("minute") &&
      !this.isCertain("second")
    );
  }

  isOnlyTime(): boolean {
    return (
      !this.isCertain("weekday") &&
      !this.isCertain("day") &&
      !this.isCertain("month")
    );
  }

  isOnlyWeekdayComponent(): boolean {
    return (
      this.isCertain("weekday") &&
      !this.isCertain("day") &&
      !this.isCertain("month")
    );
  }

  isDateWithUnknownYear(): boolean {
    return this.isCertain("month") && !this.isCertain("year");
  }

  isValidDate(): boolean {
    const date = this.luxon();

    if (date.year !== this.get("year")) return false;
    if (date.month !== this.get("month")) return false;
    if (date.day !== this.get("day")) return false;
    if (this.get("hour") !== undefined && date.hour !== this.get("hour"))
      return false;
    if (this.get("minute") !== undefined && date.minute !== this.get("minute"))
      return false;

    return true;
  }

  toString() {
    return `[ParsingComponents {
            tags: ${JSON.stringify([...this._tags].sort())}, 
            knownValues: ${JSON.stringify(this.knownValues)}, 
            impliedValues: ${JSON.stringify(this.impliedValues)}}, 
            reference: ${JSON.stringify(this.reference)}]`;
  }

  luxon() {
    const naiveDateTime = DateTime.local(
      this.get("year"),
      this.get("month"),
      this.get("day"),
      this.get("hour"),
      this.get("minute"),
      this.get("second"),
      this.get("millisecond")
    );

    if (this.isCertain("timezoneOffset")) {
      return naiveDateTime.setZone(
        FixedOffsetZone.instance(this.getTimezoneOffset()!),
        { keepLocalTime: true }
      );
    }

    return naiveDateTime.setZone(this.reference.zone, { keepLocalTime: true });
  }

  date(): Date {
    return this.luxon().toJSDate();
  }

  addTag(tag: string): this {
    this._tags.add(tag);
    return this;
  }

  addTags(tags: string[] | Set<string>): this {
    for (const tag of tags) {
      this._tags.add(tag);
    }
    return this;
  }

  tags(): Set<string> {
    return new Set(this._tags);
  }

  static createRelativeFromReference(
    reference: ReferenceWithTimezone,
    fragments: { [c in DateTimeUnit]?: number }
  ): ParsingComponents {
    let date = DateTime.fromJSDate(reference.instant, {
      zone: reference.zone,
    });
    for (const key in fragments) {
      date = date.plus({ [key]: fragments[key as DateTimeUnit] });
    }

    const components = new ParsingComponents(reference);
    if (fragments.hour || fragments.minute || fragments.second) {
      assignSimilarTime(components, date);
      assignSimilarDate(components, date);
    } else {
      implySimilarTime(components, date);

      if (fragments.day) {
        components.assign("day", date.day);
        components.assign("month", date.month);
        components.assign("year", date.year);
      } else {
        if (fragments.week) {
          components.imply("weekday", date.weekday - 1);
        }

        components.imply("day", date.day);
        if (fragments.month) {
          components.assign("month", date.month);
          components.assign("year", date.year);
        } else {
          components.imply("month", date.month);
          if (fragments.year) {
            components.assign("year", date.year);
          } else {
            components.imply("year", date.year);
          }
        }
      }
    }

    return components;
  }
}

export class ParsingResult implements ParsedResult {
  refDate: Date;
  index: number;
  text: string;

  reference: ReferenceWithTimezone;

  start: ParsingComponents;
  end?: ParsingComponents;

  constructor(
    reference: ReferenceWithTimezone,
    index: number,
    text: string,
    start?: ParsingComponents,
    end?: ParsingComponents
  ) {
    this.reference = reference;
    this.refDate = reference.instant;
    this.index = index;
    this.text = text;
    this.start = start ?? new ParsingComponents(reference);
    this.end = end;
  }

  clone() {
    const result = new ParsingResult(this.reference, this.index, this.text);
    result.start = this.start.clone();
    result.end = this.end?.clone();
    return result;
  }

  date(): Date {
    return this.start.date();
  }

  tags(): Set<string> {
    const combinedTags = new Set<string>(this.start.tags());
    if (this.end) {
      for (const tag of this.end.tags()) {
        combinedTags.add(tag);
      }
    }
    return combinedTags;
  }

  toString() {
    const tags = [...this.tags()].sort();
    return `[ParsingResult {index: ${this.index}, text: '${this.text}', tags: ${JSON.stringify(tags)} ...}]`;
  }
}
