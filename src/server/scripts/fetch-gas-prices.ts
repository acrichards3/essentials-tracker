import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { essentials, priceEntries } from "../db/schema";

/**
 * Fetches US national average gas prices from EIA (Energy Information Administration)
 * You can get a free API key from: https://www.eia.gov/opendata/register.php
 */

interface EIAResponse {
  response: {
    data: Array<{
      period: string; // Date in YYYY-MM-DD format
      value: number; // Price in dollars
    }>;
  };
}

async function fetchGasPrices() {
  console.log("⛽ Fetching US national gas prices...");

  const apiKey = process.env.EIA_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: EIA_API_KEY environment variable is required.");
    console.log(
      "   Get a free API key from: https://www.eia.gov/opendata/register.php",
    );
    console.log("   Then run: EIA_API_KEY=your-key bun run fetch:gas");
    process.exit(1);
  }


  try {
    // EIA API endpoint for weekly US regular gas prices
    // Series ID: PET.EMM_EPM0_PTE_NUS_DPG.W (Weekly U.S. Regular All Formulations Retail Gasoline Prices)
    const seriesId = "PET.EMM_EPM0_PTE_NUS_DPG.W";
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[series][]=${seriesId}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`;

    console.log("🌐 Calling EIA API...");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `EIA API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as EIAResponse;

    if (!data.response?.data || data.response.data.length === 0) {
      throw new Error("No data returned from EIA API");
    }

    const latestData = data.response.data[0]!;
    const price = latestData.value;
    const priceDate = new Date(latestData.period);

    console.log(`📊 Latest gas price: $${price} (as of ${latestData.period})`);

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

    // Check if we already have a price entry for this date
    const [existingPrice] = await db
      .select()
      .from(priceEntries)
      .where(eq(priceEntries.essentialId, essentialId))
      .orderBy(priceEntries.createdAt)
      .limit(1);

    // Only add if we don't have a recent price (within last 6 days)
    const shouldAdd =
      !existingPrice ||
      new Date().getTime() - existingPrice.createdAt.getTime() >
        6 * 24 * 60 * 60 * 1000;

    if (!shouldAdd) {
      console.log(
        "ℹ️  Skipping: Already have a recent price entry (within last 6 days)",
      );
      console.log("🎉 Done!");
      process.exit(0);
    }

    // Add the price entry
    console.log("💰 Adding price entry...");
    await db.insert(priceEntries).values({
      createdAt: priceDate,
      essentialId: essentialId,
      location: "US National Average",
      notes: "Data from EIA (Energy Information Administration)",
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

void fetchGasPrices();

