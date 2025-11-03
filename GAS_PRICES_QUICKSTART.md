# Gas Price Fetching - Quick Start

## TL;DR

Fetch real US national gas prices and add them to your database automatically!

```bash
# Get your user ID first (sign in, then run):
bun run db:studio

# Then fetch gas prices (easiest method - no API key needed):
SEED_USER_ID=your-user-id-here bun run fetch:gas
```

## What This Does

- ✅ Fetches current US national average gas price
- ✅ Creates "Regular Gasoline" essential if it doesn't exist
- ✅ Adds the price to your database with timestamp
- ✅ Prevents duplicate entries for the same day
- ✅ Works automatically - no manual data entry needed!

## Available Methods

### 1. AAA (Recommended - Default)
```bash
bun run fetch:gas
```
- No API key needed
- Uses AAA's public data
- Most reliable for daily use

### 2. EIA (Most Accurate - Government Data)
```bash
EIA_API_KEY=your-key bun run fetch:gas-eia
```
- Requires free API key from https://www.eia.gov/opendata/register.php
- Official US government data
- Weekly updates

### 3. Simple (Testing Only)
```bash
bun run fetch:gas-simple
```
- Generates simulated data
- Good for testing/development
- No API calls

## First Time Setup

1. **Sign in to your app** to create a user account

2. **Get your user ID:**
   ```bash
   bun run db:studio
   # Look in the 'users' table and copy your ID
   ```

3. **Add to `.env` file (optional):**
   ```bash
   SEED_USER_ID=your-user-id-here
   ```

4. **Run the fetch script:**
   ```bash
   bun run fetch:gas
   ```

## What You'll See

```
⛽ Fetching US national gas prices from AAA...
🌐 Calling AAA Gas Prices API...
📊 Latest AAA gas price: $3.29
✅ Found existing 'Regular Gasoline' essential
💰 Adding price entry...
✅ Price entry added successfully!
🎉 Done!
```

## View Your Data

### In Database Studio
```bash
bun run db:studio
```
- Browse to `essentials` table to see your gas item
- Browse to `price_entries` table to see the price history

### In Your App
Use the tRPC API to display the data:

```typescript
import { api } from "~/trpc/react";

function GasPrice() {
  const { data } = api.essential.getAll.useQuery();
  const gas = data?.find(e => e.name === "Regular Gasoline");
  
  return <div>Gas: ${gas?.latestPrice}</div>;
}
```

## Automating Daily Fetches

### Option 1: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM)
0 9 * * * cd /path/to/essentials-tracker && SEED_USER_ID=your-id bun run fetch:gas
```

### Option 2: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to Daily at 9:00 AM
4. Action: Start a program
   - Program: `bun`
   - Arguments: `run fetch:gas`
   - Start in: `C:\path\to\essentials-tracker`

### Option 3: GitHub Actions (Free)
Create `.github/workflows/fetch-gas.yml`:

```yaml
name: Daily Gas Prices
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run fetch:gas
        env:
          SEED_USER_ID: ${{ secrets.SEED_USER_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Troubleshooting

### "SEED_USER_ID is required"
- You need to sign in to your app first
- Get your user ID from the database studio

### "Already have a price entry for today"
- This is normal! The script won't create duplicates
- Try again tomorrow, or check your database to see the entry

### Script hangs or errors
- Try the simple fallback: `bun run fetch:gas-simple`
- Check your internet connection
- Make sure your database is running

## Next Steps

- Set up automated daily fetches
- Create similar scripts for other essentials (eggs, milk, etc.)
- Build a UI to display price trends
- Add price alerts for significant changes

For more details, see: `FETCHING_DATA.md`

