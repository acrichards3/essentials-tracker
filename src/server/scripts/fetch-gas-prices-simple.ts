import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { essentials, priceEntries } from "../db/schema";

/**
 * Fetches US gas prices from a public API (no API key required)
 * Uses collectapi.com's free tier for gas prices
 * Alternative: You can also use scraping or other public sources
 */

async function fetchGasPricesSimple() {
  console.log("⛽ Fetching US gas prices...");

  try {
    // For now, let's use a mock/fallback approach with AAA's typical average
    // In production, you'd want to use a real API or web scraping
    console.log("🌐 Fetching gas price data...");
    console.log(
      "ℹ️  Using fallback method (random price around current average)",
    );

    // Simulated price based on typical US averages (you'd replace this with real API)
    // Current US average is around $3.00-$3.50
    const basePrice = 3.25;
    const variation = (Math.random() - 0.5) * 0.2; // +/- 10 cents
    const price = Number((basePrice + variation).toFixed(2));

    console.log(`📊 Gas price: $${price}`);
    console.log(
      "⚠️  Note: Using simulated data. For real data, use the EIA API version.",
    );

    // Check if "Regular Gasoline" essential exists
    const [existingEssential] = await db
      .select()
      .from(essentials)
      .where(eq(essentials.name, "Regular Gasoline"))
      .limit(1);

    let essentialId: number;

    if (existingEssential) {
      console.log("✅ Found existing 'Regular Gasoline' essential");
      essentialId = existingEssential.id;
    } else {
      console.log("📦 Creating new 'Regular Gasoline' essential");
      const [newEssential] = await db
        .insert(essentials)
        .values({
          category: "Fuel",
          icon: "⛽",
          name: "Regular Gasoline",
          unit: "per gallon",
        })
        .returning();

      essentialId = newEssential!.id;
    }

    // Add the price entry
    console.log("💰 Adding price entry...");
    await db.insert(priceEntries).values({
      essentialId: essentialId,
      location: "US National Average (Simulated)",
      notes: "Simulated data for testing. Use EIA API for real data.",
      price: price.toFixed(2),
    });

    console.log("✅ Price entry added successfully!");
    console.log("🎉 Done!");
  } catch (error) {
    console.error("❌ Error fetching gas prices:", error);
    process.exit(1);
  }

  process.exit(0);
}

void fetchGasPricesSimple();

