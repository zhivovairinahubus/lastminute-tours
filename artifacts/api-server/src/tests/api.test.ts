import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { db, sessionsTable, savedToursTable, searchHistoryTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const request = supertest(app);

async function createTestSession(userId: string): Promise<string> {
  const sid = crypto.randomBytes(16).toString("hex");
  await db.insert(sessionsTable).values({
    sid,
    sess: {
      user: {
        id: userId,
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        profileImageUrl: null,
      },
      access_token: "fake-access-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
    expire: new Date(Date.now() + 3600 * 1000),
  });
  return sid;
}

async function createTestUser(userId: string): Promise<void> {
  await db.insert(usersTable).values({
    id: userId,
    email: `testuser-${userId}@example.com`,
    firstName: "Test",
    lastName: "User",
  }).onConflictDoNothing();
}

async function cleanupTestSession(sid: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.sid, sid));
}

async function cleanupTestUser(userId: string): Promise<void> {
  await db.delete(savedToursTable).where(eq(savedToursTable.userId, userId));
  await db.delete(searchHistoryTable).where(eq(searchHistoryTable.userId, userId));
  await db.delete(usersTable).where(eq(usersTable.id, userId));
}

describe("Health check", () => {
  it("GET /api/healthz returns 200", async () => {
    const res = await request.get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

describe("Departure cities", () => {
  it("GET /api/tours/cities returns cities array", async () => {
    const res = await request.get("/api/tours/cities");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cities");
    expect(Array.isArray(res.body.cities)).toBe(true);
    expect(res.body.cities.length).toBeGreaterThan(0);
  });

  it("Each city has id, name, nameEn fields", async () => {
    const res = await request.get("/api/tours/cities");
    const city = res.body.cities[0];
    expect(city).toHaveProperty("id");
    expect(city).toHaveProperty("name");
    expect(city).toHaveProperty("nameEn");
  });
});

describe("Tour search", () => {
  let toursResponse: {
    tours: Array<{
      id: string;
      hotel: string;
      destination: string;
      country: string;
      city: string;
      stars: number;
      departureDate: string;
      returnDate: string;
      nights: number;
      price: number;
      totalPrice: number;
      mealType: string;
      imageUrl: string;
      bookingUrl?: string;
      aiDescription?: string;
      aiRecommendation?: string;
    }>;
    totalFound: number;
    departureCity: string;
    budget: number;
    dataSource: string;
  };

  beforeAll(async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва",
      budget: 80000,
      adults: 2,
    });
    toursResponse = res.body as typeof toursResponse;
  }, 30000);

  it("POST /api/tours/search returns 200", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 2,
    });
    expect(res.status).toBe(200);
  }, 30000);

  it("Response has tours array with max 3 items", () => {
    expect(Array.isArray(toursResponse.tours)).toBe(true);
    expect(toursResponse.tours.length).toBeLessThanOrEqual(3);
    expect(toursResponse.tours.length).toBeGreaterThan(0);
  });

  it("Response has totalFound, departureCity, budget, dataSource fields", () => {
    expect(toursResponse).toHaveProperty("totalFound");
    expect(toursResponse).toHaveProperty("departureCity", "Москва");
    expect(toursResponse).toHaveProperty("budget", 80000);
    expect(toursResponse).toHaveProperty("dataSource");
  });

  it("Each tour has all required fields", () => {
    const tour = toursResponse.tours[0];
    const fields = ["id", "hotel", "destination", "country", "city", "stars",
      "departureDate", "returnDate", "nights", "price", "totalPrice", "mealType", "imageUrl"];
    for (const f of fields) {
      expect(tour).toHaveProperty(f);
    }
  });

  it("Tours are sorted by price ascending", () => {
    if (toursResponse.tours.length < 2) return;
    for (let i = 0; i < toursResponse.tours.length - 1; i++) {
      expect(toursResponse.tours[i].price).toBeLessThanOrEqual(toursResponse.tours[i + 1].price);
    }
  });

  it("All tour prices are within budget", () => {
    for (const tour of toursResponse.tours) {
      expect(tour.price).toBeLessThanOrEqual(80000);
    }
  });

  it("Tours have aiDescription (non-empty string)", () => {
    for (const tour of toursResponse.tours) {
      expect(typeof tour.aiDescription).toBe("string");
      expect(tour.aiDescription!.length).toBeGreaterThan(10);
    }
  });

  it("Tours have bookingUrl starting with https://", () => {
    for (const tour of toursResponse.tours) {
      expect(tour.bookingUrl).toBeTruthy();
      expect(tour.bookingUrl!).toMatch(/^https:\/\//);
    }
  });

  it("AI descriptions for 3 tours are not all identical", () => {
    if (toursResponse.tours.length < 2) return;
    const unique = new Set(toursResponse.tours.map(t => t.aiDescription));
    expect(unique.size).toBeGreaterThan(1);
  });

  it("totalPrice = price * 2 for adults=2", () => {
    for (const tour of toursResponse.tours) {
      expect(Math.abs(tour.totalPrice - tour.price * 2)).toBeLessThanOrEqual(1);
    }
  });

  it("adults=1: totalPrice = price * 1", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 1,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=3: totalPrice = price * 3", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 3,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 3)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=4: totalPrice = price * 4", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 4,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 4)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=5: totalPrice = price * 5", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 5,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 5)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=6: totalPrice = price * 6", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 6,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 6)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=7: totalPrice = price * 7", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 7,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 7)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=8: totalPrice = price * 8", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 8,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 8)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=9: totalPrice = price * 9", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 9,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 9)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("adults=10 (max): totalPrice = price * 10", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 80000, adults: 10,
    });
    expect(res.status).toBe(200);
    for (const t of res.body.tours) {
      expect(Math.abs(t.totalPrice - t.price * 10)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("missing city returns 400", async () => {
    const res = await request.post("/api/tours/search").send({ budget: 50000 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("negative budget returns 400", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: -100,
    });
    expect(res.status).toBe(400);
  });

  it("zero budget returns 400", async () => {
    const res = await request.post("/api/tours/search").send({
      departureCity: "Москва", budget: 0,
    });
    expect(res.status).toBe(400);
  });

  it("empty body returns 400", async () => {
    const res = await request.post("/api/tours/search").send({});
    expect(res.status).toBe(400);
  });
});

describe("Admin settings API", () => {
  it("GET /api/admin/settings/status returns gigachat and levelTravel booleans", async () => {
    const res = await request.get("/api/admin/settings/status");
    expect(res.status).toBe(200);
    expect(typeof res.body.gigachat).toBe("boolean");
    expect(typeof res.body.levelTravel).toBe("boolean");
  });

  it("GET /api/admin/settings/status returns gigachat:true when GIGACHAT_KEY env var is set", async () => {
    const original = process.env.GIGACHAT_KEY;
    process.env.GIGACHAT_KEY = "test-env-key";
    const res = await request.get("/api/admin/settings/status");
    expect(res.status).toBe(200);
    expect(res.body.gigachat).toBe(true);
    if (original === undefined) delete process.env.GIGACHAT_KEY;
    else process.env.GIGACHAT_KEY = original;
  });

  it("GET /api/admin/settings returns settings object", async () => {
    const res = await request.get("/api/admin/settings");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("settings");
  });

  it("PUT /api/admin/settings/INVALID_KEY returns 400", async () => {
    const res = await request.put("/api/admin/settings/INVALID_KEY").send({ value: "test" });
    expect(res.status).toBe(400);
  });

  it("PUT /api/admin/settings/GIGACHAT_KEY with empty value returns 400", async () => {
    const res = await request.put("/api/admin/settings/GIGACHAT_KEY").send({ value: "" });
    expect(res.status).toBe(400);
  });
});

describe("Auth API endpoints", () => {
  it("GET /api/auth/user returns {user: null} when unauthenticated", async () => {
    const res = await request.get("/api/auth/user");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toBeNull();
  });

  it("GET /api/auth/me returns {user: null} when unauthenticated (alias)", async () => {
    const res = await request.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("GET /api/login redirects to OIDC (3xx)", async () => {
    const res = await request.get("/api/login").redirects(0);
    expect([301, 302, 303, 307, 308]).toContain(res.status);
    expect(res.headers.location).toBeTruthy();
  });

  it("GET /api/auth/logout redirects (3xx)", async () => {
    const res = await request.get("/api/auth/logout").redirects(0);
    expect([301, 302, 303, 307, 308]).toContain(res.status);
  });

  it("GET /api/logout (original path) also redirects (3xx)", async () => {
    const res = await request.get("/api/logout").redirects(0);
    expect([301, 302, 303, 307, 308]).toContain(res.status);
  });
});

describe("Saved tours API (unauthenticated)", () => {
  it("GET /api/user/saved-tours returns 401", async () => {
    const res = await request.get("/api/user/saved-tours");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/user/saved-tours returns 401", async () => {
    const res = await request.post("/api/user/saved-tours").send({
      tourId: "test-tour-123",
      tourData: { hotel: "Test", destination: "X", country: "X", city: "X", stars: 5, departureDate: "01.01.2026", nights: 7, price: 50000, totalPrice: 100000, mealType: "AI" },
    });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/user/saved-tours/:id returns 401", async () => {
    const res = await request.delete("/api/user/saved-tours/any-id");
    expect(res.status).toBe(401);
  });
});

describe("Saved tours API (authenticated CRUD)", () => {
  const testUserId = `test-user-${crypto.randomBytes(8).toString("hex")}`;
  let sessionCookie: string;
  const testTourId = `test-tour-${crypto.randomBytes(6).toString("hex")}`;

  beforeAll(async () => {
    await createTestUser(testUserId);
    const sid = await createTestSession(testUserId);
    sessionCookie = `sid=${sid}`;
  });

  it("GET /api/user/saved-tours returns empty array for new user", async () => {
    const res = await request
      .get("/api/user/saved-tours")
      .set("Cookie", sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("savedTours");
    expect(Array.isArray(res.body.savedTours)).toBe(true);
  });

  it("POST /api/user/saved-tours saves a tour", async () => {
    const res = await request
      .post("/api/user/saved-tours")
      .set("Cookie", sessionCookie)
      .send({
        tourId: testTourId,
        tourData: {
          hotel: "Grand Hotel Test",
          destination: "Турция, Анталья",
          country: "Турция",
          city: "Анталья",
          stars: 5,
          departureDate: "25.03.2026",
          returnDate: "01.04.2026",
          nights: 7,
          price: 45000,
          totalPrice: 90000,
          mealType: "Всё включено",
          bookingUrl: "https://level.travel/tours/turkey?hotel=grand-hotel-test",
        },
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("GET /api/user/saved-tours returns the saved tour", async () => {
    const res = await request
      .get("/api/user/saved-tours")
      .set("Cookie", sessionCookie);
    expect(res.status).toBe(200);
    const found = res.body.savedTours.find((t: { tourId: string }) => t.tourId === testTourId);
    expect(found).toBeTruthy();
    expect(found.tourData.hotel).toBe("Grand Hotel Test");
  });

  it("POST /api/user/saved-tours with duplicate tourId does not error (onConflictDoNothing)", async () => {
    const res = await request
      .post("/api/user/saved-tours")
      .set("Cookie", sessionCookie)
      .send({
        tourId: testTourId,
        tourData: {
          hotel: "Duplicate Hotel",
          destination: "Египет, Хургада",
          country: "Египет",
          city: "Хургада",
          stars: 4,
          departureDate: "25.03.2026",
          nights: 5,
          price: 30000,
          totalPrice: 60000,
          mealType: "Завтрак",
        },
      });
    expect([200]).toContain(res.status);
  });

  it("POST /api/user/saved-tours with invalid stars returns 400", async () => {
    const res = await request
      .post("/api/user/saved-tours")
      .set("Cookie", sessionCookie)
      .send({
        tourId: "invalid-tour-stars",
        tourData: {
          hotel: "Bad Hotel",
          destination: "Турция, Анталья",
          country: "Турция",
          city: "Анталья",
          stars: 10,
          departureDate: "25.03.2026",
          nights: 7,
          price: 45000,
          totalPrice: 90000,
          mealType: "AI",
        },
      });
    expect(res.status).toBe(400);
  });

  it("POST /api/user/saved-tours with missing required fields returns 400", async () => {
    const res = await request
      .post("/api/user/saved-tours")
      .set("Cookie", sessionCookie)
      .send({ tourId: "incomplete", tourData: {} });
    expect(res.status).toBe(400);
  });

  it("DELETE /api/user/saved-tours/:tourId removes the tour", async () => {
    const res = await request
      .delete(`/api/user/saved-tours/${testTourId}`)
      .set("Cookie", sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("GET /api/user/saved-tours confirms tour is deleted", async () => {
    const res = await request
      .get("/api/user/saved-tours")
      .set("Cookie", sessionCookie);
    const found = res.body.savedTours.find((t: { tourId: string }) => t.tourId === testTourId);
    expect(found).toBeFalsy();
  });

  it("cleanup: remove test user", async () => {
    await cleanupTestUser(testUserId);
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, testUserId));
    expect(rows.length).toBe(0);
  });
});

describe("Search history API (authenticated)", () => {
  const testUserId = `test-hist-user-${crypto.randomBytes(8).toString("hex")}`;
  let sessionCookie: string;

  beforeAll(async () => {
    await createTestUser(testUserId);
    const sid = await createTestSession(testUserId);
    sessionCookie = `sid=${sid}`;
  });

  it("GET /api/user/search-history returns empty array for new user", async () => {
    const res = await request
      .get("/api/user/search-history")
      .set("Cookie", sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("searchHistory");
    expect(Array.isArray(res.body.searchHistory)).toBe(true);
  });

  it("Searching while authenticated records search history", async () => {
    await request
      .post("/api/tours/search")
      .set("Cookie", sessionCookie)
      .send({ departureCity: "Москва", budget: 80000, adults: 2 });

    await new Promise(r => setTimeout(r, 500));

    const histRes = await request
      .get("/api/user/search-history")
      .set("Cookie", sessionCookie);
    expect(histRes.status).toBe(200);
    expect(histRes.body.searchHistory.length).toBeGreaterThan(0);
    const entry = histRes.body.searchHistory[0];
    expect(entry).toHaveProperty("departureCity", "Москва");
    expect(entry).toHaveProperty("budget", 80000);
    expect(entry).toHaveProperty("adults", 2);
  }, 30000);

  it("Search history entries have id, userId, searchedAt fields", async () => {
    const res = await request
      .get("/api/user/search-history")
      .set("Cookie", sessionCookie);
    if (res.body.searchHistory.length > 0) {
      const entry = res.body.searchHistory[0];
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("userId");
      expect(entry).toHaveProperty("searchedAt");
    }
  });

  it("GET /api/user/search-history returns 401 for unauthenticated", async () => {
    const res = await request.get("/api/user/search-history");
    expect(res.status).toBe(401);
  });

  it("cleanup: remove test search history user", async () => {
    await cleanupTestUser(testUserId);
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, testUserId));
    expect(rows.length).toBe(0);
  });
});
