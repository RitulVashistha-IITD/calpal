import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { deleteAccount } from "../services/accountService";

const deleteSchema = z.object({ password: z.string().min(1).max(72) });

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.delete("/", validate(deleteSchema), async (req, res) => {
  await deleteAccount(req.userId as string, req.body.password);
  res.status(204).end();
});