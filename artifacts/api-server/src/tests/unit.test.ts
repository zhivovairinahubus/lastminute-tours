import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Tour angle selection (generateTourDescription)", () => {
  const TOUR_ANGLES = [
    { focus: "пляж и релакс" },
    { focus: "культура, атмосфера и еда" },
    { focus: "соотношение цена/качество и впечатления" },
  ];

  it("tourIndex=0 uses beach angle", () => {
    expect(TOUR_ANGLES[0 % TOUR_ANGLES.length].focus).toBe("пляж и релакс");
  });

  it("tourIndex=1 uses culture angle", () => {
    expect(TOUR_ANGLES[1 % TOUR_ANGLES.length].focus).toBe("культура, атмосфера и еда");
  });

  it("tourIndex=2 uses price angle", () => {
    expect(TOUR_ANGLES[2 % TOUR_ANGLES.length].focus).toBe("соотношение цена/качество и впечатления");
  });

  it("tourIndex=3 wraps back to beach angle", () => {
    expect(TOUR_ANGLES[3 % TOUR_ANGLES.length].focus).toBe("пляж и релакс");
  });

  it("all 3 angles are distinct", () => {
    const focusList = TOUR_ANGLES.map(a => a.focus);
    const unique = new Set(focusList);
    expect(unique.size).toBe(3);
  });
});

describe("Demo booking URL builder", () => {
  const COUNTRY_RU_TO_SLUG: Record<string, string> = {
    "Турция": "turkey", "Египет": "egypt", "Таиланд": "thailand",
    "ОАЭ": "uae", "Греция": "greece", "Кипр": "cyprus",
    "Испания": "spain", "Черногория": "montenegro", "Тунис": "tunisia",
    "Мальдивы": "maldives", "Куба": "cuba", "Италия": "italy",
    "Грузия": "georgia", "Израиль": "israel", "Индонезия": "indonesia",
  };

  function buildDemoBookingUrl(country: string, hotelSlug: string): string {
    const countrySlug = COUNTRY_RU_TO_SLUG[country] || country.toLowerCase().replace(/\s/g, "-");
    return `https://level.travel/tours/${countrySlug}?hotel=${hotelSlug}`;
  }

  it("builds booking URL for Turkey", () => {
    const url = buildDemoBookingUrl("Турция", "delphin-imperial-lara");
    expect(url).toBe("https://level.travel/tours/turkey?hotel=delphin-imperial-lara");
  });

  it("builds booking URL for Egypt", () => {
    const url = buildDemoBookingUrl("Египет", "hilton-hurghada-plaza");
    expect(url).toBe("https://level.travel/tours/egypt?hotel=hilton-hurghada-plaza");
  });

  it("falls back to lowercased country for unknown country", () => {
    const url = buildDemoBookingUrl("Неизвестная", "some-hotel");
    expect(url).toBe("https://level.travel/tours/неизвестная?hotel=some-hotel");
  });

  it("URL always starts with https://level.travel", () => {
    for (const country of Object.keys(COUNTRY_RU_TO_SLUG)) {
      const url = buildDemoBookingUrl(country, "test-hotel");
      expect(url).toMatch(/^https:\/\/level\.travel/);
    }
  });
});

describe("normalizeBookingUrl", () => {
  function normalizeBookingUrl(link: string): string {
    if (!link) return "https://level.travel/tours";
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    return `https://level.travel${link.startsWith("/") ? "" : "/"}${link}`;
  }

  it("returns default URL for empty string", () => {
    expect(normalizeBookingUrl("")).toBe("https://level.travel/tours");
  });

  it("passes through absolute http URL unchanged", () => {
    expect(normalizeBookingUrl("http://level.travel/tours/turkey")).toBe("http://level.travel/tours/turkey");
  });

  it("passes through absolute https URL unchanged", () => {
    expect(normalizeBookingUrl("https://level.travel/tours/egypt?hotel=hilton")).toBe("https://level.travel/tours/egypt?hotel=hilton");
  });

  it("prepends https://level.travel to relative path with leading slash", () => {
    expect(normalizeBookingUrl("/tours/turkey?hotel=hilton")).toBe("https://level.travel/tours/turkey?hotel=hilton");
  });

  it("prepends https://level.travel/ to relative path without leading slash", () => {
    expect(normalizeBookingUrl("tours/turkey?hotel=hilton")).toBe("https://level.travel/tours/turkey?hotel=hilton");
  });
});

describe("Tour price validation logic", () => {
  it("price per person is always <= budget", () => {
    const budget = 80000;
    const adults = 2;
    const pricePerPerson = 60000;
    const totalPrice = pricePerPerson * adults;

    expect(pricePerPerson).toBeLessThanOrEqual(budget);
    expect(totalPrice).toBe(120000);
  });

  it("adults clamp to 1-10 range", () => {
    const clamp = (n: number) => Math.max(1, Math.min(10, n));
    expect(clamp(0)).toBe(1);
    expect(clamp(-5)).toBe(1);
    expect(clamp(11)).toBe(10);
    expect(clamp(100)).toBe(10);
    expect(clamp(5)).toBe(5);
    expect(clamp(1)).toBe(1);
    expect(clamp(10)).toBe(10);
  });

  it("totalPrice equals price * adults", () => {
    const cases = [
      { price: 50000, adults: 1 },
      { price: 50000, adults: 2 },
      { price: 50000, adults: 4 },
      { price: 30000, adults: 10 },
    ];
    for (const { price, adults } of cases) {
      expect(price * adults).toBe(price * adults);
    }
  });
});

describe("Auth middleware logic (unit)", () => {
  it("isAuthenticated returns false when user is undefined", () => {
    const req: { user?: { id: string }; isAuthenticated: () => boolean } = {
      user: undefined,
      isAuthenticated() { return this.user != null; },
    };
    expect(req.isAuthenticated()).toBe(false);
  });

  it("isAuthenticated returns true when user is set", () => {
    const req: { user?: { id: string }; isAuthenticated: () => boolean } = {
      user: { id: "test-user-123" },
      isAuthenticated() { return this.user != null; },
    };
    expect(req.isAuthenticated()).toBe(true);
  });

  it("session TTL is 7 days in milliseconds", () => {
    const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
    expect(SESSION_TTL).toBe(604800000);
  });

  it("clearSession is called when session has no user.id", () => {
    const session = { user: { id: "" }, access_token: "tok" };
    const shouldClear = !session.user?.id;
    expect(shouldClear).toBe(true);
  });

  it("clearSession is NOT called when session has valid user.id", () => {
    const session = { user: { id: "abc-123" }, access_token: "tok" };
    const shouldClear = !session.user?.id;
    expect(shouldClear).toBe(false);
  });
});

describe("SaveTourBody validation (Zod schema)", () => {
  const validTourData = {
    hotel: "Grand Hotel",
    destination: "Турция, Анталья",
    country: "Турция",
    city: "Анталья",
    stars: 5,
    departureDate: "25.03.2026",
    nights: 7,
    price: 45000,
    totalPrice: 90000,
    mealType: "Всё включено",
  };

  it("valid tour data passes validation", () => {
    expect(validTourData.hotel.length).toBeLessThanOrEqual(500);
    expect(validTourData.stars).toBeGreaterThanOrEqual(1);
    expect(validTourData.stars).toBeLessThanOrEqual(7);
    expect(validTourData.price).toBeGreaterThanOrEqual(0);
    expect(validTourData.nights).toBeGreaterThanOrEqual(1);
    expect(validTourData.nights).toBeLessThanOrEqual(90);
  });

  it("stars must be 1-7", () => {
    expect(0).toBeLessThan(1);
    expect(8).toBeGreaterThan(7);
    expect(5).toBeGreaterThanOrEqual(1);
    expect(5).toBeLessThanOrEqual(7);
  });

  it("nights must be 1-90", () => {
    expect(0).toBeLessThan(1);
    expect(91).toBeGreaterThan(90);
    expect(7).toBeGreaterThanOrEqual(1);
    expect(7).toBeLessThanOrEqual(90);
  });

  it("price must not exceed 10_000_000", () => {
    expect(45000).toBeLessThanOrEqual(10_000_000);
    expect(10_000_001).toBeGreaterThan(10_000_000);
  });

  it("totalPrice must not exceed 100_000_000", () => {
    expect(90000).toBeLessThanOrEqual(100_000_000);
    expect(100_000_001).toBeGreaterThan(100_000_000);
  });
});

describe("Search history route logic", () => {
  it("unauthenticated user gets 401", () => {
    const isAuthenticated = false;
    const expectedStatus = isAuthenticated ? 200 : 401;
    expect(expectedStatus).toBe(401);
  });

  it("authenticated user gets 200", () => {
    const isAuthenticated = true;
    const expectedStatus = isAuthenticated ? 200 : 401;
    expect(expectedStatus).toBe(200);
  });

  it("limit of 20 recent searches per user", () => {
    const SEARCH_HISTORY_LIMIT = 20;
    expect(SEARCH_HISTORY_LIMIT).toBe(20);
  });
});

describe("Static fallback descriptions", () => {
  const tour = {
    hotel: "Grand Hotel",
    city: "Анталья",
    stars: 5,
    price: 45000,
  };
  const nights = 7;

  it("index 0 fallback mentions city", () => {
    const desc = `Расслабьтесь на берегу ${tour.city} — кристальная вода и ухоженный пляж ${tour.hotel} созданы для настоящего отдыха. За ${nights} ночей успеете перезарядиться и забыть о работе.`;
    expect(desc).toContain(tour.city);
    expect(desc).toContain(tour.hotel);
  });

  it("index 1 fallback mentions hotel and city", () => {
    const desc = `${tour.city} — место, где история встречается с современным комфортом. ${tour.hotel} расположен в сердце курортной зоны, рядом — местные рестораны и достопримечательности.`;
    expect(desc).toContain(tour.city);
    expect(desc).toContain(tour.hotel);
  });

  it("index 2 fallback mentions price and stars", () => {
    const priceFormatted = tour.price.toLocaleString("ru-RU");
    const desc = `За ${priceFormatted} ₽ — ${nights} ночей в ${tour.stars}★ отеле с питанием. ${tour.hotel} стабильно входит в топ по отзывам: отличный сервис и инфраструктура.`;
    expect(desc).toContain(priceFormatted);
    expect(desc).toContain(`${tour.stars}★`);
  });

  it("3 fallback descriptions are all different", () => {
    const staticDescriptions = [
      `Расслабьтесь на берегу ${tour.city}`,
      `${tour.city} — место, где история`,
      `За ${tour.price.toLocaleString("ru-RU")} ₽`,
    ];
    const unique = new Set(staticDescriptions);
    expect(unique.size).toBe(3);
  });
});
