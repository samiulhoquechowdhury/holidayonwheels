import type { StateSlug } from "@/content/types";

/**
 * Live weather for the eight states.
 *
 * ## A state does not have weather
 *
 * Arunachal Pradesh runs from a hundred metres to seven thousand. Quoting one
 * temperature for it would be worse than quoting none, so every reading here
 * is for a *named place* — the state capital, which is also where almost
 * every trip to that state begins — and the strip says which place it is.
 * That is the difference between a number somebody can act on and a number
 * that is merely true somewhere.
 *
 * ## Licensing — read before launch
 *
 * This uses Open-Meteo. Their free endpoint is **non-commercial only**: "You
 * may only use the free API services for non-commercial purposes." This is a
 * commercial site, so the free endpoint is for development and nothing else.
 *
 * Set `OPEN_METEO_API_KEY` and the code switches to their customer endpoint
 * automatically — no other change. Until that key exists the site is
 * technically outside their terms, which is the client's call to make and
 * not a thing to leave undocumented.
 *
 * ## Why one request
 *
 * Open-Meteo takes comma-separated coordinates and returns an array, so all
 * eight states cost a single call. With a thirty-minute revalidate that is
 * about 48 calls a day for the whole site however much traffic it takes,
 * which sits inside even the free tier's limits by three orders of
 * magnitude.
 */

/**
 * One named place per state — the capital, which is also where almost every
 * trip into that state begins.
 *
 * Meghalaya is the exception: Sohra, not Shillong. Sohra is the wettest
 * inhabited place on earth and the reason most people come to the state, and
 * its rain is nothing like Shillong's fifty kilometres away. Shillong would
 * be the tidier answer and the less useful one.
 */
const POINTS: Record<StateSlug, { place: string; lat: number; lon: number }> = {
  assam: { place: "Guwahati", lat: 26.1445, lon: 91.7362 },
  "arunachal-pradesh": { place: "Itanagar", lat: 27.0844, lon: 93.6053 },
  sikkim: { place: "Gangtok", lat: 27.3314, lon: 88.6138 },
  mizoram: { place: "Aizawl", lat: 23.7271, lon: 92.7176 },
  nagaland: { place: "Kohima", lat: 25.6751, lon: 94.1086 },
  meghalaya: { place: "Sohra", lat: 25.2702, lon: 91.7323 },
  tripura: { place: "Agartala", lat: 23.8315, lon: 91.2868 },
  manipur: { place: "Imphal", lat: 24.817, lon: 93.9368 },
};

export type DayForecast = {
  /** ISO date, in Asia/Kolkata. */
  date: string;
  high: number;
  low: number;
  summary: string;
};

export type StateWeather = {
  place: string;
  /** Right now, rounded — a decimal on a forecast is false precision. */
  temperature: number;
  summary: string;
  days: DayForecast[];
};

/**
 * WMO 4677, grouped into words a traveller packs for.
 *
 * Deliberately coarse, and deliberately short. "Moderate drizzle" and "dense
 * drizzle" are the same decision — take a jacket — and a strip of eight
 * states is read by scanning, not by reading.
 *
 * Every word here fits a forecast cell at 390px without truncating, which is
 * why "Overcast" is "Cloudy" and "Thunderstorms" is "Storms". A word clipped
 * to "Overc…" tells a traveller nothing at all.
 */
function describe(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 2) return "Sunny";
  if (code === 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow";
  return "Storms";
}

type OpenMeteoEntry = {
  current?: { temperature_2m?: number; weather_code?: number };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

/**
 * Every state's weather, or null.
 *
 * Null rather than throwing, and null rather than a placeholder: a weather
 * strip showing invented numbers is worse than a page with no weather on it,
 * and the section that renders this simply does not appear when the upstream
 * is down. A travel page must not fall over because a forecast API did.
 */
export async function getStateWeather(): Promise<Record<
  StateSlug,
  StateWeather
> | null> {
  const slugs = Object.keys(POINTS) as StateSlug[];
  const key = process.env.OPEN_METEO_API_KEY;
  const host = key ? "customer-api.open-meteo.com" : "api.open-meteo.com";

  const url =
    `https://${host}/v1/forecast` +
    `?latitude=${slugs.map((s) => POINTS[s].lat).join(",")}` +
    `&longitude=${slugs.map((s) => POINTS[s].lon).join(",")}` +
    `&current=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=Asia%2FKolkata&forecast_days=4` +
    (key ? `&apikey=${key}` : "");

  try {
    const response = await fetch(url, {
      // Half an hour. A forecast that moves faster than that is noise, and
      // this way the whole site costs about 48 calls a day.
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as
      OpenMeteoEntry[] | OpenMeteoEntry;
    const entries = Array.isArray(payload) ? payload : [payload];
    if (entries.length !== slugs.length) return null;

    const out = {} as Record<StateSlug, StateWeather>;
    slugs.forEach((slug, index) => {
      const entry = entries[index];
      const daily = entry?.daily;
      const temperature = entry?.current?.temperature_2m;
      if (typeof temperature !== "number" || !daily?.time) return;

      out[slug] = {
        place: POINTS[slug].place,
        temperature: Math.round(temperature),
        summary: describe(entry.current?.weather_code ?? 0),
        days: daily.time.slice(0, 4).map((date, i) => ({
          date,
          high: Math.round(daily.temperature_2m_max?.[i] ?? 0),
          low: Math.round(daily.temperature_2m_min?.[i] ?? 0),
          summary: describe(daily.weather_code?.[i] ?? 0),
        })),
      };
    });

    return Object.keys(out).length === slugs.length ? out : null;
  } catch {
    return null;
  }
}
