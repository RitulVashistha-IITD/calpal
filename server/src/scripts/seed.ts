import mongoose from "mongoose";
import { env } from "../config/env";
import { FoodItem } from "../models/FoodItem";

const FOODS = [
  { name: "Gulab jamun (1)", calories: 150, joy: 9 },
  { name: "Kaju katli (1)", calories: 55, joy: 8 },
  { name: "Jalebi (1)", calories: 100, joy: 8 },
  { name: "Rasgulla (1)", calories: 125, joy: 7 },
  { name: "Besan ladoo (1)", calories: 180, joy: 8 },
  { name: "Soan papdi (1)", calories: 100, joy: 6 },
  { name: "Barfi (1)", calories: 120, joy: 7 },
  { name: "Samosa (1)", calories: 260, joy: 8 },
  { name: "Dark chocolate (2 squares)", calories: 60, joy: 6 },
  { name: "Ice cream (1 scoop)", calories: 140, joy: 8 },
  { name: "Roasted makhana (1 bowl)", calories: 100, joy: 4 },
  { name: "Apple", calories: 95, joy: 4 },
  { name: "Protein bar", calories: 200, joy: 5 },
  { name: "Masala chai with sugar", calories: 60, joy: 5 },
];

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  await FoodItem.deleteMany({ userId: null }); // replaces shared foods only, never a user's own
  await FoodItem.insertMany(FOODS.map((f) => ({ ...f, userId: null })));
  console.log(`Seeded ${FOODS.length} shared foods`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});