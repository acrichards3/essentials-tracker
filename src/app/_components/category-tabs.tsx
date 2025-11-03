"use client";

import { Button } from "~/components/ui/button";

const categories = [
  { count: 48, name: "All" },
  { count: 3, name: "Fuel" },
  { count: 8, name: "Dairy & Eggs" },
  { count: 12, name: "Meat" },
  { count: 15, name: "Produce" },
  { count: 6, name: "Bakery" },
  { count: 8, name: "Household" },
  { count: 6, name: "Beverages" },
];

export function CategoryTabs() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {categories.map((category, index) => (
        <Button
          className="whitespace-nowrap"
          key={category.name}
          size="sm"
          variant={index === 0 ? "default" : "outline"}
        >
          {category.name}
          <span className="bg-background/20 ml-2 rounded-full px-2 py-0.5 text-xs">
            {category.count}
          </span>
        </Button>
      ))}
    </div>
  );
}
