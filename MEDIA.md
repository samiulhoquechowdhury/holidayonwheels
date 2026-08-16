# Media manifest

Everything the client still owes us, where it goes, and what it has to be.

Until a file exists, `Media` draws a deterministic placeholder built from the
region's weave motif at the exact aspect ratio the real image will occupy. That
means **dropping the real files in causes no layout shift and no CLS** — nothing
else has to change.

This is the highest-risk dependency in the design. The hero in particular does
not work with stock footage.

---

## 0. Mock assets, and how to remove them

The redesigned home page is currently dressed in **third-party stock** so the
layout can be reviewed before the shoot happens. None of it is Northeast India.
It is temporary and it is deliberately confined to three files:

| File                      | What it holds                                              |
| ------------------------- | ---------------------------------------------------------- |
| `src/config/showcase.ts`  | Every mock URL, grouped by section, with the subject brief |
| `src/lib/image-loader.ts` | Sends resizing to the stock host instead of our optimiser  |
| `next.config.ts`          | The `remotePatterns` allow-list and the loader wiring      |

To retire the mocks:

1. Replace the URLs in `showcase.ts` with paths under `public/media/`, one
   line at a time — each entry's comment says what the frame has to show.
2. When the last remote URL is gone, delete `images.loader`, `loaderFile` and
   `remotePatterns` from `next.config.ts`, and delete `src/lib/image-loader.ts`.
   That hands optimisation back to Next, which is what you want the moment the
   files are ours.
3. Two hero clips are streamed from a remote CDN. Both need real encodes in
   `public/media/` meeting section 1 below:

   | Export     | Where it runs             | Subject needed                                       |
   | ---------- | ------------------------- | ---------------------------------------------------- |
   | `heroFilm` | Home, above the fold      | Cloud through forested ridges, Meghalaya             |
   | `motoFilm` | `/motorcycle-tours`, hero | Rider's-eye over the handlebars on a road that bends |

   `motoFilm` is the only second film on the site and it should stay that way:
   a page that opens with video is making a claim about being worth watching,
   and that claim gets cheaper every time it is repeated.

   Both currently load the same encode on a phone as on a desktop — 5MB on
   the motorcycle page. The `-mobile.mp4` cut in section 1 is not optional
   when the real footage lands.

Nothing else in the app changes: every consumer holds its own aspect ratio, so
the swap causes no layout shift.

---

## 1. Hero reel — highest priority

The hero runs **three chapters**, one at a time, crossfading every seven
seconds. Configured entirely in `src/config/media.ts` — fill in the paths on
each entry of `heroReel` and it switches on. Nothing else changes.

Per chapter, three files:

| File                           | Spec                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `public/media/<id>-poster.jpg` | 1920×1080, JPEG or AVIF, ≤ 200 KB                            |
| `public/media/<id>.mp4`        | 1920×1080, H.264, ≤ **4 MB**, 10–16s seamless loop, no audio |
| `public/media/<id>-mobile.mp4` | 1080×1350 portrait-safe, ≤ 2 MB, shorter cut                 |

The three `<id>` values, and what each chapter is meant to be:

| `id`              | Chapter    | Subject                                            |
| ----------------- | ---------- | -------------------------------------------------- |
| `hero-ridgelines` | Ridgelines | Cloud moving through forested ridges, Meghalaya    |
| `hero-river`      | The river  | The Brahmaputra wide and flat past sandbars, Assam |
| `hero-pass`       | The pass   | A road switching back over a high pass, Arunachal  |

Constraints, from the quality floor:

- **`hero-ridgelines`'s poster loads eagerly; the other two are lazy.** The
  page's LCP element is the headline — text on a flat ground, above the frame
  — so no image is on the critical path at all. Do not reorder the array
  without moving the `priority` expectation with it.
- Every clip is `muted playsinline preload="none"`, and no `<video>` element
  exists in the DOM until after first paint. Do not change this.
- Only the current chapter and the next one are ever mounted, so the reel costs
  one extra fetch rather than three.
- Each poster must be a frame from its own video, or the crossfade into moving
  footage will visibly jump.
- The three should read as one grade. Shot at different times of day is fine;
  colour-graded differently is not — they dissolve into each other.
- **The hero is a framed object, not a full-bleed background.** It sits in the
  wide column with a 24px radius and changes crop by breakpoint: 4:5 on a
  phone, 16:10 from `sm`, 21:9 from `lg`. The subject has to survive all three
  — the 21:9 crop in particular takes the top and bottom out of everything.
- Portrait framing matters: over 80% of traffic is mobile, and the subject must
  survive a 1080×1350 crop.
- Nothing is overlaid on the footage. The headline sits above the frame on
  paper and the chapter control sits below it, so the clips do not need to
  leave dead space for type, and they do not need to be gradable for a scrim.
- **No hard cuts inside a clip.** A cut mid-chapter fights the crossfade
  between chapters and the hero stops reading as film.

Suggested encode, per chapter:

```bash
ID=hero-ridgelines   # then hero-river, hero-pass

ffmpeg -i "$ID.mov" -t 14 -an \
  -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow \
  -movflags +faststart "public/media/$ID.mp4"

ffmpeg -i "$ID.mov" -t 10 -an \
  -vf "crop=ih*0.8:ih,scale=1080:-2" -c:v libx264 -crf 28 -preset slow \
  -movflags +faststart "public/media/$ID-mobile.mp4"

ffmpeg -i "public/media/$ID.mp4" -vframes 1 -q:v 3 \
  "public/media/$ID-poster.jpg"
```

If only one clip ever arrives, fill that chapter in and delete the other two
entries from `heroReel` — the hero drops its chapter control and progress rule
automatically and renders as a single film.

---

## 2. Brand

| File                    | Status                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `public/HOH Logo.png`   | Supplied. 2000×2000 RGB, no alpha, heavy padding. Source.  |
| `public/brand/logo.png` | **In use.** 621×240, transparent, derived from the source. |

The derived file was made from the supplied artwork with:

```sh
magick "public/HOH Logo.png" -alpha set -fuzz 8% \
  -fill none -floodfill +0+0 white       -fill none -floodfill +1999+0 white \
  -fill none -floodfill +0+1999 white    -fill none -floodfill +1999+1999 white \
  -trim +repage -resize x240 -strip PNG32:public/brand/logo.png
```

Flood-filling from the four corners rather than a global white→alpha matters:
the mark has white pictograms _inside_ its black letterforms, and a global
replace would punch holes through them.

Two things still to settle:

- **The wordmark disagrees with the site name.** The artwork reads "Holiday on
  Hill — Northeast India"; `site.name` is "Holidays on Wheels". Whichever is
  right, `site.logo.alt` follows `site.name`, so today the alt text does not
  describe the image.
- **A vector would be better.** The mark is line art with fine detail; at 240px
  tall it is 92kB of PNG doing an SVG's job. If an `.svg` or `.ai` exists, it
  should replace this.

Setting `site.logo.enabled = false` reverts to the typographic wordmark, so a
bad or missing file can never ship as a broken image. `Logo.tsx` is the only
file that references the mark.

---

## 3. Photography

Every content record has an `image?: string` field and a required `heroAlt`
string. Fill in `image` with a path under `public/` and the placeholder is
replaced. The `heroAlt` copy is already written for every record — it describes
the place, not the picture, and should be kept.

| Where                             | Count | Aspect            | Notes                                   |
| --------------------------------- | ----- | ----------------- | --------------------------------------- |
| `src/content/destinations.ts`     | 8     | 4:3 and 4:5       | One per state. Landscape scale matters. |
| `src/content/tours.ts`            | 47    | 4:5 + 3:2 lead    | Cards crop 4:5; the detail lead is 3:2  |
| `src/content/motorcycle-tours.ts` | 10    | 4:5 + 3:2 lead    | Bikes in the landscape, not posed       |
| `src/content/homestays.ts`        | 12    | 4:5 + 2 interiors | Exterior, a room, and the view          |
| `src/content/events.ts`           | 12    | 4:5 + 3:2 lead    | Crowds and performers                   |
| `src/content/journal.ts`          | 6     | 3:2 and 21:9      | 21:9 for the article hero               |

### Format

- Supply the **original** JPEG/PNG at 2400px on the long edge. `next/image`
  handles AVIF and WebP conversion and sizing — do not pre-optimise.
- No text baked into images.
- Landscape scale is the point of the design. Wide, deep, few subjects.
- **Cards crop to 4:5 portrait.** Supply frames that hold a subject in the
  middle three-fifths, or the crop will cut the horizon out of them. Detail
  pages use the same file at 3:2, so both crops have to work.

### Permissions

Several homestay and village images will need the subject's consent, in writing,
particularly in Konyak and Apatani villages. The responsible-travel policy on
this site commits us to that publicly.

---

## 4. Priority order

If footage arrives in stages, this is the order that improves the site fastest:

1. Hero reel — three clips and their posters. `hero-ridgelines` first: it is
   the frame's opening chapter, so it improves the home page on its own even
   if the other two are weeks behind.
2. Eight destination images
3. The six featured tours (`featured: true` in `tours.ts`)
4. The four featured homestays
5. The three featured events
6. Everything else
