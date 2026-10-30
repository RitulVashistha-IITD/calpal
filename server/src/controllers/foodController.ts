import { RequestHandler } from "express";
import * as svc from "../services/foodService";

const uid = (req: { userId?: string }) => req.userId as string;

export const list: RequestHandler = async (req, res) => {
  res.status(200).json(await svc.listFoods(uid(req)));
};
export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await svc.createFood(uid(req), req.body));
};
export const optimize: RequestHandler = async (req, res) => {
  res.status(200).json(await svc.optimize(uid(req), req.body));
};