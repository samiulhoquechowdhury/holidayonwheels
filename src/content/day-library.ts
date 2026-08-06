import type { ItineraryDay, MealPlan } from "./types";

/**
 * A library of place-days.
 *
 * Real operators build itineraries by sequencing the same well-understood
 * days — the Kaziranga day is the Kaziranga day whether it sits in a honeymoon
 * or a group departure. Composing from this library keeps forty itineraries
 * consistent and specific rather than forty variations on filler text, and
 * gives one place to correct a fact.
 *
 * `buildItinerary` numbers the days and resolves the final day's stay to null.
 */

type DayTemplate = Omit<ItineraryDay, "day">;

const day = (
  title: string,
  summary: string,
  stay: string | null,
  extra: Partial<Omit<DayTemplate, "title" | "summary" | "stay">> = {},
): DayTemplate => ({
  title,
  summary,
  stay,
  meals: extra.meals ?? "breakfast",
  altitude: extra.altitude,
  distanceKm: extra.distanceKm,
  highlights: extra.highlights ?? [],
});

export const days = {
  /* ---- Assam ----------------------------------------------------------- */
  guwahatiArrive: day(
    "Arrive Guwahati",
    "Met at Lokpriya Gopinath Bordoloi airport and driven into the city. Late afternoon on the Brahmaputra as the light goes, and an evening at Kamakhya if the queue is kind.",
    "Guwahati",
    {
      altitude: 55,
      distanceKm: 25,
      highlights: ["Brahmaputra sunset cruise", "Kamakhya temple"],
    },
  ),
  guwahatiDepart: day(
    "Guwahati and onward",
    "A slow morning, time for Fancy Bazaar or the state museum, and a transfer to the airport for your onward flight.",
    null,
    { meals: "breakfast", distanceKm: 25 },
  ),
  kazirangaTransfer: day(
    "Guwahati to Kaziranga",
    "East along NH-27 through Nagaon, with tea gardens closing in either side of the road. Afternoon free at the lodge before the park briefing.",
    "Kaziranga",
    {
      meals: "full-board",
      distanceKm: 195,
      highlights: ["Tea garden stop at Jakhalabandha"],
    },
  ),
  kazirangaSafari: day(
    "Kaziranga: central and western range",
    "Dawn jeep safari into the Kohora range while the mist is still on the elephant grass — this is when rhino are in the open. A second drive in the western range at Bagori in the afternoon.",
    "Kaziranga",
    {
      meals: "full-board",
      highlights: [
        "Greater one-horned rhinoceros",
        "Wild water buffalo",
        "Eastern swamp deer",
      ],
    },
  ),
  kazirangaEastern: day(
    "Kaziranga: eastern range and Brahmaputra",
    "The eastern range at Agoratoli is the birding range — pelicans, adjutants, and far fewer vehicles. Afternoon on the river bank looking for Gangetic dolphin.",
    "Kaziranga",
    {
      meals: "full-board",
      highlights: ["Agoratoli birding drive", "Gangetic river dolphin"],
    },
  ),
  majuliFerry: day(
    "Kaziranga to Majuli",
    "Onward to Nimati Ghat and across the Brahmaputra by ferry to Majuli. The crossing takes about ninety minutes and is the best hour of the trip for photographs.",
    "Majuli",
    {
      meals: "full-board",
      distanceKm: 130,
      highlights: ["Brahmaputra ferry crossing"],
    },
  ),
  majuliSatras: day(
    "Majuli: the satras",
    "Auniati and Kamalabari satras in the morning for the Vaishnavite monastic tradition, then Samaguri for mask-making with the Goswami family, who have made them for six generations.",
    "Majuli",
    {
      meals: "full-board",
      highlights: ["Samaguri mask workshop", "Evening prayer at Kamalabari"],
    },
  ),
  jorhatTea: day(
    "Majuli to Jorhat tea country",
    "Back across the river and into the tea belt. An afternoon walking a working garden with the manager, through plucking, withering and the tasting room.",
    "Jorhat",
    {
      meals: "full-board",
      distanceKm: 45,
      highlights: ["Working tea estate tour", "Planter's bungalow dinner"],
    },
  ),
  sivasagar: day(
    "Sivasagar: the Ahom capitals",
    "The Ahom kingdom ran Assam for six hundred years and left Talatal Ghar, Rang Ghar and the tank temples behind. Almost nobody stops here.",
    "Jorhat",
    {
      meals: "full-board",
      distanceKm: 110,
      highlights: ["Talatal Ghar", "Rang Ghar amphitheatre", "Sivadol"],
    },
  ),
  manasPark: day(
    "Manas National Park",
    "A tiger reserve on the Bhutan border with a fraction of Kaziranga's traffic. Jeep safari and, water level permitting, a raft down the Manas river.",
    "Manas",
    {
      meals: "full-board",
      distanceKm: 150,
      highlights: ["Golden langur", "Manas river raft", "Bhutan foothills"],
    },
  ),

  /* ---- Meghalaya ------------------------------------------------------- */
  shillongTransfer: day(
    "Guwahati to Shillong",
    "Up into the Khasi hills, with a stop at Umiam lake where the road first opens out. Afternoon in Shillong: Police Bazaar, and Laitlum canyon if the cloud lifts.",
    "Shillong",
    {
      distanceKm: 100,
      altitude: 1496,
      highlights: ["Umiam lake", "Laitlum canyon"],
    },
  ),
  cherrapunji: day(
    "Sohra and the waterfall road",
    "The Sohra plateau: Nohkalikai falling 340 metres into a gorge, the Arwah and Mawsmai caves, and Thangkharang looking straight out over the Bangladesh plain.",
    "Sohra",
    {
      meals: "half-board",
      distanceKm: 55,
      altitude: 1430,
      highlights: ["Nohkalikai falls", "Arwah cave", "Seven Sisters falls"],
    },
  ),
  nongriat: day(
    "Nongriat: the double-decker root bridge",
    "Three thousand steps down to Nongriat, where two ficus root bridges are grown one above the other. Swim in the rock pools, then three thousand steps back. Bring knees.",
    "Sohra",
    {
      meals: "full-board",
      highlights: [
        "Double-decker living root bridge",
        "Rainbow falls",
        "Blue rock pools",
      ],
    },
  ),
  dawkiMawlynnong: day(
    "Dawki and Mawlynnong",
    "The Umngot river at Dawki runs so clear that boats appear to float on air, best before ten in the morning. Then Mawlynnong, which has organised itself into the cleanest village in Asia and rather enjoys saying so.",
    "Shillong",
    {
      distanceKm: 95,
      highlights: ["Umngot river boat", "Mawlynnong", "Riwai root bridge"],
    },
  ),
  mawphlang: day(
    "Mawphlang sacred grove",
    "A forest that has never been cut because Khasi custom forbids removing anything from it, not even a fallen leaf. Walked with a Khasi guide, which is the only way it makes sense.",
    "Shillong",
    {
      distanceKm: 25,
      altitude: 1800,
      highlights: ["Sacred grove walk", "Khasi monoliths"],
    },
  ),

  /* ---- Arunachal Pradesh ----------------------------------------------- */
  bhalukpongTransfer: day(
    "Guwahati to Bhalukpong",
    "Out of Assam and across the Arunachal boundary at Bhalukpong, where permits are checked. The Kameng river runs alongside for the last hour.",
    "Bhalukpong",
    {
      meals: "full-board",
      distanceKm: 250,
      altitude: 213,
      highlights: ["Permit check-post at Bhalukpong", "Kameng river"],
    },
  ),
  dirang: day(
    "Bhalukpong to Dirang",
    "A long climb through Bomdila with the first proper Himalayan view of the trip. Dirang has a hot spring, a yak research centre, and a seventeenth-century stone dzong most people drive past.",
    "Dirang",
    {
      meals: "full-board",
      distanceKm: 140,
      altitude: 1560,
      highlights: ["Bomdila viewpoint", "Dirang dzong", "Sangti valley"],
    },
  ),
  tawangSela: day(
    "Dirang to Tawang over Sela Pass",
    "Sela at 4,170 metres, usually in snow, with Paradise lake just below the top. Down past the Jaswant Garh memorial and into Tawang by evening.",
    "Tawang",
    {
      meals: "full-board",
      distanceKm: 135,
      altitude: 4170,
      highlights: ["Sela Pass", "Paradise lake", "Jaswant Garh"],
    },
  ),
  tawangMonastery: day(
    "Tawang monastery and Bum La",
    "Galden Namgey Lhatse is the largest monastery in India and the second largest anywhere. Afternoon towards Bum La and the high lakes, subject to permits and weather.",
    "Tawang",
    {
      meals: "full-board",
      altitude: 3048,
      highlights: [
        "Tawang monastery",
        "Sangetsar lake",
        "Bum La approach road",
      ],
    },
  ),
  ziroValley: day(
    "Ziro: the Apatani valley",
    "Wet rice and fish farmed in the same field, pine ridges, and Apatani villages at Hong and Hija. A UNESCO tentative-list cultural landscape that still works as farmland.",
    "Ziro",
    {
      meals: "full-board",
      altitude: 1688,
      highlights: [
        "Hong village",
        "Apatani paddy-cum-fish fields",
        "Talley valley edge",
      ],
    },
  ),
  ziroTransfer: day(
    "Into the Ziro valley",
    "North from the Assam plains through Hapoli, climbing steadily through pine into the Apatani plateau. The last hour is the good one.",
    "Ziro",
    {
      meals: "full-board",
      distanceKm: 165,
      altitude: 1688,
      highlights: ["Pine ridge approach"],
    },
  ),
  mechukaValley: day(
    "Mechuka",
    "A wide glacial valley eight hundred kilometres from anywhere, with a four-hundred-year-old Buddhist gompa on the hill and the Siyom running through the middle of it.",
    "Mechuka",
    {
      meals: "full-board",
      altitude: 1829,
      highlights: ["Samten Yongcha gompa", "Siyom river", "Hanging bridge"],
    },
  ),

  /* ---- Nagaland -------------------------------------------------------- */
  kohimaTransfer: day(
    "Dimapur to Kohima",
    "Up from the plains into the Naga hills. Afternoon at the Kohima war cemetery, where the tennis court battle line is still marked in the lawn.",
    "Kohima",
    {
      distanceKm: 75,
      altitude: 1444,
      highlights: ["Kohima war cemetery", "Naga bazaar"],
    },
  ),
  hornbillFestival: day(
    "Hornbill Festival at Kisama",
    "All sixteen tribes in their own morungs across one heritage village: log drums, wrestling, chilli-eating, and a textile display you will not see assembled anywhere else.",
    "Kohima",
    {
      meals: "half-board",
      distanceKm: 12,
      highlights: ["Morung visits", "Log drum ceremony", "Naga night market"],
    },
  ),
  khonoma: day(
    "Khonoma, the green village",
    "An Angami village that banned hunting on its own land in 1998 and now runs eighty square kilometres as a community conservation area. Walked with a village guide, through terraces and the old fort gates.",
    "Khonoma",
    {
      meals: "full-board",
      distanceKm: 20,
      altitude: 1600,
      highlights: ["Khonoma fort", "Alder terraces", "Community forest walk"],
    },
  ),
  dzukou: day(
    "Dzükou valley trek",
    "A hard climb out of Viswema onto a valley floor of dwarf bamboo that reads like a golf course laid over a mountain. Day trek up and back, or overnight in the rest house.",
    "Kohima",
    {
      meals: "full-board",
      altitude: 2452,
      distanceKm: 14,
      highlights: ["Dzükou valley floor", "Dzükou lily in season"],
    },
  ),
  monLongwa: day(
    "Mon and Longwa",
    "Konyak country in the far north. The Angh's house at Longwa sits on the international boundary — half in India, half in Myanmar — and the older men still carry the facial tattoos of the headhunting years.",
    "Mon",
    {
      meals: "full-board",
      distanceKm: 42,
      highlights: ["Longwa village", "Konyak Angh's house", "Border marker"],
    },
  ),

  /* ---- Manipur --------------------------------------------------------- */
  imphalArrive: day(
    "Arrive Imphal",
    "Into Imphal and straight to Ima Keithel, the mothers' market, run entirely by women for roughly five centuries. Afternoon at Kangla fort.",
    "Imphal",
    {
      altitude: 786,
      highlights: ["Ima Keithel", "Kangla fort", "INA memorial"],
    },
  ),
  loktakLake: day(
    "Loktak Lake and Keibul Lamjao",
    "Out to the lake for the phumdis — floating mats of vegetation thick enough to live on — and into Keibul Lamjao, the only floating national park anywhere, to look for the sangai deer.",
    "Loktak",
    {
      meals: "full-board",
      distanceKm: 48,
      highlights: ["Phumdi boat ride", "Sangai deer", "Sendra viewpoint"],
    },
  ),
  andro: day(
    "Andro and the Manipuri crafts",
    "A Scheduled Caste potters' village that still fires without a wheel, then the Loyalakpa shrine and an evening of Manipuri dance in Imphal.",
    "Imphal",
    {
      distanceKm: 27,
      highlights: ["Andro pottery", "Manipuri Ras Leela"],
    },
  ),

  /* ---- Mizoram --------------------------------------------------------- */
  aizawlArrive: day(
    "Arrive Aizawl",
    "Into Lengpui and up onto the ridge. Aizawl runs along a spine at 1,100 metres with the ground falling away on both sides, and the whole city closes on Sunday.",
    "Aizawl",
    {
      altitude: 1132,
      distanceKm: 32,
      highlights: ["Durtlang ridge view", "Bara Bazaar"],
    },
  ),
  reiek: day(
    "Reiek and the Mizo heritage village",
    "A morning climb up Reiek Tlang for a view that on a clear day reaches into Bangladesh, and a reconstructed Mizo village at the base explaining the puanchei weave.",
    "Aizawl",
    {
      meals: "half-board",
      distanceKm: 29,
      altitude: 1465,
      highlights: ["Reiek Tlang summit", "Puanchei weaving demonstration"],
    },
  ),
  phawngpui: day(
    "Phawngpui, the Blue Mountain",
    "Mizoram's high point and a national park of orchid meadows and sheer cliff faces above the Chhimtuipui. A long drive in and worth every hour of it.",
    "Phawngpui",
    {
      meals: "full-board",
      distanceKm: 300,
      altitude: 2157,
      highlights: ["Thlazuang Khamtough cliff", "Blyth's tragopan habitat"],
    },
  ),

  /* ---- Tripura --------------------------------------------------------- */
  agartalaArrive: day(
    "Arrive Agartala",
    "Ujjayanta Palace, built by the Manikya kings in 1901 and now the state museum, and an evening at the Tripura Sundari temple at Udaipur.",
    "Agartala",
    {
      altitude: 12,
      highlights: ["Ujjayanta Palace", "Tripura Sundari temple"],
    },
  ),
  unakoti: day(
    "Unakoti rock reliefs",
    "Shaiva figures carved straight into a hillside somewhere between the seventh and ninth centuries, the largest over nine metres tall, and still not fully explained by anyone.",
    "Unakoti",
    {
      meals: "full-board",
      distanceKm: 178,
      highlights: ["Unakotiswara Kal Bhairava", "Ganesha panels"],
    },
  ),
  neermahal: day(
    "Neermahal water palace",
    "A summer palace built in the middle of Rudrasagar lake in 1930, reached by boat, in a style that cannot decide between Mughal and Gothic and is better for it.",
    "Agartala",
    {
      distanceKm: 53,
      highlights: ["Neermahal boat crossing", "Rudrasagar birdlife"],
    },
  ),

  /* ---- Sikkim ---------------------------------------------------------- */
  gangtokTransfer: day(
    "Bagdogra to Gangtok",
    "Up the Teesta valley, which is loud, green and considerably more dramatic than the map suggests. Evening on MG Marg, which is pedestrian-only and spotless.",
    "Gangtok",
    {
      distanceKm: 125,
      altitude: 1650,
      highlights: ["Teesta valley road", "MG Marg"],
    },
  ),
  gangtokMonasteries: day(
    "Rumtek and the east Sikkim monasteries",
    "Rumtek is the seat of the Karma Kagyu lineage in exile and holds the Golden Stupa. Then Ranka and the Do-Drul chorten, and the Namgyal institute of Tibetology.",
    "Gangtok",
    {
      distanceKm: 48,
      highlights: [
        "Rumtek monastery",
        "Do-Drul chorten",
        "Tibetology institute",
      ],
    },
  ),
  tsomgoNathula: day(
    "Tsomgo lake and Nathu La",
    "A glacial lake at 3,753 metres that freezes solid in winter, and the old Silk Road pass into Tibet at 4,310 metres. Both need permits, which we arrange; Nathu La is closed on Mondays and Tuesdays.",
    "Gangtok",
    {
      distanceKm: 56,
      altitude: 4310,
      highlights: [
        "Tsomgo lake",
        "Nathu La pass",
        "Baba Harbhajan Singh mandir",
      ],
    },
  ),
  lachungYumthang: day(
    "Lachung and the Yumthang valley",
    "North Sikkim proper. Yumthang is the valley of flowers in April and May, and Zero Point at 4,700 metres is as far north as a civilian permit reaches.",
    "Lachung",
    {
      meals: "full-board",
      distanceKm: 118,
      altitude: 4700,
      highlights: ["Yumthang valley", "Zero Point", "Lachung monastery"],
    },
  ),
  gurudongmar: day(
    "Gurudongmar lake",
    "A pre-dawn start to reach 5,430 metres before the wind gets up. One of the highest lakes in the world, and sacred to Buddhists, Sikhs and Hindus alike.",
    "Lachen",
    {
      meals: "full-board",
      distanceKm: 68,
      altitude: 5430,
      highlights: ["Gurudongmar lake", "Thangu valley", "Chopta valley"],
    },
  ),
  pellingKanchenjunga: day(
    "Pelling and the Kanchenjunga face",
    "West Sikkim, where Kanchenjunga fills the window at breakfast if the sky is clear. Pemayangtse monastery, the Rabdentse ruins, and the skywalk if you are that way inclined.",
    "Pelling",
    {
      meals: "half-board",
      distanceKm: 130,
      altitude: 2150,
      highlights: [
        "Kanchenjunga at dawn",
        "Pemayangtse monastery",
        "Rabdentse ruins",
      ],
    },
  ),
  yuksomTrek: day(
    "Yuksom and the Dubdi walk",
    "The first capital of Sikkim, and the trailhead for Goecha La. A half-day walk up to Dubdi, the oldest monastery in the state, through cardamom terraces.",
    "Yuksom",
    {
      meals: "full-board",
      distanceKm: 34,
      altitude: 2100,
      highlights: ["Dubdi monastery", "Norbugang coronation throne"],
    },
  ),

  /* ---- Generic connectors ---------------------------------------------- */
  restDay: day(
    "A day with nothing in it",
    "Deliberately unscheduled. Read, walk, sit somewhere with a view, or ask your guide what they would do — which usually produces the best day of the trip.",
    "As per itinerary",
    { meals: "full-board" },
  ),
  departDimapur: day(
    "Kohima to Dimapur and onward",
    "Down out of the hills to Dimapur for your onward flight or the overnight train.",
    null,
    { distanceKm: 75 },
  ),
  departImphal: day(
    "Imphal and onward",
    "Last of the morning in Imphal, then the airport.",
    null,
    { distanceKm: 8 },
  ),
  departBagdogra: day(
    "Gangtok to Bagdogra and onward",
    "Back down the Teesta to the plains, allowing five hours to the airport because the road does not care about your flight.",
    null,
    { distanceKm: 125 },
  ),
  departAizawl: day(
    "Aizawl and onward",
    "Down to Lengpui for the flight out.",
    null,
    { distanceKm: 32 },
  ),
  departAgartala: day(
    "Agartala and onward",
    "Morning at the Sepahijala sanctuary if the flight is late, then the airport.",
    null,
    { distanceKm: 20 },
  ),
} satisfies Record<string, DayTemplate>;

export type DayKey = keyof typeof days;

/**
 * Numbers a sequence of place-days into a finished itinerary. The last day
 * always resolves its stay to null — you are not sleeping anywhere on the day
 * you fly home.
 */
export function buildItinerary(keys: DayKey[]): ItineraryDay[] {
  return keys.map((key, index) => {
    const template = days[key];
    const isLast = index === keys.length - 1;
    return {
      ...template,
      day: index + 1,
      stay: isLast ? null : template.stay,
      meals: (isLast ? "breakfast" : template.meals) as MealPlan,
      highlights: [...template.highlights],
    };
  });
}
