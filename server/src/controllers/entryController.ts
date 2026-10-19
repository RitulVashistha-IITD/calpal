import { RequestHandler } from "express";
import * as svc from "../services/entryService";
import { listQuerySchema, dateQuerySchema } from "../schemas/entries";
import { AppError } from "../middleware/errorHandler";

// requireAuth guarantees userId; this keeps TypeScript happy
const uid = (req: { userId?: string }) => req.userId as string;

export const list: RequestHandler = async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  res.status(200).json(await svc.listEntries(uid(req), query));
};
export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await svc.createEntry(uid(req), req.body));
};
export const update: RequestHandler = async (req, res) => {
  res.status(200).json(await svc.updateEntry(uid(req), String(req.params.id), req.body));
};
export const remove: RequestHandler = async (req, res) => {
  await svc.deleteEntry(uid(req), String(req.params.id));
  res.status(204).end();
};
export const stats: RequestHandler = async (req, res) => {
  const { date } = dateQuerySchema.parse(req.query);
  res.status(200).json(await svc.dailyStats(uid(req), date));
};
export const getGoal: RequestHandler = async (req, res) => {
  const goal = await svc.getGoal(uid(req));
  if (!goal) throw new AppError(404, "No goal set yet");
  res.status(200).json(goal);
};
export const putGoal: RequestHandler = async (req, res) => {
  res.status(200).json(await svc.saveGoal(uid(req), req.body));
};