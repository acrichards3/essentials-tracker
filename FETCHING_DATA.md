# Fetching Real-World Data

This document explains how to automatically fetch real-world price data for essentials like gas prices.

## Gas Price Fetching Scripts

We provide three different scripts for fetching US national gas price data:

### 1. **AAA Gas Prices** (Recommended - No API Key Required)

Uses publicly available data from AAA (American Automobile Association).

```bash
SEED_USER_ID=your-user-id bun run fetch:gas
```

**Features:**

- ✅ No API key required
- ✅ Official data from AAA
- ✅ Daily US national average
- ✅ Automatic fallback if API is unavailable

**How it works:**

1. Fetches data from AAA's public website
2. Parses the national average price
3. Creates/updates "Regular Gasoline" essential
4. Adds price entry with today's date
5. Skips if already have a price for today

### 2. **EIA (Energy Information Administration)** (Most Accurate)

Uses official US government data from the EIA API.

```bash
SEED_USER_ID=your-user-id EIA_API_KEY=your-api-key bun run fetch:gas-eia
```

**Features:**

- ✅ Official US government data
- ✅ Most accurate and reliable
- ✅ Weekly data updates
- ❗ Requires free API key

**Setup:**

1. Register for a free API key at: https://www.eia.gov/opendata/register.php
2. Set your API key as an environment variable
3. Run the script

**How it works:**

1. Fetches weekly US regular gas price data from EIA
2. Gets the most recent price
3. Creates/updates "Regular Gasoline" essential
4. Adds price entry with official date
5. Skips if already have a recent price (within 6 days)

### 3. **Simple Fallback** (For Testing)

Uses simulated data for testing purposes.

```bash
SEED_USER_ID=your-user-id bun run fetch:gas-simple
```

**Features:**

- ✅ No API key required
- ✅ Works offline
- ⚠️ Uses simulated data around current averages
- 🔧 Good for development/testing

**Note:** This generates random prices around $3.25 ± $0.10. Not suitable for production use.

## Setting Up

### Step 1: Get Your User ID

1. Sign in to your application
2. Open the database studio:
   ```bash
   bun run db:studio
   ```
3. Navigate to the `users` table
4. Copy your user ID (it will be a UUID like: `abc123-def456-...`)

### Step 2: Run a Fetch Script

Choose one of the methods above and run it:

```bash
# Using AAA (recommended)
SEED_USER_ID=your-user-id-here bun run fetch:gas

# Using EIA (most accurate, requires API key)
SEED_USER_ID=your-user-id-here EIA_API_KEY=your-api-key-here bun run fetch:gas-eia

# Using simple fallback (testing only)
SEED_USER_ID=your-user-id-here bun run fetch:gas-simple
```

### Step 3: Set Up Environment Variables (Optional)

To avoid typing your user ID every time, add it to your `.env` file:

```bash
# Add to .env
SEED_USER_ID=your-user-id-here
EIA_API_KEY=your-api-key-here  # Optional, only for EIA script
```

Then you can run scripts without prefixing:

```bash
bun run fetch:gas
```

## Automating Price Updates

### Using Cron (Linux/Mac)

Set up a cron job to automatically fetch prices daily:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 9 AM
0 9 * * * cd /path/to/essentials-tracker && SEED_USER_ID=your-user-id bun run fetch:gas
```

### Using GitHub Actions (CI/CD)

Create `.github/workflows/fetch-gas-prices.yml`:

```yaml
name: Fetch Gas Prices

on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: "0 9 * * *"
  workflow_dispatch: # Allow manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Fetch gas prices
        env:
          SEED_USER_ID: ${{ secrets.SEED_USER_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: bun run fetch:gas
```

### Using Vercel Cron Jobs

If you're deploying on Vercel, you can use their cron jobs feature:

1. Create `/pages/api/cron/fetch-gas.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Verify the request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Run your fetch logic here
  // ... (import and run the fetch function)

  res.status(200).json({ success: true });
}
```

2. Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-gas",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Creating Additional Data Fetchers

Want to fetch data for other essentials? Use the gas price scripts as templates:

### Template Structure

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { essentials, priceEntries } from "../db/schema";

async function fetchYourData() {
  const userId = process.env.SEED_USER_ID;

  // 1. Fetch data from your API
  const response = await fetch("your-api-url");
  const data = await response.json();

  // 2. Find or create essential
  const [existingEssential] = await db
    .select()
    .from(essentials)
    .where(eq(essentials.name, "Your Item Name"))
    .limit(1);

  let essentialId: number;
  if (!existingEssential) {
    const [newEssential] = await db
      .insert(essentials)
      .values({
        name: "Your Item Name",
        category: "Your Category",
        icon: "🏷️",
        unit: "per unit",
        createdById: userId,
      })
      .returning();
    essentialId = newEssential!.id;
  } else {
    essentialId = existingEssential.id;
  }

  // 3. Add price entry
  await db.insert(priceEntries).values({
    essentialId: essentialId,
    price: yourPrice.toFixed(2),
    location: "Your Location",
    notes: "Your notes",
    createdById: userId,
  });
}

void fetchYourData();
```

## Troubleshooting

### "SEED_USER_ID is required"

Make sure you've signed in to your app and have a user account. Get your user ID from the database.

### "EIA_API_KEY is required"

You need to register for a free API key at https://www.eia.gov/opendata/register.php

### "Already have a price entry for today"

This is normal! The script prevents duplicate entries for the same day.

### API Returns 404/500

Try the fallback script (`fetch:gas-simple`) or wait and try again later.

## Data Sources

- **AAA Gas Prices**: https://gasprices.aaa.com/
- **EIA API**: https://www.eia.gov/opendata/
- **Bureau of Labor Statistics**: https://www.bls.gov/developers/ (for other essentials)
- **USDA**: https://www.ers.usda.gov/data-products/ (for food prices)

## Next Steps

- Set up automated daily fetches using cron or CI/CD
- Create fetchers for other essentials (eggs, milk, bread, etc.)
- Build a dashboard to visualize price trends
- Set up alerts for significant price changes
