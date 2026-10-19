import { Schema, model } from "mongoose";

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    type: { type: String, enum: ["lose", "maintain", "gain"], required: true },
    dailyCalorieBudget: { type: Number, required: true, min: 800, max: 10000 },
    targetDate: { type: String },
    eventLabel: { type: String, trim: true, maxlength: 50 },
  },
  { timestamps: true }
);

export const Goal = model("Goal", goalSchema);