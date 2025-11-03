# Essentials Tracker API Documentation

## Database Schema

### Tables Created

1. **essentials** - Stores the essential items being tracked
   - `id` - Auto-incrementing primary key
   - `name` - Item name (e.g., "Regular Gasoline")
   - `category` - Category (e.g., "Fuel", "Dairy & Eggs")
   - `icon` - Emoji icon (e.g., "⛽")
   - `unit` - Unit of measurement (e.g., "per gallon")
   - `createdAt` - Timestamp when created
   - `updatedAt` - Timestamp when last updated
   - `createdById` - Reference to user who created it

2. **price_entries** - Stores historical price data
   - `id` - Auto-incrementing primary key
   - `essentialId` - Reference to essential item
   - `price` - Price as decimal (10,2)
   - `location` - Optional: Where price was observed
   - `notes` - Optional: Additional notes
   - `createdAt` - Timestamp when price was recorded
   - `createdById` - Reference to user who recorded it

## tRPC API Endpoints

All endpoints are available at `api.essential.*` in your tRPC client.

### 1. Create an Essential

```typescript
const essential = await api.essential.create.mutate({
  name: "Regular Gasoline",
  category: "Fuel",
  icon: "⛽",
  unit: "per gallon",
});
```

### 2. Get All Essentials

Returns all essentials with their latest price.

```typescript
const essentials = await api.essential.getAll.query();
// Returns: Array of essentials with latestPrice and latestPriceDate
```

### 3. Get Essential by ID

Get a single essential with its complete price history.

```typescript
const essential = await api.essential.getById.query({ id: 1 });
// Returns: Essential with priceHistory array
```

### 4. Update an Essential

```typescript
const updated = await api.essential.update.mutate({
  id: 1,
  name: "Premium Gasoline", // optional
  category: "Fuel", // optional
  icon: "⛽", // optional
  unit: "per gallon", // optional
});
```

### 5. Delete an Essential

```typescript
await api.essential.delete.mutate({ id: 1 });
// Note: This will cascade delete all associated price entries
```

### 6. Add a Price Entry

```typescript
const priceEntry = await api.essential.addPrice.mutate({
  essentialId: 1,
  price: 3.45,
  location: "Shell Station on Main St", // optional
  notes: "Price increased due to supply shortage", // optional
});
```

### 7. Get Price History

Get recent price history for an essential.

```typescript
const prices = await api.essential.getPriceHistory.query({
  essentialId: 1,
  limit: 30, // optional, defaults to 30
});
```

### 8. Get Statistics

Get calculated statistics for an essential (averages, percentage changes).

```typescript
const stats = await api.essential.getStats.query({ essentialId: 1 });
// Returns:
// {
//   currentPrice: "3.45",
//   avgPrice30d: "3.42",
//   change1h: "+0.5",    // percentage change
//   change24h: "+2.1",
//   change7d: "+5.8"
// }
```

## Seeding the Database

To populate your database with sample data:

1. First, sign in to your application
2. Get your user ID from the database (you can use `bun run db:studio` to view)
3. Run the seed script with your user ID:

```bash
SEED_USER_ID=your-user-id-here bun run db:seed
```

This will create:
- 10 sample essentials (Gasoline, Eggs, Milk, Bread, etc.)
- Current prices for each
- Historical prices (1 hour ago, 24 hours ago, 7 days ago)

## Example Usage in Components

### Fetching and Displaying Essentials

```typescript
"use client";

import { api } from "~/trpc/react";

export function EssentialsList() {
  const { data: essentials, isLoading } = api.essential.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {essentials?.map((essential) => (
        <div key={essential.id}>
          <span>{essential.icon}</span>
          <h3>{essential.name}</h3>
          <p>Category: {essential.category}</p>
          <p>Latest Price: ${essential.latestPrice}</p>
        </div>
      ))}
    </div>
  );
}
```

### Adding a New Price

```typescript
"use client";

import { api } from "~/trpc/react";

export function AddPriceForm({ essentialId }: { essentialId: number }) {
  const utils = api.useUtils();
  const addPrice = api.essential.addPrice.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      void utils.essential.getAll.invalidate();
      void utils.essential.getById.invalidate({ id: essentialId });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const price = parseFloat(formData.get("price") as string);
    
    addPrice.mutate({
      essentialId,
      price,
      location: formData.get("location") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="price" type="number" step="0.01" required />
      <input name="location" type="text" placeholder="Location (optional)" />
      <button type="submit">Add Price</button>
    </form>
  );
}
```

## Database Management

### View Database in Studio

```bash
bun run db:studio
```

### Generate New Migrations

After making schema changes:

```bash
bun run db:generate
```

### Push Schema Changes

```bash
bun run db:push
```

## Notes

- All prices are stored as NUMERIC(10,2) for precision
- Price entries are automatically deleted when their parent essential is deleted (CASCADE)
- Statistics calculations look back at historical data:
  - 1h change: Compares with price from 1 hour ago
  - 24h change: Compares with price from 24 hours ago
  - 7d change: Compares with price from 7 days ago
  - 30d average: Average of all prices in last 30 days
- All mutations require authentication (protected procedures)

