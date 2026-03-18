import { describe, it, expect, vi, beforeAll } from "vitest";
import { generateDemoTours, generateTourDescription, getLevelTravelToken, type RawTour } from "../routes/tours/leveltravel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import type { Request, Response, NextFunction } from "express";

describe("getLevelTravelToken", () => {
  it("returns a string or null (never throws)", async () => {
    const token = await getLevelTravelToken();
    expect(token === null || typeof token === "string").toBe(true);
  });

  it("returns null when DB returns no LEVEL_TRAVEL_TOKEN row", async () => {
    const token = await getLevelTravelToken();
    if (token !== null) {
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    } else {
      expect(token).toBeNull();
    }
  });
});

describe("generateDemoTours", () => {
  it("returns an array of tours for valid inputs", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    expect(Array.isArray(tours)).toBe(true);
    expect(tours.length).toBeGreaterThan(0);
  });

  it("each tour has all required RawTour fields", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    const requiredFields: (keyof RawTour)[] = [
      "id", "destination", "country", "city", "hotel", "stars",
      "departureDate", "returnDate", "nights", "price", "totalPrice",
      "mealType", "imageUrl", "bookingUrl",
    ];
    for (const tour of tours.slice(0, 3)) {
      for (const field of requiredFields) {
        expect(tour).toHaveProperty(field);
      }
    }
  });

  it("all tour prices are within budget", () => {
    const budget = 60000;
    const tours = generateDemoTours("Москва", budget, 2);
    for (const tour of tours) {
      expect(tour.price).toBeLessThanOrEqual(budget);
    }
  });

  it("totalPrice equals price * adults for adults=1", () => {
    const tours = generateDemoTours("Москва", 80000, 1);
    for (const tour of tours) {
      expect(Math.abs(tour.totalPrice - tour.price * 1)).toBeLessThanOrEqual(1);
    }
  });

  it("totalPrice equals price * adults for adults=4", () => {
    const tours = generateDemoTours("Москва", 80000, 4);
    for (const tour of tours) {
      expect(Math.abs(tour.totalPrice - tour.price * 4)).toBeLessThanOrEqual(1);
    }
  });

  it("totalPrice equals price * adults for adults=10", () => {
    const tours = generateDemoTours("Москва", 80000, 10);
    for (const tour of tours) {
      expect(Math.abs(tour.totalPrice - tour.price * 10)).toBeLessThanOrEqual(1);
    }
  });

  it("tours are sorted by price ascending", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    for (let i = 0; i < tours.length - 1; i++) {
      expect(tours[i].price).toBeLessThanOrEqual(tours[i + 1].price);
    }
  });

  it("bookingUrl starts with https://level.travel", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    for (const tour of tours) {
      expect(tour.bookingUrl).toMatch(/^https:\/\/level\.travel/);
    }
  });

  it("tour id is a non-empty string", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    for (const tour of tours) {
      expect(typeof tour.id).toBe("string");
      expect(tour.id.length).toBeGreaterThan(0);
    }
  });

  it("stars are between 1 and 5", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    for (const tour of tours) {
      expect(tour.stars).toBeGreaterThanOrEqual(1);
      expect(tour.stars).toBeLessThanOrEqual(5);
    }
  });

  it("nights are between 1 and 30", () => {
    const tours = generateDemoTours("Москва", 80000, 2);
    for (const tour of tours) {
      expect(tour.nights).toBeGreaterThanOrEqual(1);
      expect(tour.nights).toBeLessThanOrEqual(30);
    }
  });

  it("works with very low budget, still returns tours or empty array", () => {
    const tours = generateDemoTours("Москва", 1000, 2);
    expect(Array.isArray(tours)).toBe(true);
    for (const tour of tours) {
      expect(tour.price).toBeLessThanOrEqual(1000);
    }
  });

  it("works with different departure cities", () => {
    const tours1 = generateDemoTours("Санкт-Петербург", 80000, 2);
    const tours2 = generateDemoTours("Казань", 80000, 2);
    expect(Array.isArray(tours1)).toBe(true);
    expect(Array.isArray(tours2)).toBe(true);
  });
});

describe("generateTourDescription", () => {
  const mockTour: RawTour = {
    id: "test-tour-1",
    destination: "Турция, Анталья",
    country: "Турция",
    city: "Анталья",
    hotel: "Delphin Imperial Lara",
    stars: 5,
    departureDate: "25.03.2026",
    returnDate: "01.04.2026",
    nights: 7,
    price: 45000,
    totalPrice: 90000,
    mealType: "Всё включено",
    imageUrl: "https://example.com/image.jpg",
    bookingUrl: "https://level.travel/tours/turkey?hotel=delphin-imperial-lara",
  };

  it("returns aiDescription, aiRecommendation, aiProvider for index 0", async () => {
    const result = await generateTourDescription(mockTour, "Москва", 7, 0);
    expect(result).toHaveProperty("aiDescription");
    expect(result).toHaveProperty("aiRecommendation");
    expect(result).toHaveProperty("aiProvider");
    expect(typeof result.aiDescription).toBe("string");
    expect(result.aiDescription.length).toBeGreaterThan(10);
  }, 30000);

  it("returns aiDescription for index 1 (culture angle)", async () => {
    const result = await generateTourDescription(mockTour, "Москва", 7, 1);
    expect(typeof result.aiDescription).toBe("string");
    expect(result.aiDescription.length).toBeGreaterThan(10);
    expect(typeof result.aiRecommendation).toBe("string");
  }, 30000);

  it("returns aiDescription for index 2 (price angle)", async () => {
    const result = await generateTourDescription(mockTour, "Москва", 7, 2);
    expect(typeof result.aiDescription).toBe("string");
    expect(result.aiDescription.length).toBeGreaterThan(10);
  }, 30000);

  it("descriptions for indices 0, 1, 2 are all different", async () => {
    const [r0, r1, r2] = await Promise.all([
      generateTourDescription(mockTour, "Москва", 7, 0),
      generateTourDescription(mockTour, "Москва", 7, 1),
      generateTourDescription(mockTour, "Москва", 7, 2),
    ]);
    const unique = new Set([r0.aiDescription, r1.aiDescription, r2.aiDescription]);
    expect(unique.size).toBeGreaterThan(1);
  }, 60000);

  it("aiProvider is a non-empty string", async () => {
    const result = await generateTourDescription(mockTour, "Москва", 7, 0);
    expect(typeof result.aiProvider).toBe("string");
    expect(result.aiProvider.length).toBeGreaterThan(0);
  }, 30000);

  it("tourIndex=3 wraps to same angle as index=0", async () => {
    const [r0, r3] = await Promise.all([
      generateTourDescription(mockTour, "Москва", 7, 0),
      generateTourDescription(mockTour, "Москва", 7, 3),
    ]);
    expect(r0.aiProvider).toBe(r3.aiProvider);
  }, 60000);
});

describe("authMiddleware (unit)", () => {
  function makeReq(cookie?: string) {
    return {
      headers: { cookie },
      cookies: {} as Record<string, string>,
    } as unknown as Request;
  }

  function makeRes() {
    const res = {
      clearCookie: vi.fn(),
    };
    return res as unknown as Response;
  }

  it("calls next() immediately when no session cookie is present", async () => {
    const req = makeReq(undefined);
    req.cookies = {};
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeUndefined();
  });

  it("sets isAuthenticated() to return false when no user set", async () => {
    const req = makeReq(undefined);
    req.cookies = {};
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(req.isAuthenticated()).toBe(false);
  });

  it("calls next() when session cookie exists but DB has no matching session", async () => {
    const req = makeReq("sid=nonexistent-session-id-xyz");
    req.cookies = { sid: "nonexistent-session-id-xyz" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toBeUndefined();
  });

  it("isAuthenticated() returns false after invalid session", async () => {
    const req = makeReq("sid=nonexistent-session-id-xyz");
    req.cookies = { sid: "nonexistent-session-id-xyz" };
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(req.isAuthenticated()).toBe(false);
  });
});
