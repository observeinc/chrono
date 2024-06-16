import { Configuration } from "./chrono";

import ISOFormatParser from "./common/parsers/ISOFormatParser";
import ExtractTimezoneAbbrRefiner from "./common/refiners/ExtractTimezoneAbbrRefiner";
import ExtractTimezoneOffsetRefiner from "./common/refiners/ExtractTimezoneOffsetRefiner";
import MergeWeekdayComponentRefiner from "./common/refiners/MergeWeekdayComponentRefiner";
import OverlapRemovalRefiner from "./common/refiners/OverlapRemovalRefiner";
import UnlikelyFormatFilter from "./common/refiners/UnlikelyFormatFilter";

export function includeCommonConfiguration(
  configuration: Configuration,
  strictMode = false
): Configuration {
  configuration.parsers.unshift(new ISOFormatParser());

  configuration.refiners.unshift(new MergeWeekdayComponentRefiner());
  configuration.refiners.unshift(new ExtractTimezoneOffsetRefiner());
  configuration.refiners.unshift(new OverlapRemovalRefiner());

  // Unlike ExtractTimezoneOffsetRefiner, this refiner relies on knowing both date and time in cases where the tz
  // is ambiguous (in terms of DST/non-DST). It therefore needs to be applied as late as possible in the parsing.
  configuration.refiners.push(
    new ExtractTimezoneAbbrRefiner(),
    new OverlapRemovalRefiner(),
    new UnlikelyFormatFilter(strictMode)
  );
  return configuration;
}
