import { db } from "./index";
import { essentials, priceEntries } from "./schema";

// Sample essentials data
const sampleEssentials = [
  {
    category: "Fuel",
    icon: "⛽",
    name: "Regular Gasoline",
    unit: "per gallon",
  },
  {
    category: "Dairy & Eggs",
    icon: "🥚",
    name: "Eggs (Dozen)",
    unit: "per dozen",
  },
  {
    category: "Dairy & Eggs",
    icon: "🥛",
    name: "Whole Milk",
    unit: "per gallon",
  },
  {
    category: "Bakery",
    icon: "🍞",
    name: "White Bread",
    unit: "per loaf",
  },
  {
    category: "Household",
    icon: "🧻",
    name: "Toilet Paper (12 rolls)",
    unit: "per pack",
  },
  {
    category: "Meat",
    icon: "🥩",
    name: "Ground Beef",
    unit: "per pound",
  },
  {
    category: "Meat",
    icon: "🍗",
    name: "Chicken Breast",
    unit: "per pound",
  },
  {
    category: "Grains",
    icon: "🍚",
    name: "Rice (5 lb)",
    unit: "per bag",
  },
  {
    category: "Produce",
    icon: "🍌",
    name: "Bananas",
    unit: "per pound",
  },
  {
    category: "Beverages",
    icon: "💧",
    name: "Bottled Water (24 pack)",
    unit: "per pack",
  },
];

// Sample prices for each essential (current prices)
const samplePrices = [
  3.45, // Gasoline
  4.32, // Eggs
  3.99, // Milk
  2.89, // Bread
  8.99, // Toilet Paper
  5.49, // Ground Beef
  3.99, // Chicken Breast
  4.29, // Rice
  0.59, // Bananas
  5.99, // Bottled Water
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // You need to provide a valid user ID
    // Get this from your database after signing in
    const userId = process.env.SEED_USER_ID;

    if (!userId) {
      console.error(
        "❌ Error: SEED_USER_ID environment variable is required.",
      );
      console.log(
        "   Sign in to your app first, then run:",
      );
      console.log(
        "   SEED_USER_ID=your-user-id bun run tsx src/server/db/seed.ts",
      );
      process.exit(1);
    }

    console.log(`📝 Using user ID: ${userId}`);

    // Insert essentials
    console.log("📦 Creating essentials...");
    const createdEssentials = await db
      .insert(essentials)
      .values(
        sampleEssentials.map((essential) => ({
          ...essential,
          createdById: userId,
        })),
      )
      .returning();

    console.log(`✅ Created ${createdEssentials.length} essentials`);

    // Insert current prices
    console.log("💰 Adding current prices...");
    const priceEntriesToInsert = createdEssentials.map((essential, index) => ({
      createdById: userId,
      essentialId: essential.id,
      location: "Sample Store",
      price: samplePrices[index]!.toFixed(2),
    }));

    await db.insert(priceEntries).values(priceEntriesToInsert);

    console.log(`✅ Added ${priceEntriesToInsert.length} price entries`);

    // Add some historical prices (7 days ago, 24 hours ago, 1 hour ago)
    console.log("📊 Adding historical prices...");
    const historicalPrices = [];

    for (let i = 0; i < createdEssentials.length; i++) {
      const essential = createdEssentials[i]!;
      const basePrice = samplePrices[i]!;

      // 7 days ago (slightly lower price)
      historicalPrices.push({
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdById: userId,
        essentialId: essential.id,
        location: "Sample Store",
        price: (basePrice * 0.95).toFixed(2),
      });

      // 24 hours ago (slightly lower price)
      historicalPrices.push({
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdById: userId,
        essentialId: essential.id,
        location: "Sample Store",
        price: (basePrice * 0.98).toFixed(2),
      });

      // 1 hour ago (almost same price)
      historicalPrices.push({
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        createdById: userId,
        essentialId: essential.id,
        location: "Sample Store",
        price: (basePrice * 0.995).toFixed(2),
      });
    }

    await db.insert(priceEntries).values(historicalPrices);

    console.log(`✅ Added ${historicalPrices.length} historical price entries`);

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

void seed();

