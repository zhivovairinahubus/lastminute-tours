import OpenAI from "openai";
import { gigaChatComplete, isGigaChatConfigured } from "../../lib/gigachat.js";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface RawTour {
  id: string;
  destination: string;
  country: string;
  city: string;
  hotel: string;
  stars: number;
  departureDate: string;
  returnDate: string;
  nights: number;
  price: number;
  totalPrice: number;
  mealType: string;
  imageUrl: string;
  bookingUrl: string;
  operatorName?: string;
}

const DESTINATION_IMAGES: Record<string, string> = {
  "Турция": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
  "Египет": "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
  "Таиланд": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  "ОАЭ": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  "Греция": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  "Испания": "https://images.unsplash.com/photo-1509840841025-9088d49d7f86?w=800&q=80",
  "Кипр": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
  "Черногория": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Тунис": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80",
  "Мальдивы": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  "Куба": "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=800&q=80",
  "Италия": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  "Грузия": "https://images.unsplash.com/photo-1565008576549-57ee4ae6ef48?w=800&q=80",
  "Израиль": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
  "Индонезия": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80";

const COUNTRY_ISO_TO_RU: Record<string, string> = {
  TR: "Турция", EG: "Египет", TH: "Таиланд", AE: "ОАЭ",
  GR: "Греция", CY: "Кипр", ES: "Испания", ME: "Черногория",
  TN: "Тунис", MV: "Мальдивы", CU: "Куба", IT: "Италия",
  GE: "Грузия", IL: "Израиль", ID: "Индонезия",
};

const COUNTRY_RU_TO_SLUG: Record<string, string> = {
  "Турция": "turkey", "Египет": "egypt", "Таиланд": "thailand",
  "ОАЭ": "uae", "Греция": "greece", "Кипр": "cyprus",
  "Испания": "spain", "Черногория": "montenegro", "Тунис": "tunisia",
  "Мальдивы": "maldives", "Куба": "cuba", "Италия": "italy",
  "Грузия": "georgia", "Израиль": "israel", "Индонезия": "indonesia",
};

const HOTELS_BY_COUNTRY: Record<string, { hotel: string; city: string; stars: number; operator: string; slug: string }[]> = {
  "Турция": [
    { hotel: "Delphin Imperial Lara", city: "Анталья", stars: 5, operator: "Tez Tour", slug: "delphin-imperial-lara" },
    { hotel: "Akka Alinda Hotel", city: "Кемер", stars: 5, operator: "TUI", slug: "akka-alinda-hotel" },
    { hotel: "Bellis Deluxe Hotel", city: "Белек", stars: 5, operator: "Coral Travel", slug: "bellis-deluxe-hotel" },
    { hotel: "Crystal Sunrise Queen", city: "Сиде", stars: 5, operator: "Pegas Touristik", slug: "crystal-sunrise-queen" },
    { hotel: "Club Hotel Sera", city: "Анталья", stars: 5, operator: "Tez Tour", slug: "club-hotel-sera" },
    { hotel: "Rixos Premium Tekirova", city: "Кемер", stars: 5, operator: "TUI", slug: "rixos-premium-tekirova" },
    { hotel: "Selectum Luxury Resort", city: "Белек", stars: 5, operator: "Coral Travel", slug: "selectum-luxury-resort" },
  ],
  "Египет": [
    { hotel: "Hilton Hurghada Plaza", city: "Хургада", stars: 5, operator: "Tez Tour", slug: "hilton-hurghada-plaza" },
    { hotel: "Stella Di Mare Beach", city: "Шарм-эль-Шейх", stars: 5, operator: "Pegas Touristik", slug: "stella-di-mare-beach" },
    { hotel: "Pickalbatros Palace", city: "Хургада", stars: 5, operator: "Coral Travel", slug: "pickalbatros-palace" },
    { hotel: "Jaz Mirabel Beach", city: "Шарм-эль-Шейх", stars: 5, operator: "TUI", slug: "jaz-mirabel-beach" },
    { hotel: "Titanic Palace", city: "Хургада", stars: 5, operator: "Pegas Touristik", slug: "titanic-palace" },
  ],
  "Таиланд": [
    { hotel: "Amari Pattaya", city: "Паттайя", stars: 4, operator: "TUI", slug: "amari-pattaya" },
    { hotel: "Centara Grand Beach", city: "Самуи", stars: 5, operator: "Coral Travel", slug: "centara-grand-beach" },
    { hotel: "Phuket Graceland Resort", city: "Пхукет", stars: 5, operator: "Tez Tour", slug: "phuket-graceland-resort" },
    { hotel: "Holiday Inn Pattaya", city: "Паттайя", stars: 4, operator: "Pegas Touristik", slug: "holiday-inn-pattaya" },
  ],
  "ОАЭ": [
    { hotel: "Jumeirah Beach Hotel", city: "Дубай", stars: 5, operator: "TUI", slug: "jumeirah-beach-hotel" },
    { hotel: "Atlantis The Palm", city: "Дубай", stars: 5, operator: "Tez Tour", slug: "atlantis-the-palm" },
    { hotel: "Rixos Premium Dubai", city: "Дубай", stars: 5, operator: "Coral Travel", slug: "rixos-premium-dubai" },
  ],
  "Греция": [
    { hotel: "Ikos Aria", city: "Родос", stars: 5, operator: "TUI", slug: "ikos-aria" },
    { hotel: "Aldemar Knossos Royal", city: "Крит", stars: 5, operator: "Coral Travel", slug: "aldemar-knossos-royal" },
    { hotel: "Mitsis Alila Resort", city: "Родос", stars: 5, operator: "Pegas Touristik", slug: "mitsis-alila-resort" },
  ],
  "Кипр": [
    { hotel: "Amavi Hotel", city: "Пафос", stars: 5, operator: "TUI", slug: "amavi-hotel" },
    { hotel: "Olympic Lagoon Resort", city: "Айя-Напа", stars: 4, operator: "Coral Travel", slug: "olympic-lagoon-resort" },
  ],
  "Испания": [
    { hotel: "Iberostar Gran Hotel", city: "Тенерифе", stars: 5, operator: "TUI", slug: "iberostar-gran-hotel" },
    { hotel: "Lopesan Costa Meloneras", city: "Гран-Канария", stars: 5, operator: "Coral Travel", slug: "lopesan-costa-meloneras" },
  ],
  "Черногория": [
    { hotel: "Dukley Hotel & Resort", city: "Будва", stars: 5, operator: "Pegas Touristik", slug: "dukley-hotel-resort" },
    { hotel: "Splendid Spa Resort", city: "Бечичи", stars: 5, operator: "TUI", slug: "splendid-spa-resort" },
  ],
  "Тунис": [
    { hotel: "Diar Lemdina", city: "Хаммамет", stars: 5, operator: "Coral Travel", slug: "diar-lemdina" },
    { hotel: "Iberostar Averroes", city: "Хаммамет", stars: 4, operator: "TUI", slug: "iberostar-averroes" },
  ],
  "Грузия": [
    { hotel: "Sheraton Batumi Hotel", city: "Батуми", stars: 5, operator: "Pegas Touristik", slug: "sheraton-batumi" },
    { hotel: "Radisson Blu Hotel Batumi", city: "Батуми", stars: 5, operator: "TUI", slug: "radisson-blu-batumi" },
  ],
  "Индонезия": [
    { hotel: "Ayodya Resort Bali", city: "Бали", stars: 5, operator: "TUI", slug: "ayodya-resort-bali" },
    { hotel: "The Laguna Bali", city: "Бали", stars: 5, operator: "Coral Travel", slug: "the-laguna-bali" },
  ],
  "Мальдивы": [
    { hotel: "Kurumba Maldives", city: "Атолл Северный Мале", stars: 5, operator: "TUI", slug: "kurumba-maldives" },
    { hotel: "Kanuhura Maldives", city: "Атолл Лавияни", stars: 5, operator: "Coral Travel", slug: "kanuhura-maldives" },
  ],
  "Израиль": [
    { hotel: "Dan Eilat Hotel", city: "Эйлат", stars: 5, operator: "Tez Tour", slug: "dan-eilat-hotel" },
    { hotel: "Isrotel Royal Beach", city: "Эйлат", stars: 5, operator: "TUI", slug: "isrotel-royal-beach" },
  ],
};

const MEAL_TYPES = ["Всё включено", "Завтрак и ужин", "Только завтрак", "Без питания", "Ультра всё включено"];

function getDateRange(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function formatDateDDMMYYYY(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function addDaysToISO(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

async function getLevelTravelToken(): Promise<string | null> {
  try {
    const setting = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, "LEVEL_TRAVEL_TOKEN"))
      .limit(1);
    return setting[0]?.value || null;
  } catch {
    return null;
  }
}

function getCityNameEn(cityNameRu: string): string {
  const mapping: Record<string, string> = {
    "Москва": "Moscow",
    "Санкт-Петербург": "Saint Petersburg",
    "Екатеринбург": "Yekaterinburg",
    "Новосибирск": "Novosibirsk",
    "Казань": "Kazan",
    "Нижний Новгород": "Nizhny Novgorod",
    "Челябинск": "Chelyabinsk",
    "Самара": "Samara",
    "Уфа": "Ufa",
    "Ростов-на-Дону": "Rostov-on-Don",
    "Краснодар": "Krasnodar",
    "Пермь": "Perm",
    "Красноярск": "Krasnoyarsk",
    "Воронеж": "Voronezh",
    "Тюмень": "Tyumen",
  };
  return mapping[cityNameRu] || cityNameRu;
}

const SEARCH_COUNTRIES = ["TR", "EG", "TH", "AE", "GR", "CY", "ES", "TN", "GE", "ID"];
const FINAL_STATUSES = new Set(["completed", "no_results", "failed", "cached", "skipped", "all_filtered"]);

async function fetchRealLevelTravelTours(
  token: string,
  departureCityName: string,
  budget: number,
  adults: number
): Promise<RawTour[] | null> {
  try {
    const fromCityEn = getCityNameEn(departureCityName);
    const today = new Date();
    const plus7 = new Date(today.getTime() + 7 * 86400000);
    const plus5 = new Date(today.getTime() + 5 * 86400000);
    const plus17 = new Date(today.getTime() + 17 * 86400000);

    const startDateFrom = formatDateDDMMYYYY(today);
    const startDateTill = formatDateDDMMYYYY(plus7);
    const endDateFrom = formatDateDDMMYYYY(plus5);
    const endDateTill = formatDateDDMMYYYY(plus17);

    const headers = {
      "Authorization": `Token token="${token}"`,
      "Accept": "application/vnd.leveltravel.v3.7",
      "Content-Type": "application/json",
    };

    // 1. Enqueue searches for multiple popular countries in parallel via POST /search/enqueue.
    //    Parameters are sent as query params per the Level.Travel v3.7 API contract.
    const enqueueResults = await Promise.allSettled(
      SEARCH_COUNTRIES.map(async (countryIso) => {
        const params = new URLSearchParams({
          from_city: fromCityEn,
          to_country: countryIso,
          adults: adults.toString(),
          start_date_from: startDateFrom,
          start_date_till: startDateTill,
          end_date_from: endDateFrom,
          end_date_till: endDateTill,
          search_type: "package",
        });
        const resp = await fetch(
          `https://api.level.travel/search/enqueue?${params}`,
          {
            method: "POST",
            headers,
            signal: AbortSignal.timeout(8000),
          }
        );
        if (!resp.ok) return null;
        const data = await resp.json() as { success: boolean; request_id?: string };
        if (!data.success || !data.request_id) return null;
        return { requestId: data.request_id, countryIso };
      })
    );

    const activeSearches = enqueueResults
      .filter((r): r is PromiseFulfilledResult<{ requestId: string; countryIso: string } | null> => r.status === "fulfilled")
      .map(r => r.value)
      .filter((v): v is { requestId: string; countryIso: string } => v !== null);

    if (activeSearches.length === 0) return null;

    // 2. Poll status for all searches (wait max 30s per spec, check every 2s)
    const startTime = Date.now();
    const doneSearches = new Set<string>();

    while (doneSearches.size < activeSearches.length && Date.now() - startTime < 30000) {
      await new Promise(r => setTimeout(r, 2000));

      await Promise.allSettled(
        activeSearches
          .filter(s => !doneSearches.has(s.requestId))
          .map(async (search) => {
            const params = new URLSearchParams({ request_id: search.requestId, show_size: "true" });
            const resp = await fetch(
              `https://api.level.travel/search/status?${params}`,
              { headers, signal: AbortSignal.timeout(5000) }
            );
            if (!resp.ok) { doneSearches.add(search.requestId); return; }
            const data = await resp.json() as { status?: Record<string, string>; success?: boolean };
            if (!data.success || !data.status) { doneSearches.add(search.requestId); return; }
            const allFinal = Object.values(data.status).every(s => FINAL_STATUSES.has(s));
            if (allFinal) doneSearches.add(search.requestId);
          })
      );
    }

    // 3. Fetch hotels for confirmed-complete searches (reduces noisy empty fetches).
    //    Searches that timed out are still included as Level.Travel may have partial results.
    const allTours: RawTour[] = [];
    const searchesToFetch = activeSearches.filter(s => doneSearches.has(s.requestId));
    const searchesWithPartial = activeSearches.filter(s => !doneSearches.has(s.requestId));
    if (searchesWithPartial.length > 0) {
      console.warn(`Level.Travel: ${searchesWithPartial.length} searches still pending after 30s, fetching partial results`);
    }

    await Promise.allSettled(
      [...searchesToFetch, ...searchesWithPartial].map(async (search) => {
        try {
          // filter_price_max must be total budget for all adults, since min_price
          // returned by the API is the full package price (not per-person).
          const totalBudget = (budget * adults).toString();
          const params = new URLSearchParams({
            request_id: search.requestId,
            filter_price_max: totalBudget,
            sort_by: "price",
            page_limit: "5",
            page_number: "1",
          });
          const resp = await fetch(
            `https://api.level.travel/search/get_grouped_hotels?${params}`,
            { headers, signal: AbortSignal.timeout(10000) }
          );
          if (!resp.ok) return;

          const data = await resp.json() as {
            success: boolean;
            hotels?: Array<{
              hotel: {
                id: number;
                name: string;
                stars: number;
                city: string;
                region_name: string;
                link: string;
                images: Array<{ x500: string }>;
              };
              min_price: number;
              min_price_nights: number;
              dates: Record<string, number>;
              tour_id: string;
            }>;
          };

          if (!data.success || !data.hotels?.length) return;

          const countryRu = COUNTRY_ISO_TO_RU[search.countryIso] || search.countryIso;

          for (const h of data.hotels) {
            const departureDates = Object.keys(h.dates);
            const departureDate = departureDates[0] || getDateRange(1);
            const nights = h.min_price_nights || 7;
            const returnDate = addDaysToISO(departureDate, nights);
            const totalPrice = h.min_price;
            const pricePerPerson = Math.round(totalPrice / adults);

            if (pricePerPerson > budget) continue;

            allTours.push({
              id: h.tour_id || `${h.hotel.id}-${departureDate}`,
              destination: `${countryRu}, ${h.hotel.region_name || h.hotel.city}`,
              country: countryRu,
              city: h.hotel.region_name || h.hotel.city,
              hotel: h.hotel.name,
              stars: h.hotel.stars || 3,
              departureDate,
              returnDate,
              nights,
              price: pricePerPerson,
              totalPrice,
              mealType: "Уточняется",
              imageUrl: h.hotel.images?.[0]?.x500 || DESTINATION_IMAGES[countryRu] || DEFAULT_IMAGE,
              bookingUrl: normalizeBookingUrl(h.hotel.link),
              operatorName: "Level.Travel",
            });
          }
        } catch (err) {
          console.warn(`Level.Travel get_grouped_hotels error for ${search.countryIso}:`, err);
        }
      })
    );

    if (allTours.length === 0) return null;

    allTours.sort((a, b) => a.price - b.price);
    return allTours;
  } catch (err) {
    console.error("Level.Travel API error:", err);
    return null;
  }
}

function normalizeBookingUrl(link: string): string {
  if (!link) return "https://level.travel/tours";
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  return `https://level.travel${link.startsWith("/") ? "" : "/"}${link}`;
}

function buildDemoBookingUrl(country: string, hotelSlug: string): string {
  const countrySlug = COUNTRY_RU_TO_SLUG[country] || country.toLowerCase().replace(/\s/g, "-");
  return `https://level.travel/tours/${countrySlug}?hotel=${hotelSlug}`;
}

function generateDemoTours(departureCityName: string, budget: number, adults: number): RawTour[] {
  const allTours: RawTour[] = [];
  const countries = Object.keys(HOTELS_BY_COUNTRY);
  const shuffledCountries = shuffle(countries);

  for (const country of shuffledCountries) {
    const hotels = HOTELS_BY_COUNTRY[country];
    const shuffledHotels = shuffle(hotels);

    for (const hotelInfo of shuffledHotels.slice(0, 2)) {
      const nights = randomInt(5, 10);
      const departureOffset = randomInt(1, 7);
      const departureDate = getDateRange(departureOffset);
      const returnDate = getDateRange(departureOffset + nights);
      const pricePerPerson = randomInt(20000, Math.min(budget * 0.95, 130000));
      const totalPrice = pricePerPerson * adults;

      if (pricePerPerson <= budget) {
        allTours.push({
          id: `${country}-${hotelInfo.slug}-${departureDate}`.replace(/[\s&]/g, "-"),
          destination: `${country}, ${hotelInfo.city}`,
          country,
          city: hotelInfo.city,
          hotel: hotelInfo.hotel,
          stars: hotelInfo.stars,
          departureDate,
          returnDate,
          nights,
          price: pricePerPerson,
          totalPrice,
          mealType: MEAL_TYPES[randomInt(0, MEAL_TYPES.length - 1)],
          imageUrl: DESTINATION_IMAGES[country] || DEFAULT_IMAGE,
          bookingUrl: buildDemoBookingUrl(country, hotelInfo.slug),
          operatorName: hotelInfo.operator,
        });
      }
    }
  }

  allTours.sort((a, b) => a.price - b.price);
  return allTours;
}

export async function searchLevelTravelTours(
  departureCityName: string,
  budget: number,
  adults: number = 2
): Promise<{ tours: RawTour[]; source: "api" | "demo" }> {
  const token = await getLevelTravelToken();

  if (token) {
    const apiTours = await fetchRealLevelTravelTours(token, departureCityName, budget, adults);
    if (apiTours && apiTours.length > 0) {
      return { tours: apiTours.slice(0, 10), source: "api" };
    }
  }

  const demoTours = generateDemoTours(departureCityName, budget, adults);
  return { tours: demoTours, source: "demo" };
}

const TOUR_ANGLES = [
  {
    focus: "пляж и релакс",
    instruction: "Опиши пляжный отдых, море, солнце, инфраструктуру отеля. Упомяни уникальные особенности пляжа или бассейна. Начни с живой фразы об отдыхе.",
    verdict_hint: "Акцент на том, стоит ли брать именно сейчас из-за цены или сезона.",
  },
  {
    focus: "культура, атмосфера и еда",
    instruction: "Опиши местный колорит, что можно увидеть рядом с отелем, местную кухню или уличную жизнь. Начни с неожиданного факта или атмосферного описания места.",
    verdict_hint: "Акцент на уникальности направления — это стоит увидеть хотя бы раз.",
  },
  {
    focus: "соотношение цена/качество и впечатления",
    instruction: "Опиши почему это предложение — выгодная сделка. Что получит турист за эти деньги, что включено, какие развлечения и активности доступны. Начни с конкретного преимущества тура.",
    verdict_hint: "Акцент на горящей цене и почему нужно принять решение быстро.",
  },
];

export async function generateTourDescription(
  tour: RawTour,
  departureCityName: string,
  nights: number,
  tourIndex: number = 0
): Promise<{ aiDescription: string; aiRecommendation: string; aiProvider: string }> {
  const angle = TOUR_ANGLES[tourIndex % TOUR_ANGLES.length];

  const prompt = `Ты — эксперт по спонтанным путешествиям. Пиши по-русски, живо и вдохновляюще.

Это вариант №${tourIndex + 1} из 3. Каждый вариант должен звучать СОВЕРШЕННО ИНАЧЕ остальных.

Тур:
- Откуда: ${departureCityName}
- Куда: ${tour.country}, ${tour.city}
- Отель: ${tour.hotel} (${tour.stars}★)
- Питание: ${tour.mealType}
- Ночей: ${nights}
- Цена: ${tour.price.toLocaleString("ru-RU")} ₽/чел
- Вылет: ${tour.departureDate}

Угол описания для варианта №${tourIndex + 1}: ${angle.focus}.
Инструкция: ${angle.instruction}

Напиши ответ в формате JSON:
{
  "description": "2-3 предложения: ${angle.focus}. Конкретика, не общие слова. Максимум 75 слов.",
  "recommendation": "Одна фраза-вердикт. ${angle.verdict_hint}"
}

Только JSON, без markdown.`;

  const gigaChatConfigured = await isGigaChatConfigured();

  if (gigaChatConfigured) {
    try {
      const content = await gigaChatComplete([{ role: "user", content: prompt }], "GigaChat-Pro");
      if (content) {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.description && parsed.recommendation) {
          return {
            aiDescription: parsed.description,
            aiRecommendation: parsed.recommendation,
            aiProvider: "GigaChat-Pro",
          };
        }
      }
    } catch (err) {
      console.warn("GigaChat failed, falling back to OpenAI:", err);
    }
  }

  if (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });
      const content = response.choices[0]?.message?.content ?? "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.description && parsed.recommendation) {
        return {
          aiDescription: parsed.description,
          aiRecommendation: parsed.recommendation,
          aiProvider: "OpenAI",
        };
      }
    } catch {
      // fallback to static
    }
  }

  const staticDescriptions = [
    `Расслабьтесь на берегу ${tour.city} — кристальная вода и ухоженный пляж ${tour.hotel} созданы для настоящего отдыха. За ${nights} ночей успеете перезарядиться и забыть о работе.`,
    `${tour.city} — место, где история встречается с современным комфортом. ${tour.hotel} расположен в сердце курортной зоны, рядом — местные рестораны и достопримечательности.`,
    `За ${tour.price.toLocaleString("ru-RU")} ₽ — ${nights} ночей в ${tour.stars}★ отеле с питанием. ${tour.hotel} стабильно входит в топ по отзывам: отличный сервис и инфраструктура.`,
  ];

  return {
    aiDescription: staticDescriptions[tourIndex % staticDescriptions.length],
    aiRecommendation: "Горящее предложение — берите прямо сейчас!",
    aiProvider: "static",
  };
}
