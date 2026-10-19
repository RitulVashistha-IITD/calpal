import { Schema, model } from "mongoose";

const entrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["meal", "treat", "workout"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    calories: { type: Number, required: true, min: 1 },
    date: { type: String, required: true }, // "YYYY-MM-DD", avoids timezone bugs
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);
entrySchema.index({ userId: 1, date: -1 });

export const Entry = model("Entry", entrySchema);