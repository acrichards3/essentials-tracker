import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { essentials, priceEntries } from "../db/schema";

/**
 * Fetches last 5 years of US national average gas prices from EIA
 * (Energy Information Administration)
 * This will populate your database with historical data for trend analysis
 */

interface EIAResponse {
  response: {
    data: Array<{
      period: string; // Date in YYYY-MM-DD format
      value: string; // Price in dollars (returned as string from API)
    }>;
    total?: number;
  };
}

async function fetchHistoricalGasPrices() {
  console.log("⛽ Fetching 5 years of historical US gas prices...");

  const apiKey = process.env.EIA_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: EIA_API_KEY environment variable is required.");
    console.log(
      "   Get a free API key from: https://www.eia.gov/opendata/register.php",
    );
    console.log("   Then run: EIA_API_KEY=your-key bun run fetch:gas-historical");
    process.exit(1);
  }

  try {
    // Calculate date 5 years ago
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const startDate = fiveYearsAgo.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`📅 Fetching data from ${startDate} to present...`);

    // EIA API v2 endpoint for petroleum prices
    // Query for Regular Gasoline (EPM0U = All formulations), Retail (PTE), U.S. National (NUS)
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPM0U&facets[duoarea][]=NUS&facets[process][]=PTE&start=${startDate}&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=5000`;

    console.log("🌐 Calling EIA API...");

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `EIA API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as EIAResponse;

    // Log the response for debugging
    console.log("API Response structure:", {
      dataLength: data.response?.data?.length ?? 0,
      hasData: !!data.response?.data,
      hasResponse: !!data.response,
      total: data.response?.total,
    });

    if (!data.response?.data || data.response.data.length === 0) {
      console.error("Full API response:", JSON.stringify(data, null, 2));
      throw new Error(
        "No data returned from EIA API. Check the API response above.",
      );
    }

    console.log(`📊 Received ${data.response.data.length} price data points`);

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

    // Get existing price entry dates to avoid duplicates
    console.log("🔍 Checking for existing entries...");
    const existingEntries = await db
      .select({
        createdAt: priceEntries.createdAt,
      })
      .from(priceEntries)
      .where(eq(priceEntries.essentialId, essentialId));

    const existingDates = new Set(
      existingEntries.map((e) => e.createdAt.toISOString().split("T")[0]),
    );

    console.log(`📝 Found ${existingDates.size} existing entries`);

    // Filter out entries we already have
    const newPriceData = data.response.data.filter((item) => {
      return !existingDates.has(item.period);
    });

    if (newPriceData.length === 0) {
      console.log("ℹ️  No new data to add - all historical data already exists!");
      console.log("🎉 Done!");
      process.exit(0);
    }

    console.log(`💾 Adding ${newPriceData.length} new price entries...`);

    // Batch insert in chunks of 100 to avoid overwhelming the database
    const chunkSize = 100;
    let inserted = 0;

    for (let i = 0; i < newPriceData.length; i += chunkSize) {
      const chunk = newPriceData.slice(i, i + chunkSize);

      const priceEntriesToInsert = chunk.map((item) => ({
        createdAt: new Date(item.period),
        essentialId: essentialId,
        location: "US National Average",
        notes: "Historical data from EIA (Energy Information Administration)",
        price: item.value, // API already returns string in correct format
      }));

      await db.insert(priceEntries).values(priceEntriesToInsert);

      inserted += chunk.length;
      const progress = Math.round((inserted / newPriceData.length) * 100);
      console.log(`   Progress: ${inserted}/${newPriceData.length} (${progress}%)`);
    }

    console.log(`✅ Successfully added ${inserted} price entries!`);
    console.log("\n📈 Summary:");
    console.log(`   Total data points: ${data.response.data.length}`);
    console.log(`   Already existed: ${existingDates.size}`);
    console.log(`   Newly added: ${inserted}`);
    console.log(`   Date range: ${newPriceData[0]?.period} to ${newPriceData[newPriceData.length - 1]?.period}`);
    console.log("\n🎉 Done! Your database is now populated with 5 years of gas price history.");
  } catch (error) {
    console.error("❌ Error fetching gas prices:", error);
    process.exit(1);
  }

  process.exit(0);
}

void fetchHistoricalGasPrices();

