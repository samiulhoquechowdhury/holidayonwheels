/**
 * What a trip's price covers, and what it does not.
 *
 * One list, two consumers: the forty-seven catalogue tours in `tours.ts`,
 * which spread these and append their own extras, and the planner's drafted
 * itinerary, which shows them under the vehicle. A second copy of commercial
 * terms is a second place for them to drift, and the two would be read side
 * by side by the same person comparing a catalogue trip to their own.
 *
 * These are the client's terms, not a description of the software. Changing a
 * line here changes what the business has told someone it will provide, so
 * change it with them rather than to fit a layout.
 */

export const STANDARD_INCLUDES = [
  "All accommodation on a twin-share basis",
  "All ground transport in a private air-conditioned vehicle",
  "An English-speaking guide from the region throughout",
  "All permits, park fees and entry tickets listed in the itinerary",
  "Meals as specified in the day-by-day",
  "Airport and station transfers on arrival and departure days",
  "24-hour on-trip support line",
];

export const STANDARD_EXCLUDES = [
  "Flights to and from the region",
  "Travel insurance, which we require you to hold",
  "Visas for non-Indian nationals",
  "Meals not listed in the itinerary, and all drinks",
  "Camera fees at monasteries and parks where charged separately",
  "Tips for your guide and driver",
  "Anything not explicitly listed as included",
];
