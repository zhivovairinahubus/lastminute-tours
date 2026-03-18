import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.API_URL || "http://localhost:8080";

describe("Health check", () => {
  it("GET /api/healthz returns 200", async () => {
    const res = await fetch(`${BASE_URL}/api/healthz`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("status", "ok");
  });
});

describe("Departure cities", () => {
  it("GET /api/tours/cities returns cities array", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/cities`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("cities");
    expect(Array.isArray(data.cities)).toBe(true);
    expect(data.cities.length).toBeGreaterThan(0);
  });

  it("Each city has id, name, nameEn fields", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/cities`);
    const data = await res.json();
    const city = data.cities[0];
    expect(city).toHaveProperty("id");
    expect(city).toHaveProperty("name");
    expect(city).toHaveProperty("nameEn");
  });
});

describe("Tour search", () => {
  let toursResponse: {
    tours: Array<{
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
      bookingUrl?: string;
      aiDescription?: string;
      aiRecommendation?: string;
    }>;
    totalFound: number;
    departureCity: string;
    budget: number;
  };

  beforeAll(async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departureCity: "Москва",
        budget: 80000,
        adults: 2,
      }),
    });
    toursResponse = await res.json();
  }, 30000);

  it("POST /api/tours/search returns 200", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureCity: "Москва", budget: 80000, adults: 2 }),
    });
    expect(res.status).toBe(200);
  }, 30000);

  it("Response has tours array with max 3 items", () => {
    expect(Array.isArray(toursResponse.tours)).toBe(true);
    expect(toursResponse.tours.length).toBeLessThanOrEqual(3);
  });

  it("Response has totalFound, departureCity, budget", () => {
    expect(toursResponse).toHaveProperty("totalFound");
    expect(toursResponse).toHaveProperty("departureCity", "Москва");
    expect(toursResponse).toHaveProperty("budget", 80000);
  });

  it("Each tour has required fields", () => {
    expect(toursResponse.tours.length).toBeGreaterThan(0);
    const tour = toursResponse.tours[0];
    expect(tour).toHaveProperty("id");
    expect(tour).toHaveProperty("hotel");
    expect(tour).toHaveProperty("destination");
    expect(tour).toHaveProperty("country");
    expect(tour).toHaveProperty("city");
    expect(tour).toHaveProperty("stars");
    expect(tour).toHaveProperty("departureDate");
    expect(tour).toHaveProperty("returnDate");
    expect(tour).toHaveProperty("nights");
    expect(tour).toHaveProperty("price");
    expect(tour).toHaveProperty("totalPrice");
    expect(tour).toHaveProperty("mealType");
    expect(tour).toHaveProperty("imageUrl");
  });

  it("Tours are sorted by price (cheapest first)", () => {
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

  it("Tours have aiDescription field", () => {
    for (const tour of toursResponse.tours) {
      expect(tour).toHaveProperty("aiDescription");
      expect(typeof tour.aiDescription).toBe("string");
      expect(tour.aiDescription!.length).toBeGreaterThan(10);
    }
  });

  it("Tours have bookingUrl field", () => {
    for (const tour of toursResponse.tours) {
      expect(tour).toHaveProperty("bookingUrl");
      expect(typeof tour.bookingUrl).toBe("string");
      expect(tour.bookingUrl!.length).toBeGreaterThan(5);
    }
  });

  it("AI descriptions are different for the 3 tours", () => {
    if (toursResponse.tours.length < 2) return;
    const descriptions = toursResponse.tours.map(t => t.aiDescription);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBeGreaterThan(1);
  });

  it("totalPrice equals price * adults for demo tours", () => {
    for (const tour of toursResponse.tours) {
      const expectedTotal = tour.price * 2;
      expect(Math.abs(tour.totalPrice - expectedTotal)).toBeLessThanOrEqual(1);
    }
  });

  it("POST /api/tours/search with adults=1 returns correct per-person price", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureCity: "Москва", budget: 80000, adults: 1 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.tours)).toBe(true);
    for (const tour of data.tours) {
      expect(tour.price).toBeLessThanOrEqual(80000);
      expect(tour).toHaveProperty("bookingUrl");
      // For 1 adult, totalPrice should equal price
      expect(Math.abs(tour.totalPrice - tour.price)).toBeLessThanOrEqual(1);
    }
  }, 30000);

  it("POST /api/tours/search with adults=4 returns correct totalPrice", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureCity: "Москва", budget: 80000, adults: 4 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.tours)).toBe(true);
    expect(data.tours.length).toBeGreaterThan(0);
    for (const tour of data.tours) {
      // Per-person price must be within per-person budget
      expect(tour.price).toBeLessThanOrEqual(80000);
      // Total price should equal price × 4 adults
      expect(Math.abs(tour.totalPrice - tour.price * 4)).toBeLessThanOrEqual(1);
      expect(tour).toHaveProperty("bookingUrl");
    }
  }, 30000);

  it("POST /api/tours/search with missing city returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: 50000 }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/tours/search with invalid budget returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/tours/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureCity: "Москва", budget: -100 }),
    });
    expect(res.status).toBe(400);
  });
});

describe("Admin settings API", () => {
  it("GET /api/admin/settings/status returns gigachat and levelTravel booleans", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings/status`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("gigachat");
    expect(data).toHaveProperty("levelTravel");
    expect(typeof data.gigachat).toBe("boolean");
    expect(typeof data.levelTravel).toBe("boolean");
  });

  it("GET /api/admin/settings returns settings object", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("settings");
  });

  it("PUT /api/admin/settings/INVALID_KEY returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings/INVALID_KEY`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "test-value" }),
    });
    expect(res.status).toBe(400);
  });

  it("PUT /api/admin/settings/GIGACHAT_KEY with empty value returns 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings/GIGACHAT_KEY`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "" }),
    });
    expect(res.status).toBe(400);
  });
});
