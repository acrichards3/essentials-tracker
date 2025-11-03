import { z } from "zod";
import { desc, eq, sql, and, gte } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { essentials, priceEntries } from "~/server/db/schema";

export const essentialRouter = createTRPCRouter({
  // Add a price entry for an essential
  addPrice: publicProcedure
    .input(
      z.object({
        essentialId: z.number(),
        location: z.string().max(256).optional(),
        notes: z.string().optional(),
        price: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [priceEntry] = await ctx.db
        .insert(priceEntries)
        .values({
          essentialId: input.essentialId,
          location: input.location,
          notes: input.notes,
          price: input.price.toFixed(2),
        })
        .returning();

      return priceEntry;
    }),

  // Create a new essential item
  create: publicProcedure
    .input(
      z.object({
        category: z.string().min(1).max(100),
        icon: z.string().max(10).default("📦"),
        name: z.string().min(1).max(256),
        unit: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [essential] = await ctx.db
        .insert(essentials)
        .values({
          category: input.category,
          icon: input.icon,
          name: input.name,
          unit: input.unit,
        })
        .returning();

      return essential;
    }),

  // Delete an essential (will cascade delete price entries)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(essentials).where(eq(essentials.id, input.id));
      return { success: true };
    }),

  // Get all essentials with their latest price
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allEssentials = await ctx.db
      .select({
        category: essentials.category,
        createdAt: essentials.createdAt,
        icon: essentials.icon,
        id: essentials.id,
        name: essentials.name,
        unit: essentials.unit,
      })
      .from(essentials)
      .orderBy(essentials.name);

    // Get latest price for each essential
    const essentialsWithPrices = await Promise.all(
      allEssentials.map(async (essential) => {
        const [latestPrice] = await ctx.db
          .select({
            createdAt: priceEntries.createdAt,
            price: priceEntries.price,
          })
          .from(priceEntries)
          .where(eq(priceEntries.essentialId, essential.id))
          .orderBy(desc(priceEntries.createdAt))
          .limit(1);

        return {
          ...essential,
          latestPrice: latestPrice?.price ?? null,
          latestPriceDate: latestPrice?.createdAt ?? null,
        };
      }),
    );

    return essentialsWithPrices;
  }),

  // Get a single essential with price history
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [essential] = await ctx.db
        .select()
        .from(essentials)
        .where(eq(essentials.id, input.id))
        .limit(1);

      if (!essential) {
        throw new Error("Essential not found");
      }

      const prices = await ctx.db
        .select()
        .from(priceEntries)
        .where(eq(priceEntries.essentialId, input.id))
        .orderBy(desc(priceEntries.createdAt));

      return {
        ...essential,
        priceHistory: prices,
      };
    }),

  // Get price history for an essential
  getPriceHistory: publicProcedure
    .input(
      z.object({
        essentialId: z.number(),
        limit: z.number().min(1).max(100).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const prices = await ctx.db
        .select()
        .from(priceEntries)
        .where(eq(priceEntries.essentialId, input.essentialId))
        .orderBy(desc(priceEntries.createdAt))
        .limit(input.limit);

      return prices;
    }),

  // Get statistics for an essential (avg price, recent changes, etc.)
  getStats: publicProcedure
    .input(z.object({ essentialId: z.number() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get latest price
      const [latestPrice] = await ctx.db
        .select()
        .from(priceEntries)
        .where(eq(priceEntries.essentialId, input.essentialId))
        .orderBy(desc(priceEntries.createdAt))
        .limit(1);

      if (!latestPrice) {
        return null;
      }

      // Get price from 1 hour ago
      const [priceOneHourAgo] = await ctx.db
        .select()
        .from(priceEntries)
        .where(
          and(
            eq(priceEntries.essentialId, input.essentialId),
            gte(priceEntries.createdAt, oneHourAgo),
          ),
        )
        .orderBy(priceEntries.createdAt)
        .limit(1);

      // Get price from 24 hours ago
      const [priceOneDayAgo] = await ctx.db
        .select()
        .from(priceEntries)
        .where(
          and(
            eq(priceEntries.essentialId, input.essentialId),
            gte(priceEntries.createdAt, oneDayAgo),
          ),
        )
        .orderBy(priceEntries.createdAt)
        .limit(1);

      // Get price from 7 days ago
      const [priceSevenDaysAgo] = await ctx.db
        .select()
        .from(priceEntries)
        .where(
          and(
            eq(priceEntries.essentialId, input.essentialId),
            gte(priceEntries.createdAt, sevenDaysAgo),
          ),
        )
        .orderBy(priceEntries.createdAt)
        .limit(1);

      // Get average price over last 30 days
      const [avgPriceResult] = await ctx.db
        .select({
          avg: sql<string>`AVG(${priceEntries.price})::numeric(10,2)`,
        })
        .from(priceEntries)
        .where(
          and(
            eq(priceEntries.essentialId, input.essentialId),
            gte(priceEntries.createdAt, thirtyDaysAgo),
          ),
        );

      const calculateChange = (
        current: string,
        previous: string | undefined,
      ) => {
        if (!previous) return null;
        const curr = parseFloat(current);
        const prev = parseFloat(previous);
        const change = ((curr - prev) / prev) * 100;
        return change.toFixed(2);
      };

      return {
        avgPrice30d: avgPriceResult?.avg ?? null,
        change1h: calculateChange(latestPrice.price, priceOneHourAgo?.price),
        change7d: calculateChange(
          latestPrice.price,
          priceSevenDaysAgo?.price,
        ),
        change24h: calculateChange(latestPrice.price, priceOneDayAgo?.price),
        currentPrice: latestPrice.price,
      };
    }),

  // Update an essential
  update: publicProcedure
    .input(
      z.object({
        category: z.string().min(1).max(100).optional(),
        icon: z.string().max(10).optional(),
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        unit: z.string().min(1).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updated] = await ctx.db
        .update(essentials)
        .set(updateData)
        .where(eq(essentials.id, id))
        .returning();

      return updated;
    }),
});
