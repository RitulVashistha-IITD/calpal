import { Schema, model } from "mongoose";

const foodSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    calories: { type: Number, required: true, min: 1, max: 3000 },
    joy: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true }
);
foodSchema.index({ userId: 1 });

export const FoodItem = model("FoodItem", foodSchema);