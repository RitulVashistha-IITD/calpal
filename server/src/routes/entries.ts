import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createEntrySchema, updateEntrySchema } from "../schemas/entries";
import * as ctrl from "../controllers/entryController";

export const entriesRouter = Router();
entriesRouter.use(requireAuth);
entriesRouter.get("/", ctrl.list);
entriesRouter.post("/", validate(createEntrySchema), ctrl.create);
entriesRouter.patch("/:id", validate(updateEntrySchema), ctrl.update);
entriesRouter.delete("/:id", ctrl.remove);