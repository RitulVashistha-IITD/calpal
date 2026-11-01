import { Schema, model } from "mongoose";

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    heightCm: { type: Number, required: true, min: 100, max: 250 },
    weightKg: { type: Number, required: true, min: 30, max: 300 },
    weightDate: { type: String, required: true }, // "YYYY-MM-DD", when weightKg was last updated
    targetWeightKg: { type: Number, min: 30, max: 300 },
    age: { type: Number, required: true, min: 18, max: 90 },
    sex: { type: String, enum: ["male", "female", "other"], required: true },
    activity: { type: String, enum: ["sedentary", "light", "moderate"], required: true },
  },
  { timestamps: true }
);

export const Profile = model("Profile", profileSchema);