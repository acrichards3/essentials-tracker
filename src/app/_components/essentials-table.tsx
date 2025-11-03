"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// Mock data for essentials
const essentials = [
  {
    avgPrice: "$3.42",
    category: "Fuel",
    change1h: "+0.5%",
    change7d: "+5.8%",
    change24h: "+2.1%",
    icon: "⛽",
    isPositive1h: false,
    isPositive7d: false,
    isPositive24h: false,
    name: "Regular Gasoline",
    price: "$3.45",
    rank: 1,
    unit: "per gallon",
  },
  {
    avgPrice: "$3.89",
    category: "Dairy & Eggs",
    change1h: "+0.1%",
    change7d: "+12.4%",
    change24h: "+1.2%",
    icon: "🥚",
    isPositive1h: false,
    isPositive7d: false,
    isPositive24h: false,
    name: "Eggs (Dozen)",
    price: "$4.32",
    rank: 2,
    unit: "per dozen",
  },
  {
    avgPrice: "$3.96",
    category: "Dairy & Eggs",
    change1h: "0.0%",
    change7d: "+0.8%",
    change24h: "+0.2%",
    icon: "🥛",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: false,
    name: "Whole Milk",
    price: "$3.99",
    rank: 3,
    unit: "per gallon",
  },
  {
    avgPrice: "$2.83",
    category: "Bakery",
    change1h: "0.0%",
    change7d: "+2.1%",
    change24h: "+0.5%",
    icon: "🍞",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: false,
    name: "White Bread",
    price: "$2.89",
    rank: 4,
    unit: "per loaf",
  },
  {
    avgPrice: "$8.95",
    category: "Household",
    change1h: "0.0%",
    change7d: "+1.2%",
    change24h: "-0.3%",
    icon: "🧻",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: true,
    name: "Toilet Paper (12 rolls)",
    price: "$8.99",
    rank: 5,
    unit: "per pack",
  },
  {
    avgPrice: "$5.31",
    category: "Meat",
    change1h: "+0.2%",
    change7d: "+4.2%",
    change24h: "+1.8%",
    icon: "🥩",
    isPositive1h: false,
    isPositive7d: false,
    isPositive24h: false,
    name: "Ground Beef",
    price: "$5.49",
    rank: 6,
    unit: "per pound",
  },
  {
    avgPrice: "$3.87",
    category: "Meat",
    change1h: "0.0%",
    change7d: "+3.1%",
    change24h: "+0.8%",
    icon: "🍗",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: false,
    name: "Chicken Breast",
    price: "$3.99",
    rank: 7,
    unit: "per pound",
  },
  {
    avgPrice: "$4.27",
    category: "Grains",
    change1h: "0.0%",
    change7d: "+0.5%",
    change24h: "0.0%",
    icon: "🍚",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: true,
    name: "Rice (5 lb)",
    price: "$4.29",
    rank: 8,
    unit: "per bag",
  },
  {
    avgPrice: "$0.60",
    category: "Produce",
    change1h: "0.0%",
    change7d: "-1.2%",
    change24h: "+0.1%",
    icon: "🍌",
    isPositive1h: true,
    isPositive7d: true,
    isPositive24h: false,
    name: "Bananas",
    price: "$0.59",
    rank: 9,
    unit: "per pound",
  },
  {
    avgPrice: "$5.96",
    category: "Beverages",
    change1h: "0.0%",
    change7d: "+0.8%",
    change24h: "0.0%",
    icon: "💧",
    isPositive1h: true,
    isPositive7d: false,
    isPositive24h: true,
    name: "Bottled Water (24 pack)",
    price: "$5.99",
    rank: 10,
    unit: "per pack",
  },
];

export function EssentialsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">1h %</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right">7d %</TableHead>
            <TableHead className="text-right">Avg Price (30d)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {essentials.map((item) => (
            <TableRow className="hover:bg-muted/50" key={item.rank}>
              <TableCell className="font-medium">{item.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {item.price}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    item.isPositive1h ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.change1h}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    item.isPositive24h ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.change24h}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    item.isPositive7d ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.change7d}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-right">
                {item.avgPrice}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  Track
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
