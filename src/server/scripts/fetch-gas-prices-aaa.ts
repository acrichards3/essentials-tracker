import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { essentials, priceEntries } from "../db/schema";

/**
 * Fetches US national average gas prices from AAA's public API
 * No API key required - uses AAA's publicly available data
 */

async function fetchGasPricesAAA() {
  console.log("⛽ Fetching US national gas prices from AAA...");

  try {
    console.log("🌐 Calling AAA Gas Prices API...");

    // AAA's public gas price API endpoint
    const url = "https://gasprices.aaa.com/state-gas-price-averages/";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; EssentialsTracker/1.0)",
      },
    });

    if (!response.ok) {
      console.log(
        `⚠️  AAA API returned ${response.status}, using fallback method...`,
      );

      // Fallback: Use a reasonable current average
      const price = 3.29; // Update this periodically with known averages
      await addGasPrice(price, "US National Average (Fallback)", true);
      process.exit(0);
    }

    const html = await response.text();

    // Parse the HTML to extract gas price data
    // AAA displays prices in a table format
    const regularRegex = /Regular.*?(\d+\.\d+)/i;
    const regularMatch = regularRegex.exec(html);

    if (regularMatch?.[1]) {
      const price = parseFloat(regularMatch[1]);
      console.log(`📊 Latest AAA gas price: $${price}`);

      await addGasPrice(
        price,
        "US National Average (AAA)",
        false,
        "Data from AAA (American Automobile Association)",
      );
    } else {
      console.log("⚠️  Could not parse AAA data, using fallback...");
      const price = 3.29;
      await addGasPrice(price, "US National Average (Fallback)", true);
    }

    console.log("🎉 Done!");
  } catch (error) {
    console.error("❌ Error fetching gas prices:", error);

    // Fallback on any error
    console.log("⚠️  Using fallback price...");
    const price = 3.29;
    await addGasPrice(
      price,
      "US National Average (Fallback)",
      true,
      "Fallback price used due to API error",
    );
  }

  process.exit(0);
}

async function addGasPrice(
  price: number,
  location: string,
  isFallback: boolean,
  notes?: string,
) {
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

  // Check if we already have a price entry today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [existingPrice] = await db
    .select()
    .from(priceEntries)
    .where(eq(priceEntries.essentialId, essentialId))
    .orderBy(priceEntries.createdAt)
    .limit(1);

  const shouldAdd =
    !existingPrice ||
    new Date(existingPrice.createdAt).getTime() < today.getTime();

  if (!shouldAdd && !isFallback) {
    console.log("ℹ️  Skipping: Already have a price entry for today");
    return;
  }

  // Add the price entry
  console.log("💰 Adding price entry...");
  await db.insert(priceEntries).values({
    essentialId: essentialId,
    location: location,
    notes: notes,
    price: price.toFixed(2),
  });

  console.log("✅ Price entry added successfully!");
}

void fetchGasPricesAAA();

