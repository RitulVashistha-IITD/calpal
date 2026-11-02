import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Entry } from "../models/Entry";
import { Goal } from "../models/Goal";
import { Profile } from "../models/Profile";
import { FoodItem } from "../models/FoodItem";
import { AppError } from "../middleware/errorHandler";

export async function deleteAccount(userId: string, password: string) {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new AppError(404, "Account not found");

  // 403, not 401: the client treats any 401 on a protected call as "session expired" and logs you out
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(403, "That password doesn't match");
  }

  // Everything the user owns. Shared starter foods have userId null, so they're never touched.
  await Promise.all([
    Entry.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Profile.deleteMany({ userId }),
    FoodItem.deleteMany({ userId }),
  ]);
  // The user goes last, so if anything above fails you can simply try again
  await User.deleteOne({ _id: userId });
}