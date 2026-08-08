# Media manifest

Everything the client still owes us, where it goes, and what it has to be.

Until a file exists, `Media` draws a deterministic placeholder built from the
region's weave motif at the exact aspect ratio the real image will occupy. That
means **dropping the real files in causes no layout shift and no CLS** — nothing
else has to change.

This is the highest-risk dependency in the design. The hero in particular does
not work with stock footage.

---

## 1. Hero video — highest priority

Configured in `src/config/media.ts`. Set the three paths and it switches on.

| File                           | Spec                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| `public/media/hero-poster.jpg` | 1920×1080, JPEG or AVIF, ≤ 200 KB. **This is the LCP element.** |
| `public/media/hero.mp4`        | 1920×1080, H.264, ≤ **4 MB**, 12–20s seamless loop, no audio    |
| `public/media/hero-mobile.mp4` | 1080×1350 portrait-safe, ≤ 2 MB, shorter cut                    |

Constraints, from the quality floor:

- The video is `muted autoplay playsinline preload="none"` and only attaches
  its source after first paint. Do not change this — it is what keeps the
  poster as the LCP.
- The poster must be a frame from the video, or the switch will be visible.
- Portrait framing matters: over 80% of traffic is mobile, and the subject must
  survive a 1080×1350 crop.

Suggested encode:

```bash
ffmpeg -i source.mov -t 16 -an \
  -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow \
  -movflags +faststart public/media/hero.mp4

ffmpeg -i source.mov -t 10 -an \
  -vf "crop=ih*0.8:ih,scale=1080:-2" -c:v libx264 -crf 28 -preset slow \
  -movflags +faststart public/media/hero-mobile.mp4

ffmpeg -i public/media/hero.mp4 -vframes 1 -q:v 3 public/media/hero-poster.jpg
```

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
| `src/content/tours.ts`            | 47    | 3:2               | One lead image per tour                 |
| `src/content/motorcycle-tours.ts` | 10    | 3:2               | Bikes in the landscape, not posed       |
| `src/content/homestays.ts`        | 12    | 3:2 + 2 interiors | Exterior, a room, and the view          |
| `src/content/events.ts`           | 12    | 3:2               | Crowds and performers                   |
| `src/content/journal.ts`          | 6     | 3:2 and 21:9      | 21:9 for the article hero               |

### Format

- Supply the **original** JPEG/PNG at 2400px on the long edge. `next/image`
  handles AVIF and WebP conversion and sizing — do not pre-optimise.
- No text baked into images.
- Landscape scale is the point of the design. Wide, deep, few subjects.

### Permissions

Several homestay and village images will need the subject's consent, in writing,
particularly in Konyak and Apatani villages. The responsible-travel policy on
this site commits us to that publicly.

---

## 4. Priority order

If footage arrives in stages, this is the order that improves the site fastest:

1. Hero video + poster
2. Eight destination images
3. The six featured tours (`featured: true` in `tours.ts`)
4. The four featured homestays
5. The three featured events
6. Everything else
